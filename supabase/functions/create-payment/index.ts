// @ts-nocheck
import { serve } from "std/http/server.ts"
import { createClient } from 'supabase'

/**
 * create-payment
 * 
 * Recebe os dados do agendamento, cria o booking no Supabase,
 * e gera uma preferência de pagamento no Mercado Pago (Checkout Pro).
 * 
 * Retorna { init_point, booking_id } para o frontend redirecionar.
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN') ?? ''
const APP_URL = Deno.env.get('APP_URL') ?? 'https://nomadflow.com.br'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
    console.log(`[create-payment] Requisição recebida: ${req.method}`)

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    try {
        // 1. Parse do payload
        const body = await req.json()
        const { slot_id, name, email, whatsapp } = body

        if (!slot_id || !name || !email || !whatsapp) {
            return new Response(
                JSON.stringify({ error: 'Dados incompletos. slot_id, name, email e whatsapp são obrigatórios.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`[create-payment] Iniciando booking para ${email}`)

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 2. Buscar o slot para obter horário e preço
        const { data: slot, error: slotError } = await supabase
            .from('consultation_slots')
            .select('*')
            .eq('id', slot_id)
            .eq('is_booked', false)
            .single()

        if (slotError || !slot) {
            console.error('[create-payment] Slot não encontrado ou já reservado:', slotError)
            return new Response(
                JSON.stringify({ error: 'Horário não disponível. Por favor, escolha outro.' }),
                { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 3. Criar o booking no Supabase (status: pending)
        const { data: booking, error: bookingError } = await supabase
            .from('consultation_bookings')
            .insert([{
                slot_id,
                name,
                email,
                whatsapp,
                payment_status: 'pending'
            }])
            .select()
            .single()

        if (bookingError || !booking) {
            console.error('[create-payment] Erro ao criar booking:', bookingError)
            return new Response(
                JSON.stringify({ error: 'Erro ao registrar agendamento. Tente novamente.' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`[create-payment] Booking criado: ${booking.id}`)

        // 4. Marcar o slot como reservado (reserva temporária)
        await supabase
            .from('consultation_slots')
            .update({ is_booked: true })
            .eq('id', slot_id)

        // 5. Montar a preferência de pagamento no Mercado Pago
        const startTime = new Date(slot.start_time)
        const dateStr = startTime.toLocaleDateString('pt-BR', {
            timeZone: 'Europe/Madrid',
            day: '2-digit', month: '2-digit', year: 'numeric'
        })
        const timeStr = startTime.toLocaleTimeString('pt-BR', {
            timeZone: 'Europe/Madrid',
            hour: '2-digit', minute: '2-digit'
        })

        const preference = {
            items: [
                {
                    id: booking.id,
                    title: `Orientação Estratégica para Nômade Digital — ${dateStr} às ${timeStr} (Madri)`,
                    description: 'Sessão de orientação estratégica sobre imigração para a Espanha via Google Meet',
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: Number(slot.price)
                }
            ],
            payer: {
                name: name,
                email: email
            },
            payment_methods: {
                excluded_payment_types: [
                    { id: "ticket" } // Exclui pagamentos por boleto e lotéricas
                ],
                excluded_payment_methods: [
                    { id: "pec" } // Tenta excluir especificamente o débito virtual da Caixa
                ]
            },
            external_reference: booking.id,
            back_urls: {
                success: `${APP_URL}/agendamento/sucesso?booking_id=${booking.id}&status=approved`,
                failure: `${APP_URL}/agendamento?error=payment_failed`,
                pending: `${APP_URL}/agendamento/sucesso?booking_id=${booking.id}&status=pending`
            },
            auto_return: 'approved',
            statement_descriptor: 'NomadFlow',
            notification_url: `${SUPABASE_URL}/functions/v1/mp-webhook`,
        }

        console.log(`[create-payment] Criando preferência MP para booking ${booking.id}`)

        // 6. Chamar a API do Mercado Pago
        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preference)
        })

        if (!mpResponse.ok) {
            const mpError = await mpResponse.text()
            console.error('[create-payment] Erro na API do Mercado Pago:', mpError)

            // Reverter: desmarcar slot e deletar booking
            await supabase.from('consultation_slots').update({ is_booked: false }).eq('id', slot_id)
            await supabase.from('consultation_bookings').delete().eq('id', booking.id)

            return new Response(
                JSON.stringify({ error: 'Erro ao criar pagamento. Tente novamente.' }),
                { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const mpData = await mpResponse.json()
        console.log(`[create-payment] Preferência criada! ID: ${mpData.id}`)

        // 7. Salvar o preference ID no booking
        await supabase
            .from('consultation_bookings')
            .update({ payment_id: mpData.id })
            .eq('id', booking.id)

        // 8. Retornar ao frontend
        return new Response(
            JSON.stringify({
                success: true,
                booking_id: booking.id,
                init_point: mpData.init_point,           // Checkout Pro (produção)
                sandbox_init_point: mpData.sandbox_init_point // Checkout Pro (teste)
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('[create-payment] Erro fatal:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

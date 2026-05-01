import { serve } from "std/http/server.ts"

/**
 * create-platform-payment
 * 
 * Gera uma preferência de pagamento no Mercado Pago para assinatura da Plataforma NomadFlow.
 * Recebe user_id, name e email.
 * O external_reference será o user_id para liberação automática.
 */

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN') ?? ''
const APP_URL = Deno.env.get('APP_URL') ?? 'https://nomadflow.com.br'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
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
        const body = await req.json()
        console.log('[create-platform-payment] Payload recebido:', JSON.stringify(body))
        const { user_id, name, email, coupon } = body

        if (!user_id || !email) {
            console.error('[create-platform-payment] Erro: Dados ausentes no payload.')
            return new Response(
                JSON.stringify({ 
                    error: 'Dados incompletos. user_id e email são obrigatórios.',
                    received: { user_id, email }
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`[create-platform-payment] Criando link de pagamento para usuário: ${email} (ID: ${user_id})`)

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        
        let unitPrice = 649.00; // Preço base padrão

        // Lógica de Cupom e transição de preço (Cenário A)
        // O preço base é 649, se bater os 10 do NOMAD10, o preço base vira 1259.
        
        // Primeiro, vamos verificar o estado do cupom NOMAD10 (mesmo se o usuário não enviou o cupom, 
        // nós usamos ele para saber se a promoção acabou e o preço deve ir para 1259).
        const { data: nomadCoupon } = await supabase
            .from('coupons')
            .select('used_count, max_uses')
            .eq('code', 'NOMAD10')
            .single()

        let promotionEnded = false;
        if (nomadCoupon && nomadCoupon.used_count >= nomadCoupon.max_uses) {
            promotionEnded = true;
            unitPrice = 1259.00; // Promoção acabou, novo preço base
        }

        let appliedCouponCode = null;

        if (coupon && !promotionEnded) {
            const normalizedCoupon = coupon.trim().toUpperCase();
            const { data: couponData, error: couponError } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', normalizedCoupon)
                .eq('active', true)
                .single()

            if (!couponError && couponData) {
                if (couponData.used_count < couponData.max_uses) {
                    const discountMultiplier = (100 - couponData.discount_percent) / 100;
                    unitPrice = unitPrice * discountMultiplier;
                    appliedCouponCode = normalizedCoupon;
                    console.log(`[create-platform-payment] Cupom ${appliedCouponCode} aplicado! Novo preço: ${unitPrice}`);
                } else {
                    console.log(`[create-platform-payment] Cupom ${normalizedCoupon} esgotado.`);
                }
            } else {
                console.log(`[create-platform-payment] Cupom ${normalizedCoupon} inválido ou inativo.`);
            }
        }

        const preference = {
            items: [
                {
                    id: 'anual',
                    title: 'Acesso Elite Anual - NomadFlow',
                    description: 'Acesso total à plataforma NomadFlow por 1 ano',
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: unitPrice 
                }
            ],
            payer: {
                name: name || 'Nômade',
                email: email
            },
            payment_methods: {
                excluded_payment_types: [
                    { id: "ticket" } // Exclui boleto para evitar pendências
                ]
            },
            external_reference: user_id, 
            metadata: {
                coupon_code: appliedCouponCode // Passando o cupom no metadata para o webhook
            },
            back_urls: {
                success: `${APP_URL}/?transaction=success`,
                failure: `${APP_URL}`,
                pending: `${APP_URL}/?transaction=pending`
            },
            auto_return: 'approved',
            statement_descriptor: 'NomadFlow',
            notification_url: `${SUPABASE_URL}/functions/v1/mp-platform-webhook`,
        }

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
            console.error('[create-platform-payment] Erro na API do Mercado Pago:', mpError)
            return new Response(
                JSON.stringify({ error: 'Erro ao criar pagamento com Mercado Pago.' }),
                { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const mpData = await mpResponse.json()
        console.log(`[create-platform-payment] Preferência criada com sucesso! ID: ${mpData.id}`)

        return new Response(
            JSON.stringify({
                success: true,
                init_point: mpData.init_point,           // Checkout Pro para produção
                sandbox_init_point: mpData.sandbox_init_point // Checkout Pro para testes
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('[create-platform-payment] Erro fatal:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

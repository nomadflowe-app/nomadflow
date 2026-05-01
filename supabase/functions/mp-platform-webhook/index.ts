// @ts-nocheck
import { serve } from "std/http/server.ts"
import { createClient } from 'supabase'

/**
 * mp-platform-webhook
 *
 * Recebe notificações de pagamento do Mercado Pago para a Plataforma NomadFlow.
 * O `external_reference` neste caso é o `user_id` do usuário.
 * Libera ou revoga o acesso ('anual') na tabela `profiles`.
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN') ?? ''

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        console.log(`[mp-platform-webhook] Requisição recebida! URL: ${req.url} - Método: ${req.method}`)

        let paymentId: string | null = null
        let topic = url.searchParams.get('topic') ?? ''

        // 2. Extrair o ID do Pagamento dependendo do tipo de IPN que o MP enviou
        const contentType = req.headers.get('content-type') ?? ''
        if (contentType.includes('application/json')) {
            try {
                const body = await req.json()
                if (body.type === 'payment' && body.data?.id) {
                    paymentId = String(body.data.id)
                    topic = 'payment'
                } else if (body.action?.startsWith('payment.')) {
                    paymentId = String(body.data?.id)
                    topic = 'payment'
                }
            } catch (e) { /* ignore parse error */ }
        }

        if (!paymentId) {
            paymentId = url.searchParams.get('id') ?? url.searchParams.get('data.id')
            topic = url.searchParams.get('topic') ?? topic
        }

        // Se não for evento de pagamento, apenas retorna 200 pro MP parar de mandar
        if (!paymentId || topic !== 'payment') {
            return new Response(JSON.stringify({ received: true }), { status: 200, headers: corsHeaders })
        }

        console.log(`[mp-platform-webhook] Processando Pagamento ID: ${paymentId}`)

        // 3. Buscar os detalhes completos do pagamento na API do Mercado Pago
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
        })

        if (!mpRes.ok) {
            console.error('[mp-platform-webhook] Erro ao buscar dados do pagamento no Mercado Pago')
            throw new Error('MP API error')
        }

        const payment = await mpRes.json()
        const userId = payment.external_reference // A referência que passamos no checkout

        if (!userId) {
            console.error('[mp-platform-webhook] external_reference (user_id) ausente no payload do Mercado Pago')
            return new Response('No reference', { status: 200 })
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        
        console.log(`[mp-platform-webhook] Status: ${payment.status}, Usuário ID alvo: ${userId}`)

        // 4. Lógica de Liberação de Acesso
        if (payment.status === 'approved' || payment.status === 'authorized') {
            console.log(`[mp-platform-webhook] Iniciando LIBERAÇÃO para user_id: ${userId}`)

            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    tier: 'anual',
                    subscription_status: 'active',
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)

            if (updateError) {
                console.error('[mp-platform-webhook] Erro ao atualizar tabela de perfis:', updateError)
                throw updateError
            }
            console.log(`[mp-platform-webhook] Acesso ANO liberado com sucesso para ${userId}`)

            // Lógica para incrementar o contador do cupom, se houver
            if (payment.metadata && payment.metadata.coupon_code) {
                const appliedCoupon = payment.metadata.coupon_code;
                console.log(`[mp-platform-webhook] Incrementando uso do cupom: ${appliedCoupon}`);
                
                const { data: couponData, error: couponFetchError } = await supabaseAdmin
                    .from('coupons')
                    .select('used_count')
                    .eq('code', appliedCoupon)
                    .single();
                    
                if (couponData && !couponFetchError) {
                    await supabaseAdmin
                        .from('coupons')
                        .update({ used_count: couponData.used_count + 1 })
                        .eq('code', appliedCoupon);
                } else {
                    console.error('[mp-platform-webhook] Erro ao buscar cupom para incrementar:', couponFetchError);
                }
            }

        } else if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(payment.status)) {
            console.log(`[mp-platform-webhook] Iniciando CANCELAMENTO para user_id: ${userId}`)
            
            const { error: revokeError } = await supabaseAdmin
                .from('profiles')
                .update({
                    tier: 'free',
                    subscription_status: 'canceled',
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)

            if (revokeError) {
                console.error('[mp-platform-webhook] Erro ao revogar acesso:', revokeError)
            } else {
                console.log(`[mp-platform-webhook] Acesso revogado para ${userId}`)
            }
        } else {
            console.log(`[mp-platform-webhook] Pagamento pendente (${payment.status}), nenhuma ação tomada.`)
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
        console.error('[mp-platform-webhook] Erro Fatal:', error.message)
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
})

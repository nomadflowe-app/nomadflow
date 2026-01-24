import { serve } from "std/http/server.ts"
import { createClient } from 'supabase'
import Stripe from 'stripe'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

console.log('Stripe Webhook SDK initialized')

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

// ℹ️ PARA CONFIGURAR O WEBHOOK SECRET NO SUPABASE:
// 1. No painel do Stripe (Developers > Webhooks), crie um novo endpoint apontando para:
//    https://[SEU_PROJECT_ID].functions.supabase.co/stripe-webhook
// 2. Copie o "Signing Secret" (whsec_...)
// 3. Rode no seu terminal: 
//    supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')

    // Log the event receipt
    console.log('[stripe-webhook] Webhook received')

    if (!signature) {
        console.error('[stripe-webhook] Missing stripe-signature header')
        return new Response('Missing signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature, endpointSecret ?? '')

        console.log(`[stripe-webhook] Event constructed: ${event.type} [${event.id}]`)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any
            const userId = session.metadata?.userId
            // Try to find priceId in line_items first (needs expand), then metadata if you put it there, or just raw
            const priceId = session.line_items?.data?.[0]?.price?.id || session.metadata?.priceId

            console.log(`[stripe-webhook] Processing checkout.session.completed. UserId: ${userId}, PriceId: ${priceId}`)

            // Mapeamento de IDs para Tiers
            const tierMap: Record<string, string> = {
                'price_1SniJeD1nKpsWc8ow9unN1Cb': 'mensal',
                'price_1SniKQD1nKpsWc8or2Zn3epn': 'anual',
                'price_1Sln2yDi3wLcfDaX14HFPOPg': 'pro'
            }

            // Fallback para 'elite' se não encontrar no mapa mas for um sucesso
            const tier = tierMap[priceId] || 'elite'

            console.log(`[stripe-webhook] Determined tier: ${tier} (Raw PriceId: ${priceId})`)

            if (userId) {
                const supabaseAdmin = createClient(
                    Deno.env.get('SUPABASE_URL') ?? '',
                    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
                )

                console.log(`[stripe-webhook] Updating user ${userId} profile...`)

                const { error, data } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        tier: tier,
                        subscribed_at: new Date().toISOString()
                    })
                    .eq('user_id', userId)
                    .select()

                if (error) {
                    console.error('[stripe-webhook] DB Update Error:', error)
                    throw error
                }

                console.log(`[stripe-webhook] User ${userId} upgraded to ${tier} successfully. Data:`, data)
            } else {
                console.warn('[stripe-webhook] No userId found in session metadata')
            }
        } else {
            console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 })
    } catch (err: any) {
        console.error(`[stripe-webhook] Fatal Error: ${err.message}`)
        if (err.stack) console.error(err.stack)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})

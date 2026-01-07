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

    if (!signature) {
        return new Response('Missing signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature, endpointSecret ?? '')

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any
            const userId = session.metadata?.userId
            const priceId = session.line_items?.data?.[0]?.price?.id || session.metadata?.priceId

            // Mapeamento de IDs para Tiers
            const tierMap: Record<string, string> = {
                'price_1SlmxCDi3wLcfDaXrHbD0oQ7': 'mensal',
                'price_1SlmzmDi3wLcfDaX6KdV8faz': 'anual',
                'price_1Sln2yDi3wLcfDaX14HFPOPg': 'pro'
            }

            // Fallback para 'elite' se não encontrar no mapa mas for um sucesso
            const tier = tierMap[priceId] || 'elite'

            if (userId) {
                const supabaseAdmin = createClient(
                    Deno.env.get('SUPABASE_URL') ?? '',
                    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
                )

                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update({ tier: tier })
                    .eq('user_id', userId)

                if (error) throw error
                console.log(`User ${userId} upgraded to ${tier} via Webhook.`)
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 })
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})

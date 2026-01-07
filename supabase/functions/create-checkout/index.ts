import { serve } from "std/http/server.ts"
import Stripe from 'stripe'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

console.log('Stripe SDK initialized')

// ℹ️ PARA CONFIGURAR A CHAVE SECRETA NO SUPABASE:
// Rode no seu terminal: 
// supabase secrets set STRIPE_SECRET_KEY=sua_sk_stripe_aqui

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: { method: string; json: () => PromiseLike<{ userId: any; userEmail: any; priceId: any }> | { userId: any; userEmail: any; priceId: any }; headers: { get: (arg0: string) => any } }) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json()
        console.log('Request body:', body)
        const { userId, userEmail, priceId } = body

        if (!priceId) {
            throw new Error('priceId is required')
        }

        console.log('Creating stripe session for:', userEmail)
        const session = await stripe.checkout.sessions.create({
            customer_email: userEmail,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/`,
            metadata: {
                userId: userId,
            },
        })

        console.log('Session created:', session.id)
        return new Response(
            JSON.stringify({ url: session.url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
        )
    } catch (error: any) {
        console.error('Function error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
    }
})

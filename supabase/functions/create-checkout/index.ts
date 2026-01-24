import { serve } from "std/http/server.ts"
import Stripe from 'stripe'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
        if (!stripeSecretKey) {
            console.error('Missing STRIPE_SECRET_KEY') // Log error
            throw new Error('Server configuration error: STRIPE_SECRET_KEY missing')
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // Log request info for debugging
        const reqClone = req.clone()
        const bodyText = await reqClone.text()
        console.log(`[create-checkout] Incoming request body: ${bodyText}`)

        let body;
        try {
            body = JSON.parse(bodyText)
        } catch (e) {
            console.error('[create-checkout] Failed to parse JSON body')
            throw new Error('Invalid JSON body')
        }

        const { userId, userEmail, priceId } = body

        if (!priceId) {
            console.error('[create-checkout] Missing priceId in request')
            throw new Error('priceId is required')
        }

        if (!userEmail) {
            console.error('[create-checkout] Missing userEmail in request')
        }

        console.log(`[create-checkout] Creating stripe session for: ${userEmail}, plan: ${priceId}, userId: ${userId}`)

        // Determine origin/site URL
        const origin = (req.headers.get('origin') || req.headers.get('referer') || Deno.env.get('SITE_URL')) ?? 'http://localhost:3000'
        console.log(`[create-checkout] Using origin: ${origin}`)

        const session = await stripe.checkout.sessions.create({
            customer_email: userEmail,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            payment_method_types: ['card'],
            success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/`,
            metadata: {
                userId: userId,
            },
        })

        console.log(`[create-checkout] Session created successfully: ${session.id}`)

        return new Response(
            JSON.stringify({ url: session.url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
        )
    } catch (error: any) {
        console.error('[create-checkout] Critical Error:', error.message)
        // Log full stack if available
        if (error.stack) console.error(error.stack)

        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
    }
})

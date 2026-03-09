// @ts-nocheck
import { serve } from "std/http/server.ts"
import { createClient } from 'supabase'

// Definição de Tipos para o Payload da Hotmart
interface HotmartBuyer {
    email: string;
    name?: string;
    checkout_phone?: string;
}

interface HotmartProduct {
    id: number;
    name: string;
}

interface HotmartPurchase {
    transaction: string;
    status: string;
    order_date: number;
}

interface HotmartData {
    product?: HotmartProduct;
    buyer?: HotmartBuyer;
    purchase?: HotmartPurchase;
}

interface HotmartWebhookBody {
    id: string;
    event: string; // ex: 'PURCHASE_APPROVED', 'SUBSCRIPTION_CANCELLATION'
    data: HotmartData;
    version: string;
}

// Configuração de Variáveis de Ambiente
const HOTMART_PROD_MENSAL = Deno.env.get('HOTMART_PROD_MENSAL') || 'ID_MENSAL_DEFAULT'
const HOTMART_PROD_ANUAL = Deno.env.get('HOTMART_PROD_ANUAL') || 'ID_ANUAL_DEFAULT'
const HOTMART_PROD_PRO = Deno.env.get('HOTMART_PROD_PRO') || 'ID_PRO_DEFAULT'
const HOTMART_TOKEN = Deno.env.get('HOTMART_WEBHOOK_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, hottok, x-hotmart-hottok',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 2. Verificação de Segurança (Token Hotmart)
        const hottok = req.headers.get('hottok') || req.headers.get('x-hotmart-hottok')

        if (!HOTMART_TOKEN) {
            console.error('[hotmart-webhook] Critical: HOTMART_WEBHOOK_SECRET not set')
            return new Response(JSON.stringify({ error: 'Server Config Error' }), { status: 500, headers: corsHeaders })
        }

        if (hottok !== HOTMART_TOKEN) {
            console.error('[hotmart-webhook] Security Warning: Invalid Hotmart Token')
            return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Token' }), { status: 401, headers: corsHeaders })
        }

        // 3. Parse do Payload com Tipagem
        const bodyText = await req.text()
        if (!bodyText) {
            return new Response(JSON.stringify({ error: 'Empty body' }), { status: 400, headers: corsHeaders })
        }

        let body: HotmartWebhookBody;
        try {
            body = JSON.parse(bodyText) as HotmartWebhookBody
        } catch (_e) { // _e indica variável não usada intencionalmente
            console.error('[hotmart-webhook] Failed to parse JSON body')
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: corsHeaders })
        }

        console.log(`[hotmart-webhook] Event received: ${body.event}`, JSON.stringify(body))

        const eventType = body.event
        const data = body.data || {}
        const product = data.product
        const buyer = data.buyer
        const purchase = data.purchase

        // Validações básicas
        if (!buyer || !buyer.email) {
            console.warn('[hotmart-webhook] No email found in payload. Skipping.')
            return new Response(JSON.stringify({ message: 'No email provided, skipping' }), { status: 200, headers: corsHeaders })
        }

        const userEmail = buyer.email
        const productId = product ? String(product.id) : ''
        // Fallback: transaction ID pode vir dentro de purchase ou no root id do evento dependendo da versão
        const transactionId = purchase?.transaction || body.id

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Server Config Error: Missing Supabase Credentials')
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 4. Buscar Usuário pelo Email
        let userId: string | null = null;
        let isNewUser = false;

        // Tentativa 1: Buscar na tabela 'profiles'
        const { data: profileCheck, error: _profileError } = await supabaseAdmin
            .from('profiles')
            .select('user_id')
            .eq('email', userEmail)
            .maybeSingle()

        if (profileCheck) {
            userId = profileCheck.user_id
        } else {
            // Tentativa 2: Buscar via Auth Admin
            const { data: { users }, error: _listError } = await supabaseAdmin.auth.admin.listUsers()
            if (users) {
                const found = users.find((u: { email?: string }) => u.email === userEmail)
                if (found) userId = found.id
            }
        }

        if (!userId) {
            console.log(`[hotmart-webhook] User not found for email: ${userEmail}. Creating new user...`)

            // Generate a random password
            const tempPassword = crypto.randomUUID() + 'Aa1!'

            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: userEmail,
                password: tempPassword,
                email_confirm: true, // Auto-confirm email so they can login immediately (after reset)
                user_metadata: {
                    full_name: buyer.name || '',
                    phone: buyer.checkout_phone || ''
                }
            })

            if (createError) {
                console.error('[hotmart-webhook] Failed to create user:', createError)
                return new Response(JSON.stringify({ error: 'Failed to create user', details: createError }), { status: 500, headers: corsHeaders })
            }

            if (!newUser || !newUser.user) {
                console.error('[hotmart-webhook] User creation returned no data')
                return new Response(JSON.stringify({ error: 'Failed to create user (no data)' }), { status: 500, headers: corsHeaders })
            }

            userId = newUser.user.id
            isNewUser = true
            console.log(`[hotmart-webhook] New user created with ID: ${userId}`)
        }

        // 5. Lógica de Eventos
        // Lista de eventos de aprovação
        const approvedEvents = ['PURCHASE_APPROVED', 'SUBSCRIPTION_RENEWAL_FINISHED', 'SWITCH_PLAN_COMPLETED']
        // Lista de eventos de cancelamento
        const cancelledEvents = ['SUBSCRIPTION_CANCELLATION', 'PURCHASE_REFUNDED', 'SUBSCRIPTION_OVERDUE', 'PURCHASE_CBK']

        if (approvedEvents.includes(eventType)) {
            console.log(`[hotmart-webhook] Processing APPROVAL for ${userEmail} (${userId})`)

            // Apenas funciona o acesso anual na plataforma
            let tier = 'anual'
            console.log(`[hotmart-webhook] Granting 'anual' access for product ID: ${productId}`)

            if (isNewUser) {
                const upsertData = {
                    id: userId, // Required for upsert if PK match
                    user_id: userId,
                    email: userEmail,
                    full_name: buyer.name || '',
                    phone: buyer.checkout_phone || '',
                    tier: tier,
                    subscription_status: 'active',
                    subscription_id: transactionId,
                    updated_at: new Date().toISOString()
                }

                const { error: upsertError } = await supabaseAdmin
                    .from('profiles')
                    .upsert(upsertData)

                if (upsertError) {
                    console.error('[hotmart-webhook] DB Upsert Error:', upsertError)
                    throw upsertError
                }
            } else {
                const updateData: any = {
                    tier: tier,
                    subscription_status: 'active',
                    subscription_id: transactionId,
                    updated_at: new Date().toISOString()
                }

                // Only update personal info if provided in webhook, to avoid overwriting with empty
                if (buyer.name) updateData.full_name = buyer.name
                if (buyer.checkout_phone) updateData.phone = buyer.checkout_phone

                const { error: updateError } = await supabaseAdmin
                    .from('profiles')
                    .update(updateData)
                    .eq('user_id', userId)

                if (updateError) {
                    // Fallback: if profile doesn't exist for some reason (rare case where Auth exists but Profile doesn't)
                    console.warn('[hotmart-webhook] Update failed, trying Upsert fallback:', updateError.message)
                    const upsertData = {
                        id: userId,
                        user_id: userId,
                        email: userEmail,
                        full_name: buyer.name || '',
                        phone: buyer.checkout_phone || '',
                        tier: tier,
                        subscription_status: 'active',
                        subscription_id: transactionId,
                        updated_at: new Date().toISOString()
                    }
                    const { error: upsertError } = await supabaseAdmin.from('profiles').upsert(upsertData)
                    if (upsertError) throw upsertError
                }
            }

            console.log(`[hotmart-webhook] Success: User ${userId} upgraded to ${tier}`)

        } else if (cancelledEvents.includes(eventType)) {
            console.log(`[hotmart-webhook] Processing CANCELLATION for ${userEmail} (${userId})`)

            // For cancellation, we only update if the profile exists. 
            // If we just created the user, there is nothing to cancel really (except setting status).

            const { error: cancelError } = await supabaseAdmin
                .from('profiles')
                .update({
                    subscription_status: 'canceled',
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)

            if (cancelError) {
                console.error('[hotmart-webhook] DB Cancel Error:', cancelError)
                throw cancelError
            }

            console.log(`[hotmart-webhook] Success: User ${userId} subscription canceled`)
        } else {
            console.log(`[hotmart-webhook] Ignored event type: ${eventType}`)
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('[hotmart-webhook] Fatal Exception:', message)
        return new Response(JSON.stringify({ error: message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        })
    }
})

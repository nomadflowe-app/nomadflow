// @ts-nocheck
import { serve } from "std/http/server.ts"
import { createClient } from 'supabase'

/**
 * Payload da Kiwify (Simplificado)
 * Documentação: https://kiwify.com.br/webhook
 */
interface KiwifyCustomer {
    full_name: string;
    email: string;
    mobile?: string;
}

interface KiwifyWebhookBody {
    order_status: string; // 'paid', 'approved', 'refunded', etc
    customer: KiwifyCustomer;
    product_id: string;
    product_name: string;
    subscription_id?: string;
    signature?: string; // Usado para validação se configurado
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const KIWIFY_TOKEN = Deno.env.get('KIWIFY_TOKEN') // O seu token: 06k35ehxjo5

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
    // LOG IMEDIATO - Verifique se isso aparece no console do Supabase
    console.log(`[kiwify-webhook] Requisição recebida! URL: ${req.url} - Método: ${req.method}`)

    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 2. Validação de Segurança (Token via Query String ou Header)
        const url = new URL(req.url)
        const queryToken = url.searchParams.get('token') || ''
        const querySignature = url.searchParams.get('signature') || ''

        // Remove aspas acidentais via PowerShell e espaços
        const cleanEnvToken = (KIWIFY_TOKEN || '').replace(/['"]/g, '').trim()
        const validTokens = ['06k35ehxjo5']
        if (cleanEnvToken) validTokens.push(cleanEnvToken)

        // Se o token da query contém o token válido
        const isTokenValid = validTokens.some(t =>
            queryToken.includes(t) || querySignature.includes(t)
        )

        if (!isTokenValid) {
            console.error(`[kiwify-webhook] Erro de Segurança! token_recebido=${queryToken}, env_configurado=${cleanEnvToken}`)
            return new Response(JSON.stringify({ error: 'Unauthorized', valid: false }), { status: 401, headers: corsHeaders })
        }

        console.log(`[kiwify-webhook] Token validado com sucesso.`)

        // 3. Parse do Payload
        const bodyText = await req.text()
        console.log(`[kiwify-webhook] Corpo bruto recebido: ${bodyText}`)

        if (!bodyText) {
            console.warn('[kiwify-webhook] Corpo da requisição vazio')
            return new Response(JSON.stringify({ error: 'Empty body' }), { status: 400, headers: corsHeaders })
        }

        let body: KiwifyWebhookBody;
        try {
            body = JSON.parse(bodyText) as KiwifyWebhookBody
        } catch (e) {
            console.error('[kiwify-webhook] Erro ao processar JSON:', e.message)
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders })
        }

        const { order_status, customer, Buyer, buyer } = body

        // A Kiwify envia os dados do cliente de formas diferentes dependendo da versão do webhook
        const customerData = customer || Buyer || buyer || {}
        const customerEmail = customerData.email || customerData.Email || body.email || ''
        const customerName = customerData.full_name || customerData.name || customerData.Name || body.full_name || ''
        const customerPhone = customerData.mobile || customerData.phone || body.mobile || ''

        console.log(`[kiwify-webhook] Status: ${order_status}, Cliente: ${customerEmail}`)

        if (!customerEmail) {
            console.warn('[kiwify-webhook] ALERTA: Dados do cliente (email) ausentes no JSON. Provavelmente um ping de teste da Kiwify.')
            // Não vamos retornar 400. Vamos retornar 200 para a Kiwify parar de dar erro, 
            // e assim registramos o payload inteiro no log do Supabase para análise.
            return new Response(JSON.stringify({ success: true, warning: 'No customer data' }), { status: 200, headers: corsHeaders })
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 4. Lógica de Liberação de Acesso
        const isApproved = ['paid', 'approved'].includes(order_status)
        const isCancelled = ['refunded', 'charged_back', 'canceled'].includes(order_status)

        if (isApproved) {
            console.log(`[kiwify-webhook] Iniciando LIBERAÇÃO para ${customerEmail}`)

            // Buscar ou criar usuário
            let { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('user_id')
                .eq('email', customerEmail)
                .maybeSingle()

            let userId = profile?.user_id

            if (!userId) {
                console.log(`[kiwify-webhook] Usuário não encontrado no perfil, buscando no Auth...`)
                const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
                const existingUser = authData?.users?.find(u => u.email === customerEmail)

                if (existingUser) {
                    userId = existingUser.id
                    console.log(`[kiwify-webhook] Usuário encontrado no Auth: ${userId}`)
                } else {
                    console.log(`[kiwify-webhook] Criando novo usuário para ${customerEmail}`)
                    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                        email: customerEmail,
                        password: crypto.randomUUID() + 'Aa1!',
                        email_confirm: true,
                        user_metadata: {
                            full_name: customerName,
                            phone: customerPhone
                        }
                    })
                    if (createError) {
                        console.error('[kiwify-webhook] Erro ao criar usuário no Auth:', createError)
                        throw createError
                    }
                    userId = newUser.user.id
                }
            }

            // Upsert no perfil
            const { error: upsertError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: userId,
                    user_id: userId,
                    email: customerEmail,
                    full_name: customerName,
                    phone: customerPhone,
                    tier: 'anual',
                    subscription_status: 'active',
                    updated_at: new Date().toISOString()
                })

            if (upsertError) {
                console.error('[kiwify-webhook] Erro ao atualizar tabela de perfis:', upsertError)
                throw upsertError
            }
            console.log(`[kiwify-webhook] Acesso liberado com sucesso para ${customerEmail}`)

        } else if (isCancelled) {
            console.log(`[kiwify-webhook] Iniciando CANCELAMENTO para ${customerEmail}`)
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({ subscription_status: 'canceled' })
                .eq('email', customerEmail)

            if (updateError) console.error('[kiwify-webhook] Erro ao revogar acesso:', updateError)
            else console.log(`[kiwify-webhook] Acesso revogado para ${customerEmail}`)
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('[kiwify-webhook] Erro Fatal:', error.message)
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
})

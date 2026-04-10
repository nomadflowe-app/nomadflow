// @ts-nocheck
import { serve } from "std/http/server.ts"
import { createClient } from 'supabase'

/**
 * mp-webhook
 *
 * Recebe notificações de pagamento do Mercado Pago.
 * Gera o link do Google Meet e envia e-mails de confirmação.
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN') ?? ''
const CALENDAR_WEBHOOK_URL = Deno.env.get('CALENDAR_WEBHOOK_URL') ?? 'https://script.google.com/macros/s/AKfycbxMy7zj92KasumrVa-X_J5piKy_WktVW-O9pjAcPZ0oDNJj_lyraopCwlmpKDYsqw4fyg/exec'
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const ADMIN_EMAIL = 'nomadflow.es@gmail.com'
const FROM_EMAIL = 'NomadFlow <confirmacao@nomadflow.es>'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function createGoogleMeetViaWebhook(booking: any, slot: any) {
    const payload = {
        summary: `Orientação Estratégica: ${booking.name}`,
        description: `Sessão de orientação NomadFlow.\nE-mail: ${booking.email}\nWhatsApp: ${booking.whatsapp}\n\nDúvidas: ${booking.experience || 'Não informada'}`,
        startTime: slot.start_time,
        endTime: slot.end_time,
        guestEmail: booking.email
    }

    const res = await fetch(CALENDAR_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    if (!res.ok) {
        throw new Error(`Apps Script failed: ${res.statusText}`)
    }

    return await res.json()
}

function formatDate(isoString: string) {
    return new Date(isoString).toLocaleDateString('pt-BR', {
        timeZone: 'Europe/Madrid',
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    })
}

function formatTime(isoString: string) {
    return new Date(isoString).toLocaleTimeString('pt-BR', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit', minute: '2-digit'
    })
}

async function sendConfirmationEmail(booking: any, slot: any, meetLink: string | null) {
    if (!RESEND_API_KEY) {
        console.warn('[mp-webhook] RESEND_API_KEY não configurada - pulando envio de e-mail.')
        return
    }

    const dateStr = formatDate(slot.start_time)
    const startStr = formatTime(slot.start_time)
    const endStr = formatTime(slot.end_time)
    const meetSection = meetLink
        ? `<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
            <p style="margin:0 0 12px;font-weight:bold;color:#15803d;font-size:16px;">✅ Sua reunião no Google Meet está pronta!</p>
            <a href="${meetLink}" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Entrar na Reunião 🎥</a>
            <p style="margin:12px 0 0;font-size:12px;color:#666;">${meetLink}</p>
          </div>`
        : `<p style="color:#666;">O link da reunião será enviado em breve.</p>`

    // E-mail para o cliente
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: FROM_EMAIL,
            to: [booking.email],
            subject: '✅ Agendamento Confirmado — Orientação Estratégica NomadFlow',
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
                    <div style="background:#172554;padding:32px;text-align:center;">
                        <h1 style="color:#FACC15;margin:0;font-size:24px;">NomadFlow</h1>
                        <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Seu Visto Nômade para a Espanha</p>
                    </div>
                    <div style="padding:32px;">
                        <h2 style="color:#172554;margin:0 0 8px;">Olá, ${booking.name}! 👋</h2>
                        <p style="color:#444;margin:0 0 24px;">Seu agendamento foi <strong>confirmado com sucesso</strong>. Aqui estão os detalhes da sua sessão:</p>

                        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;">
                            <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">DATA & HORÁRIO</p>
                            <p style="margin:0;font-size:20px;font-weight:bold;color:#172554;text-transform:capitalize;">${dateStr}</p>
                            <p style="margin:4px 0 0;font-size:28px;font-weight:900;color:#FACC15;">${startStr} – ${endStr}</p>
                            <p style="margin:4px 0 0;font-size:12px;color:#888;">Horário de Madri (GMT+2)</p>
                        </div>

                        ${meetSection}

                        <p style="color:#444;margin:24px 0 8px;">Se tiver dúvidas, nos chame no WhatsApp ou responda este e-mail.</p>
                        <p style="color:#172554;font-weight:bold;margin:0;">Até breve! 🚀<br><span style="font-weight:normal;color:#666;">Equipe NomadFlow</span></p>
                    </div>
                    <div style="background:#f1f5f9;padding:16px;text-align:center;">
                        <p style="margin:0;font-size:12px;color:#888;">NomadFlow — nomadflow.es | Este é um e-mail automático.</p>
                    </div>
                </div>
            `
        })
    })

    // E-mail de notificação para o admin
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: FROM_EMAIL,
            to: [ADMIN_EMAIL],
            subject: `🔔 Novo Agendamento Pago: ${booking.name}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                    <div style="background:#172554;padding:24px;text-align:center;">
                        <h2 style="color:#FACC15;margin:0;">Novo Agendamento Confirmado</h2>
                    </div>
                    <div style="padding:24px;">
                        <table style="width:100%;border-collapse:collapse;">
                            <tr><td style="padding:8px;color:#666;width:40%;">Cliente</td><td style="padding:8px;font-weight:bold;">${booking.name}</td></tr>
                            <tr style="background:#f8fafc;"><td style="padding:8px;color:#666;">E-mail</td><td style="padding:8px;">${booking.email}</td></tr>
                            <tr><td style="padding:8px;color:#666;">WhatsApp</td><td style="padding:8px;">${booking.whatsapp}</td></tr>
                            <tr style="background:#f8fafc;"><td style="padding:8px;color:#666;">Data</td><td style="padding:8px;text-transform:capitalize;">${dateStr}</td></tr>
                            <tr><td style="padding:8px;color:#666;">Horário (Madri)</td><td style="padding:8px;font-weight:bold;">${startStr} – ${endStr}</td></tr>
                            <tr style="background:#f8fafc;"><td style="padding:8px;color:#666;">Meet Link</td><td style="padding:8px;"><a href="${meetLink ?? '#'}">${meetLink ?? 'A ser gerado'}</a></td></tr>
                        </table>
                        ${booking.experience ? `<p style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px;"><strong>Experiência/Dúvidas:</strong><br>${booking.experience}</p>` : ''}
                    </div>
                </div>
            `
        })
    })

    console.log(`[mp-webhook] E-mails de confirmação enviados para ${booking.email} e ${ADMIN_EMAIL}`)
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const url = new URL(req.url)
        let paymentId: string | null = null
        let topic = url.searchParams.get('topic') ?? ''

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

        if (!paymentId || topic !== 'payment') {
            return new Response(JSON.stringify({ received: true }), { status: 200, headers: corsHeaders })
        }

        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
        })

        if (!mpRes.ok) throw new Error('MP API error')
        const payment = await mpRes.json()
        const bookingId = payment.external_reference
        if (!bookingId) return new Response('No reference', { status: 200 })

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        const statusMap: Record<string, string> = {
            'approved': 'paid', 'authorized': 'paid', 'in_process': 'pending',
            'pending': 'pending', 'rejected': 'failed', 'cancelled': 'failed'
        }
        const newStatus = statusMap[payment.status] ?? 'pending'

        await supabase.from('consultation_bookings').update({
            payment_status: newStatus, payment_id: String(paymentId)
        }).eq('id', bookingId)

        if (newStatus === 'paid') {
            const { data: booking } = await supabase
                .from('consultation_bookings')
                .select('*, consultation_slots(*)')
                .eq('id', bookingId).single()

            if (booking?.consultation_slots) {
                const slot = booking.consultation_slots
                await supabase.from('consultation_slots').update({ is_booked: true }).eq('id', slot.id)

                let meetLink: string | null = null

                try {
                    const gResult = await createGoogleMeetViaWebhook(booking, slot)
                    if (gResult.success) {
                        meetLink = gResult.meetLink
                        await supabase.from('consultation_bookings').update({
                            meet_link: meetLink,
                            calendar_event_id: gResult.eventId
                        }).eq('id', bookingId)
                        console.log(`[mp-webhook] Meet gerado: ${meetLink}`)
                    } else {
                        console.error('[mp-webhook] Erro no Apps Script:', gResult.error)
                    }
                } catch (err) {
                    console.error('[mp-webhook] Falha ao chamar Google Apps Script:', err.message)
                }

                // Enviar e-mails de confirmação
                try {
                    await sendConfirmationEmail(booking, slot, meetLink)
                } catch (emailErr) {
                    console.error('[mp-webhook] Falha ao enviar e-mail:', emailErr.message)
                }
            }
        }

        if (newStatus === 'failed') {
            const { data: b } = await supabase.from('consultation_bookings').select('slot_id').eq('id', bookingId).single()
            if (b?.slot_id) await supabase.from('consultation_slots').update({ is_booked: false }).eq('id', b.slot_id)
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
})



import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, Video, ArrowLeft, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BRAND = {
  yellow: '#FACC15',
  navy: '#172554',
};

const SchedulingSuccess: React.FC = () => {
  const [booking, setBooking] = useState<any>(null);
  const [slot, setSlot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('booking_id');
    const status = params.get('status'); // 'approved' | 'pending'

    setIsPending(status === 'pending');

    if (bookingId) {
      loadBooking(bookingId);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadBooking(bookingId: string) {
    try {
      const { data, error } = await supabase
        .from('consultation_bookings')
        .select('*, consultation_slots(*)')
        .eq('id', bookingId)
        .single();

      if (!error && data) {
        setBooking(data);
        setSlot(data.consultation_slots);
      }
    } catch (e) {
      console.error('Erro ao carregar booking:', e);
    } finally {
      setLoading(false);
    }
  }

  function formatSlotTime(isoString: string, opts: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat('pt-BR', { ...opts, timeZone: 'Europe/Madrid' }).format(new Date(isoString));
  }

  function generateGoogleCalendarUrl() {
    if (!slot || !booking) return '';
    const start = new Date(slot.start_time).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(slot.end_time).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const title = encodeURIComponent("Orientação Estratégica NomadFlow");
    const details = encodeURIComponent("Sessão de orientação sobre imigração para a Espanha.\nO link do Google Meet será enviado por e-mail.");
    const location = encodeURIComponent("Google Meet");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  }

  if (loading) {
    return (
      <div style={{ background: BRAND.navy }} className="min-h-screen flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin opacity-40" />
      </div>
    );
  }

  return (
    <div style={{ background: BRAND.navy, minHeight: '100vh' }} className="flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="max-w-xl w-full text-center space-y-10 py-12">

        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="relative inline-block"
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl relative z-10"
            style={{ background: isPending ? 'rgba(250,204,21,0.2)' : BRAND.yellow, boxShadow: `0 0 48px rgba(250,204,21,${isPending ? 0.15 : 0.4})` }}>
            {isPending
              ? <Clock className="w-12 h-12" style={{ color: BRAND.yellow }} />
              : <CheckCircle2 className="w-12 h-12" style={{ color: BRAND.navy }} />
            }
          </div>
          <motion.div
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ background: BRAND.yellow }}
          />
        </motion.div>

        {/* Title */}
        <header className="space-y-3">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl lg:text-5xl font-black tracking-tight"
          >
            {isPending ? (
              <>Pagamento <span style={{ color: BRAND.yellow }}>em Análise!</span></>
            ) : (
              <>Pagamento <span style={{ color: BRAND.yellow }}>Confirmado!</span></>
            )}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/50 font-bold text-sm"
          >
            {isPending
              ? 'Seu pagamento está sendo processado. Você receberá a confirmação por e-mail em breve.'
              : 'Sua Orientação Estratégica foi agendada com sucesso!'}
          </motion.p>
        </header>

        {/* Booking details card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-[2.5rem] p-8 space-y-6 border border-white/10 text-left relative overflow-hidden"
          style={{ background: 'rgba(30,64,175,0.25)' }}
        >
          {/* subtle glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(250,204,21,0.05)', filter: 'blur(40px)' }} />

          {/* Name & email */}
          {booking ? (
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/10">
              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Nome</p>
                <p className="text-white font-bold">{booking.name}</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">E-mail</p>
                <p className="text-white font-bold truncate">{booking.email}</p>
              </div>
            </div>
          ) : (
             <div className="pb-6 border-b border-white/10">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Status do Agendamento</p>
                <p className="text-white font-bold">Reserva Localizada</p>
             </div>
          )}

          {/* Slot details */}
          {slot ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Data
                </p>
                <p className="text-white font-black text-lg capitalize leading-none">
                  {formatSlotTime(slot.start_time, { weekday: 'long', day: '2-digit', month: 'long' })}
                </p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Horário (Madri)
                </p>
                <p className="font-black text-2xl leading-none" style={{ color: BRAND.yellow }}>
                  {formatSlotTime(slot.start_time, { hour: '2-digit', minute: '2-digit' })} – {formatSlotTime(slot.end_time, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-white/40 py-4 bg-white/5 rounded-2xl px-4 border border-dashed border-white/10">
              <AlertCircle className="w-5 h-5" />
              <p className="text-xs font-bold">Detalhes do horário serão enviados para seu e-mail.</p>
            </div>
          )}

          {/* Google Meet section */}
          <div className="rounded-2xl p-5 border border-white/10 space-y-4"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" style={{ color: BRAND.yellow }} />
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: BRAND.yellow }}>Google Meet</p>
            </div>

            {booking?.meet_link ? (
              <div className="space-y-4">
                <p className="text-white font-bold text-sm leading-relaxed">
                  Sua sala de reunião já foi gerada! Você também receberá este link por e-mail.
                </p>
                <a
                  href={booking.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-yellow text-navy-950 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-400/20"
                >
                  <Video className="w-4 h-4" />
                  Entrar na Reunião
                </a>
              </div>
            ) : (
              <p className="text-white/60 text-sm leading-relaxed">
                O link da videochamada será enviado automaticamente para <strong className="text-white">{booking?.email ?? 'seu e-mail'}</strong> após a aprovação definitiva do pagamento.
              </p>
            )}
          </div>

          {/* Add to Calendar Button */}
          {slot && !isPending && (
            <button
              onClick={() => window.open(generateGoogleCalendarUrl(), '_blank')}
              className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Calendar className="w-4 h-4" style={{ color: BRAND.yellow }} />
              Adicionar ao Google Agenda
            </button>
          )}

          {/* Next steps */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: BRAND.yellow }}>Próximos Passos</h4>
            <ul className="grid grid-cols-1 gap-3">
              {[
                'Você receberá um e-mail com os detalhes do encontro.',
                'O link da sala será enviado no e-mail de lembrete.',
                'Sua orientação será realizada via Google Meet.',
                'Já pode listar suas principais dúvidas para a reunião.',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-white/50 leading-relaxed font-bold">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 font-black text-[9px] mt-0.5"
                    style={{ background: 'rgba(250,204,21,0.15)', color: BRAND.yellow }}>
                    {i + 1}
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
 
        {/* Actions */}
        <div className="flex justify-center pt-6">
          <button
            onClick={() => window.location.href = '/'}
            className="px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all hover:bg-brand-yellow hover:text-navy-950 active:scale-95 shadow-xl"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </button>
        </div>

      </div>
    </div>
  );
};

export default SchedulingSuccess;

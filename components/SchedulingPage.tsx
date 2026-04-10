import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Video,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Globe,
  ChevronDown,
  Phone,
  MessageCircle
} from 'lucide-react';
import { getConsultationSlots } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

// Set to true while using MP test credentials, false in production
const MP_SANDBOX = import.meta.env.VITE_MP_SANDBOX !== 'false';


interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  price: number;
}

const HOST_TIMEZONE = 'Europe/Madrid';

const BRAND = {
  yellow: '#FACC15',
  navy: '#172554',
  navyCard: '#1E40AF',
  white: '#FFFFFF',
};

function formatInTz(isoString: string, tz: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('pt-BR', { ...opts, timeZone: tz }).format(new Date(isoString));
}

function getLocalDateKey(isoString: string, tz: string): string | null {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    const year = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: tz }).format(d);
    const month = new Intl.DateTimeFormat('en', { month: '2-digit', timeZone: tz }).format(d);
    const day = new Intl.DateTimeFormat('en', { day: '2-digit', timeZone: tz }).format(d);
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
}

function getTzLabel(tz: string): string {
  try {
    const offset = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'short'
    }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value || '';
    const city = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
    return `${city} (${offset})`;
  } catch {
    return tz;
  }
}

const SchedulingPage: React.FC = () => {
  const { showToast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', experience: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const [visitorTz, setVisitorTz] = useState(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
    catch { return 'America/Sao_Paulo'; }
  });
  const [showTzSelector, setShowTzSelector] = useState(false);
 
  const isSameTz = visitorTz === HOST_TIMEZONE;
 
  useEffect(() => { loadSlots(); }, []);
 
  async function loadSlots() {
    setLoading(true);
    console.log('[SchedulingPage] Loading slots...');
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('[SchedulingPage] Slots loading timeout reached');
      setLoading(false);
    }, 8000);

    try {
      const availableSlots = await getConsultationSlots();
      console.log('[SchedulingPage] Slots fetched:', availableSlots?.length);
      
      // Filter out slots without start time or with invalid date
      const validSlots = (availableSlots || []).filter(s => {
        if (!s.start_time) return false;
        try {
          const d = new Date(s.start_time);
          return !isNaN(d.getTime());
        } catch { return false; }
      });
      setSlots(validSlots);
    } catch (err) {
      console.error('[SchedulingPage] Error loading slots:', err);
      showToast('Erro ao carregar horários.', 'error');
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      console.log('[SchedulingPage] Loading finished');
    }
  }
 
  const uniqueDates = useMemo(() => {
    try {
      const dates = slots.map(s => getLocalDateKey(s.start_time, visitorTz));
      return Array.from(new Set(dates)).filter(Boolean).sort();
    } catch (e) {
      console.error("Error calculating uniqueDates:", e);
      return [];
    }
  }, [slots, visitorTz]);
 
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    try {
      return slots.filter(s => getLocalDateKey(s.start_time, visitorTz) === selectedDate);
    } catch (e) {
      console.error("Error filtering slots:", e);
      return [];
    }
  }, [slots, selectedDate, visitorTz]);
 
  const handleNextStep = () => {
    if (step === 1 && !selectedDate) { showToast('Selecione uma data.', 'warning'); return; }
    if (step === 2 && !selectedSlot) { showToast('Selecione um horário.', 'warning'); return; }
    setStep(step + 1);
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.whatsapp) {
      showToast('Preencha os campos obrigatórios.', 'warning');
      return;
    }
    if (!selectedSlot) return;
 
    setIsSubmitting(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey
        },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
          experience: formData.experience
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao criar pagamento.');
      }

      showToast('Redirecionando para o pagamento...', 'success');
      const checkoutUrl = MP_SANDBOX
        ? result.sandbox_init_point
        : result.init_point;
 
      window.location.href = checkoutUrl;
 
    } catch (err: any) {
      showToast(err.message ?? 'Erro ao realizar agendamento.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
 

  if (loading) {
    return (
      <div style={{ background: BRAND.navy }} className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-t-yellow-400 rounded-full animate-spin mb-4" style={{ borderColor: 'rgba(250,204,21,0.15)', borderTopColor: BRAND.yellow }} />
        <p className="text-white/40 font-black uppercase text-xs tracking-widest">Buscando disponibilidades...</p>
      </div>
    );
  }

  return (
    <div style={{ background: BRAND.navy, minHeight: '100vh' }} className="text-white font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">

        {/* ── HEADER ── */}
        <header className="text-center mb-12 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-black uppercase tracking-widest"
            style={{ background: 'rgba(250,204,21,0.1)', borderColor: 'rgba(250,204,21,0.3)', color: BRAND.yellow }}
          >
            <CalendarIcon className="w-3 h-3" />
            Orientação Estratégica para Nômade Digital
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl lg:text-5xl font-black tracking-tight leading-tight"
          >
            Agende sua<br />
            <span style={{ color: BRAND.yellow }}>Orientação Estratégica</span><br />
            para Nômade Digital
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed"
          >
            Escolha o melhor dia e horário para conversarmos sobre o seu processo de imigração para a Espanha.
          </motion.p>

          {/* Timezone banner & Selector */}
          <div className="relative inline-flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowTzSelector(!showTzSelector)}
              className="inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-sm border border-white/10 cursor-pointer hover:bg-white/10 transition-all select-none"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Globe className="w-4 h-4 shrink-0" style={{ color: BRAND.yellow }} />
              <span className="text-white/60">
                Horários no seu fuso:{' '}
                <span className="text-white font-bold">{getTzLabel(visitorTz)}</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTzSelector ? 'rotate-180' : ''}`} />
            </motion.div>

            <AnimatePresence>
              {showTzSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 z-50 w-64 bg-navy/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 left-1/2 -translate-x-1/2"
                >
                  {[
                    { v: 'America/Sao_Paulo', l: 'Brasília (Brasil)' },
                    { v: 'Europe/Madrid', l: 'Madri (Espanha)' },
                    { v: 'Europe/Lisbon', l: 'Lisboa (Portugal)' },
                    { v: 'Europe/London', l: 'Londres (Inglaterra)' },
                    { v: 'America/New_York', l: 'Nova York (EUA)' },
                    { v: 'America/Los_Angeles', l: 'Los Angeles (EUA)' },
                  ].map(tz => (
                    <button
                      key={tz.v}
                      onClick={() => { setVisitorTz(tz.v); setShowTzSelector(false); }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/10 ${visitorTz === tz.v ? 'text-yellow-400 bg-yellow-400/10' : 'text-white/60'}`}
                    >
                      {tz.l}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {!isSameTz && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-white/30 text-[10px] mt-2 block"
              >
                * Reunião agendada no horário de Madri
              </motion.span>
            )}
          </div>
        </header>

        {/* ── STEP INDICATOR ── */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2 p-2 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {[
              { label: 'Data', n: 1 },
              { label: 'Horário', n: 2 },
              { label: 'Dados', n: 3 },
            ].map(({ label, n }) => (
              <div
                key={n}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all"
                style={
                  step === n
                    ? { background: BRAND.yellow, color: BRAND.navy, fontWeight: 900 }
                    : step > n
                    ? { color: 'rgba(255,255,255,0.5)', fontWeight: 700 }
                    : { color: 'rgba(255,255,255,0.25)', fontWeight: 700 }
                }
              >
                <span className="text-xs uppercase tracking-widest">{label}</span>
                {step > n && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN CARD ── */}
        <div
          className="rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white/10"
          style={{ background: 'rgba(30, 64, 175, 0.25)' }}
        >
          {/* glow blobs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(250,204,21,0.08)', filter: 'blur(80px)' }} />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(250,204,21,0.04)', filter: 'blur(80px)' }} />

          <div className="p-8 lg:p-12 relative">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: DATE ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(250,204,21,0.15)', color: BRAND.yellow }}>
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-white">Selecione o Dia</h3>
                      <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{getTzLabel(visitorTz)}</p>
                    </div>
                  </div>

                  {uniqueDates.length === 0 ? (
                    <div className="py-16 text-center space-y-4">
                      <AlertCircle className="w-12 h-12 mx-auto text-white/20" />
                      <p className="text-white/40 font-bold">Nenhuma data disponível no momento.</p>
                    </div>
                  ) : (() => {
                    // Build a mini monthly calendar around the available dates
                    const availableSet = new Set(uniqueDates);
                    // Determine month range from available dates
                    const months: { year: number; month: number }[] = [];
                    uniqueDates.forEach(d => {
                      const parts = d?.split('-');
                      if (!parts || parts.length < 2) return;
                      const y = parseInt(parts[0]);
                      const m = parseInt(parts[1]);
                      if (isNaN(y) || isNaN(m)) return;
                      if (!months.find(x => x.year === y && x.month === m)) months.push({ year: y, month: m });
                    });

                    return months.map(({ year, month }) => {
                      const firstDay = new Date(year, month - 1, 1);
                      const lastDay = new Date(year, month, 0);
                      const startDow = firstDay.getDay(); // 0=Sun
                      const totalDays = lastDay.getDate();
                      const monthLabel = firstDay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                      const cells: (number | null)[] = [
                        ...Array(startDow).fill(null),
                        ...Array.from({ length: totalDays }, (_, i) => i + 1)
                      ];

                      return (
                        <div key={`${year}-${month}`} className="space-y-3">
                          {/* Month title */}
                          <p className="text-center text-white font-black text-sm uppercase tracking-widest capitalize">{monthLabel}</p>

                          {/* Weekday headers */}
                          <div className="grid grid-cols-7 gap-1">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                              <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest py-1"
                                style={{ color: 'rgba(255,255,255,0.3)' }}>
                                {d}
                              </div>
                            ))}
                          </div>

                          {/* Day cells */}
                          <div className="grid grid-cols-7 gap-1">
                            {cells.map((day, idx) => {
                              if (day === null) return <div key={`empty-${idx}`} />;
                              const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                              const isAvailable = availableSet.has(dateKey);
                              const isSelected = selectedDate === dateKey;
                              const isToday = new Date().toISOString().startsWith(dateKey);

                              return (
                                <button
                                  key={dateKey}
                                  disabled={!isAvailable}
                                  onClick={() => { setSelectedDate(dateKey); setSelectedSlot(null); }}
                                  className="aspect-square flex items-center justify-center rounded-xl text-sm font-black transition-all relative"
                                  style={
                                    isSelected
                                      ? { background: BRAND.yellow, color: BRAND.navy, boxShadow: '0 4px 16px rgba(250,204,21,0.4)' }
                                      : isAvailable
                                      ? { background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1.5px solid rgba(250,204,21,0.35)' }
                                      : { background: 'transparent', color: 'rgba(255,255,255,0.15)', cursor: 'default' }
                                  }
                                >
                                  {day}
                                  {isToday && !isSelected && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                      style={{ background: isAvailable ? BRAND.yellow : 'rgba(255,255,255,0.3)' }} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </motion.div>
              )}


              {/* ── STEP 2: TIME ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => setStep(1)} className="p-2 rounded-xl transition-all hover:bg-white/10">
                      <ChevronLeft className="w-5 h-5 text-white/50" />
                    </button>
                    <div>
                      <h3 className="font-black text-xl text-white">Escolha o Horário</h3>
                      <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Para o dia {selectedDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {slotsForSelectedDate.map(slot => {
                      const isSelected = selectedSlot?.id === slot.id;
                      const localTime = formatInTz(slot.start_time, visitorTz, { hour: '2-digit', minute: '2-digit' });
                      const localEndTime = formatInTz(slot.end_time, visitorTz, { hour: '2-digit', minute: '2-digit' });
                      const madridTime = !isSameTz
                        ? formatInTz(slot.start_time, HOST_TIMEZONE, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
                        : null;

                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className="flex items-center justify-between gap-4 p-5 rounded-2xl border-2 transition-all text-left"
                          style={
                            isSelected
                              ? { background: BRAND.yellow, borderColor: BRAND.yellow, boxShadow: '0 8px 32px rgba(250,204,21,0.35)' }
                              : { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }
                          }
                        >
                          <div className="flex items-center gap-4">
                            <Clock className="w-5 h-5 shrink-0" style={{ color: isSelected ? BRAND.navy : BRAND.yellow }} />
                            <div>
                              <p className="text-xl font-black leading-none"
                                style={{ color: isSelected ? BRAND.navy : '#fff' }}>
                                {localTime} – {localEndTime}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-widest mt-1"
                                style={{ color: isSelected ? 'rgba(23,37,84,0.55)' : 'rgba(255,255,255,0.35)' }}>
                                Seu horário local
                              </p>
                            </div>
                          </div>
                          {madridTime && (
                            <div className="text-right shrink-0">
                              <p className="text-xs font-black leading-none"
                                style={{ color: isSelected ? 'rgba(23,37,84,0.65)' : 'rgba(255,255,255,0.35)' }}>
                                {madridTime}
                              </p>
                              <p className="text-[9px] uppercase tracking-widest mt-1"
                                style={{ color: isSelected ? 'rgba(23,37,84,0.4)' : 'rgba(255,255,255,0.2)' }}>
                                Madri
                              </p>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: FORM ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-8">
                  <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => setStep(2)} className="p-2 rounded-xl transition-all hover:bg-white/10">
                      <ChevronLeft className="w-5 h-5 text-white/50" />
                    </button>
                    <div>
                      <h3 className="font-black text-xl text-white">Confirme seus Dados</h3>
                      <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Informações para contato e confirmação</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Nome Completo</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30">
                            <User className="w-4 h-4" />
                          </div>
                          <input required type="text" placeholder="Alex Silva"
                            className="w-full rounded-2xl py-4 pl-12 pr-6 font-bold focus:outline-none transition-all border"
                            style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                            onFocus={e => (e.target.style.borderColor = BRAND.yellow)}
                            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                      </div>
                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Melhor E-mail</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input required type="email" placeholder="alex@exemplo.com"
                            className="w-full rounded-2xl py-4 pl-12 pr-6 font-bold focus:outline-none transition-all border"
                            style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                            onFocus={e => (e.target.style.borderColor = BRAND.yellow)}
                            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                      </div>
                      {/* WhatsApp */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">WhatsApp (Com DDD)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input required type="tel" placeholder="(00) 00000-0000"
                            className="w-full rounded-2xl py-4 pl-12 pr-6 font-bold focus:outline-none transition-all border"
                            style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                            onFocus={e => (e.target.style.borderColor = BRAND.yellow)}
                            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                            value={formData.whatsapp}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '');
                              setFormData({ ...formData, whatsapp: val });
                            }} />
                        </div>
                      </div>
                    </div>

                    {/* Conte sua experiência */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Conte sua Experiência (Opcional)</label>
                      <textarea
                        placeholder="Fale brevemente sobre seus planos ou dúvidas..."
                        className="w-full rounded-2xl py-4 px-6 font-bold focus:outline-none transition-all border min-h-[120px] resize-none"
                        style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                        onFocus={e => (e.target.style.borderColor = BRAND.yellow)}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                        value={formData.experience}
                        onChange={e => setFormData({ ...formData, experience: e.target.value })}
                      />
                    </div>
 
                    {/* Booking Summary */}
                    {selectedSlot && (
                      <div className="rounded-3xl p-6 space-y-4 border border-dashed border-white/15"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mb-2">Horário da Reunião</p>
                            <p className="text-white font-black text-lg capitalize">
                              {formatInTz(selectedSlot.start_time, visitorTz, { weekday: 'long', day: '2-digit', month: 'long' })}
                            </p>
                            <p className="font-black text-2xl mt-1" style={{ color: BRAND.yellow }}>
                              {formatInTz(selectedSlot.start_time, visitorTz, { hour: '2-digit', minute: '2-digit' })}
                              {' – '}
                              {formatInTz(selectedSlot.end_time, visitorTz, { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">
                              {getTzLabel(visitorTz)}
                            </p>
                          </div>
                          {!isSameTz && (
                            <div className="text-right shrink-0 rounded-2xl p-3 border border-white/10"
                              style={{ background: 'rgba(255,255,255,0.07)' }}>
                              <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Madri</p>
                              <p className="text-white font-black">
                                {formatInTz(selectedSlot.start_time, HOST_TIMEZONE, { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center border-t border-white/10 pt-4">
                          <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Investimento</span>
                          <span className="font-black text-2xl" style={{ color: BRAND.yellow }}>R$ {selectedSlot.price?.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      disabled={isSubmitting}
                      className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95"
                      style={{
                        background: isSubmitting ? 'rgba(255,255,255,0.1)' : BRAND.yellow,
                        color: isSubmitting ? 'rgba(255,255,255,0.3)' : BRAND.navy,
                        boxShadow: isSubmitting ? 'none' : '0 8px 32px rgba(250,204,21,0.3)',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-t-white/50 rounded-full animate-spin"
                          style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.5)' }} />
                      ) : (
                        <><CreditCard className="w-5 h-5" /> Finalizar e Pagar</>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer nav (steps 1-2) */}
          {step < 3 && (
            <div className="p-6 flex justify-end border-t border-white/10"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <button
                onClick={handleNextStep}
                disabled={step === 1 ? !selectedDate : !selectedSlot}
                className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95"
                style={
                  (step === 1 ? !selectedDate : !selectedSlot)
                    ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
                    : { background: BRAND.yellow, color: BRAND.navy, boxShadow: '0 8px 32px rgba(250,204,21,0.3)' }
                }
              >
                Próximo Passo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── TRUST BADGES ── */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: <CheckCircle2 className="w-6 h-6" />, title: 'Agendamento Seguro', text: 'Seus dados estão protegidos por criptografia ponta a ponta.' },
            { icon: <Globe className="w-6 h-6" />, title: 'Fuso Detectado Automaticamente', text: 'Horários exibidos já convertidos para o seu fuso horário local.' },
            { icon: <Video className="w-6 h-6" />, title: 'Suporte Especializado', text: 'Conversa direta com especialistas em imigração para a Espanha.' },
          ].map(({ icon, title, text }) => (
            <div key={title} className="space-y-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border border-white/10"
                style={{ background: 'rgba(255,255,255,0.05)', color: BRAND.yellow }}>
                {icon}
              </div>
              <h4 className="font-bold text-sm text-white">{title}</h4>
              <p className="text-white/40 text-xs px-4">{text}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SchedulingPage;

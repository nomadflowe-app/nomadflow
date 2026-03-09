import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, CheckCircle2, AlertCircle, XCircle, Send, Clock, ArrowLeft, User, Mail, Phone } from 'lucide-react';
import { saveQuizLeadInitial, updateQuizLeadFinal, updateQuizLeadProgress, supabase } from '../lib/supabase';

import { QUESTIONS, Answer, Question, QuestionOption, calculateRequiredIncome, EUR_BRL_RATE, BASE_SMI, BASE_HOLDER, ADD_SPOUSE, ADD_CHILD } from './QuizQuestions';

const COUNTRIES = [
    { code: '+55', flag: 'br', label: 'BR' },
    { code: '+34', flag: 'es', label: 'ES' },
    { code: '+1', flag: 'us', label: 'US' },
    { code: '+351', flag: 'pt', label: 'PT' },
    { code: '+44', flag: 'gb', label: 'UK' },
    { code: '+49', flag: 'de', label: 'DE' },
    { code: '+33', flag: 'fr', label: 'FR' },
    { code: '+39', flag: 'it', label: 'IT' },
];

const Quiz: React.FC = () => {
    const [step, setStep] = useState<'intro' | 'lead' | 'quiz' | 'result'>('intro');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(false);

    // Google Tag Manager for Quiz Page (GTM-NGPB795D)
    useEffect(() => {
        const script = document.createElement('script');
        script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NGPB795D');`;
        document.head.appendChild(script);

        return () => {
            // Optional: clean up script if needed, though GTM scripts are usually harmless if left
            // document.head.removeChild(script);
        };
    }, []);

    // Lead State
    const [leadData, setLeadData] = useState({
        name: '',
        email: '',
        countryCode: '+55',
        phone: ''
    });
    const [leadId, setLeadId] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState(false);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    const validatePhone = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 8 && cleanPhone.length <= 15;
    };

    const handleStart = () => setStep('lead');

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadData.name || !leadData.email || !leadData.phone) return;

        if (!validatePhone(leadData.phone)) {
            setPhoneError(true);
            return;
        }

        setLoading(true);
        try {
            const fullPhone = `${leadData.countryCode}${leadData.phone.replace(/\D/g, '')}`;
            const { data: { session } } = await supabase.auth.getSession();
            const result = await saveQuizLeadInitial({
                name: leadData.name,
                email: leadData.email,
                phone: fullPhone,
                user_id: session?.user?.id
            });

            if (result) {
                console.log('[Quiz] Lead saved successfully:', result.id);
                setLeadId(result.id);
                setStep('quiz');
            } else {
                console.error('[Quiz] Failed to save lead to database. Session/RLS issue?');
                setStep('quiz');
            }
        } catch (error) {
            console.error('[Quiz] Error submitting lead:', error);
            setStep('quiz');
        } finally {
            setLoading(false);
        }
    };

    const getNextQuestionIndex = (currentIndex: number, currentAnswers: Answer[]) => {
        let nextIndex = currentIndex + 1;
        while (nextIndex < QUESTIONS.length) {
            const question = QUESTIONS[nextIndex];
            if (!question.condition || question.condition(currentAnswers)) {
                return nextIndex;
            }
            nextIndex++;
        }
        return -1; // End of quiz
    };

    const getPrevQuestionIndex = (currentIndex: number, currentAnswers: Answer[]) => {
        let prevIndex = currentIndex - 1;
        while (prevIndex >= 0) {
            const question = QUESTIONS[prevIndex];
            if (!question.condition || question.condition(currentAnswers)) {
                return prevIndex;
            }
            prevIndex--;
        }
        return -1;
    };

    const handleAnswer = (points: number, value: string) => {
        const currentQuestion = QUESTIONS[currentQuestionIndex];

        // Remove previous answer if rewinding
        const filteredAnswers = answers.filter(a => a.id !== currentQuestion.id);
        const newAnswer = { id: currentQuestion.id, value, points };
        const newAnswers = [...filteredAnswers, newAnswer];

        setAnswers(newAnswers);

        // Salva progresso no banco (Abandono)
        if (leadId) {
            updateQuizLeadProgress(leadId, newAnswers);
        }

        setTimeout(async () => {
            const nextIndex = getNextQuestionIndex(currentQuestionIndex, newAnswers);

            if (nextIndex !== -1) {
                setCurrentQuestionIndex(nextIndex);
            } else {
                // End of Quiz
                finishQuiz(newAnswers);
            }
        }, 200);
    };

    const finishQuiz = async (finalAnswers: Answer[]) => {
        try {
            const calculation = calculateResult(finalAnswers);
            const score = finalAnswers.reduce((acc, curr) => acc + curr.points, 0);

            let success = false;

            console.log('[Quiz] finishing quiz with result:', calculation.status);

            // 1. TENTATIVA PRINCIPAL: ATUALIZAÇÃO (RPC ou Standard)
            if (leadId) {
                console.log('[Quiz] Primary Sync for lead:', leadId);
                const result = await updateQuizLeadFinal(leadId, calculation.status, score, finalAnswers);
                success = !!result;
                if (success) console.log('[Quiz] Primary Sync Successful');
            } else {
                console.warn('[Quiz] No leadId found. Skipping primary update.');
            }

            // 2. FALLBACK: CRIAÇÃO OU ATUALIZAÇÃO (Se a tentativa principal falhar)
            if (!success) {
                console.warn('[Quiz] Primary fails. Attempting Fallback Upsert/Sync...');
                const fullPhone = `${leadData.countryCode}${leadData.phone.replace(/\D/g, '')}`;
                const { data: { session } } = await supabase.auth.getSession();

                const payload: any = {
                    name: leadData.name || 'Sem nome',
                    email: leadData.email,
                    phone: fullPhone,
                    user_id: session?.user?.id,
                    result: calculation.status,
                    score: score,
                    status: 'completed',
                    answers: finalAnswers,
                    remote_work: finalAnswers.find(a => a.id === 'remote_work')?.value || null,
                    income_source: finalAnswers.find(a => a.id === 'income_source')?.value || null,
                    job_tenure: finalAnswers.find(a => a.id === 'job_tenure')?.value || null,
                    company_age: finalAnswers.find(a => a.id === 'company_age')?.value || null,
                    family_config: finalAnswers.find(a => a.id === 'family_config')?.value || null,
                    kids_count: finalAnswers.find(a => a.id === 'kids_count')?.value || null,
                    salary: finalAnswers.find(a => a.id === 'salary')?.value || null,
                    income_proof: finalAnswers.find(a => a.id === 'income_proof')?.value || null,
                    qualification: finalAnswers.find(a => a.id === 'qualification')?.value || null,
                    criminal_record: finalAnswers.find(a => a.id === 'criminal_record')?.value || null,
                    time_spain: finalAnswers.find(a => a.id === 'time_spain')?.value || null
                };

                // Tenta Upsert (se tiver leadId, faz update; se não, faz insert)
                const { data: fallbackResult, error: fallbackError } = await supabase
                    .from('quiz_leads')
                    .upsert(leadId ? [{ ...payload, id: leadId }] : [payload], { onConflict: 'id' })
                    .select()
                    .single();

                if (fallbackResult) {
                    console.log('[Quiz] Fallback Upsert success:', fallbackResult.id);
                    setLeadId(fallbackResult.id);
                } else {
                    console.error('[Quiz] Fallback Upsert failed (RLS?):', fallbackError);
                }
            }
        } catch (err) {
            console.error('[Quiz] error in final save process:', err);
        }
        setStep('result');
    };

    const calculateResult = (currentAnswers = answers) => {
        // --- 2. EXTRAÇÃO DE RESPOSTAS ---
        const getVal = (id: string) => currentAnswers.find(a => a.id === id)?.value;

        // Travas
        const notRemote = getVal('remote_work') === 'none';
        const spanishIncome = getVal('income_source') === 'inside';
        const lowTimeExp = getVal('job_tenure') === 'less_3';
        const newCompany = getVal('company_age') === 'new_company';
        const lowIncome = getVal('salary') === 'low';
        const noProof = getVal('income_proof') === 'no';
        const noQualification = getVal('qualification') === 'none';
        const hasCriminal = getVal('criminal_record') === 'yes';

        // --- 3. LÓGICA DE DECISÃO ---
        let failReasons: string[] = [];

        if (notRemote) failReasons.push('remote_nature');
        if (spanishIncome) failReasons.push('spanish_income');
        if (lowTimeExp) failReasons.push('job_tenure');
        if (newCompany) failReasons.push('company_age');
        if (lowIncome) failReasons.push('insufficient_income');
        if (noProof) failReasons.push('cant_prove');
        if (noQualification) failReasons.push('qualification');
        if (hasCriminal) failReasons.push('criminal');

        // Falha Crítica
        if (failReasons.length > 0) {
            return { status: 'C', reasons: failReasons };
        }

        // --- 4. PONTUAÇÃO PARA A vs B ---
        const totalPoints = currentAnswers.reduce((acc, curr) => acc + (curr.points || 0), 0);
        const isBorderlineIncome = getVal('salary') === 'borderline';

        if (totalPoints >= 60 && !isBorderlineIncome) {
            return { status: 'A', reasons: [] };
        }

        return { status: 'B', reasons: ['profile_strength'] };
    };

    const getResultData = (resultObj: { status: string, reasons: string[] }) => {
        const { status, reasons } = resultObj;

        switch (status) {
            case 'A':
                return {
                    title: "Elegível / Ideal ✅",
                    description: "Excelentes notícias! Seu perfil técnico se encaixa perfeitamente nos requisitos da Lei de Startups.",
                    color: "text-green-400",
                    bg: "bg-green-400/10",
                    border: "border-green-400/20",
                    icon: <CheckCircle2 className="w-12 h-12 text-green-400" />,
                    details: [
                        "Você cumpre a renda exigida para sua configuração familiar.",
                        "Possui vínculo remoto estável e empresa ativa há mais de 1 ano.",
                        "Tem qualificação e documentação básica alinhada.",
                        "AÇÃO RECOMENDADA: Você não precisa gastar milhares de euros com advogados. Com o guia passo-a-passo da nossa plataforma, você mesmo faz sua aplicação. Comece hoje mesmo!"
                    ]
                };
            case 'B':
                return {
                    title: "Potencial / Aprovado com Riscos ⚠️",
                    description: "Você tem os requisitos básicos, mas alguns pontos exigem atenção redobrada.",
                    color: "text-amber-400",
                    bg: "bg-amber-400/10",
                    border: "border-amber-400/20",
                    icon: <AlertCircle className="w-12 h-12 text-amber-400" />,
                    details: [
                        "Sua renda ou tempo de contrato podem estar no limite.",
                        "Um documento mal apresentado pode gerar atrasos ou negativa.",
                        "AÇÃO RECOMENDADA: Não corra riscos desnecessários. Nossa plataforma oferece modelos de cartas e explicação detalhada para 'blindar' seu dossiê. Transforme esse 'Talvez' em um 'Sim'."
                    ]
                };
            default: // Case C
                // Mapeamento de mensagens específicas para cada 'failReason'
                const reasonDetails = reasons.map(r => {
                    switch (r) {
                        case 'company_age':
                        case 'job_tenure':
                            return "Pela lei, sua relação de trabalho ou a empresa são muito recentes. DICA: Use esse tempo para preparar as traduções e apostilas na nossa plataforma e aplicar assim que completar o prazo.";
                        case 'insufficient_income':
                            return "Para levar sua família, o governo exige uma comprovação maior.";
                        case 'remote_nature':
                            return "O visto exige que o trabalho seja 100% remoto.";
                        case 'spanish_income':
                            return "Renda vinda da Espanha acima de 20% não é permitida neste visto.";
                        case 'cant_prove':
                            return "É indispensável ter como provar sua renda formalmente.";
                        case 'qualification':
                            return "Exige-se diploma universitário ou 3 anos de experiência.";
                        case 'criminal':
                            return "Antecedentes criminais são impeditivos.";
                        default:
                            return "Seu perfil precisa de ajustes nos requisitos básicos.";
                    }
                });

                return {
                    title: "Inadequado no momento / Requer Planejamento ❌",
                    description: "Atualmente, você não cumpre todos os requisitos, mas não desanime!",
                    color: "text-red-400",
                    bg: "bg-red-400/10",
                    border: "border-red-400/20",
                    icon: <XCircle className="w-12 h-12 text-red-400" />,
                    details: [
                        ...reasonDetails,
                        "AÇÃO RECOMENDADA: Não 'queime' seu visto aplicando errado agora. Use nossa plataforma para planejar sua aplicação futura e entender as regras a fundo."
                    ]
                };
        }
    };

    const currentQ = QUESTIONS[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
                <AnimatePresence mode="wait">
                    {step === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-card bg-navy-900/50 border-white/5 p-8 md:p-12 rounded-[2.5rem] text-center space-y-8"
                        >
                            <div className="w-20 h-20 bg-brand-yellow/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-10 h-10 text-brand-yellow" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-3xl font-black text-white leading-tight tracking-tight">
                                    Descubra se você pode viver legalmente na Espanha como <span className="text-brand-yellow">Nômade Digital.</span> 🇪🇸💻
                                </h1>
                                <p className="text-white/60 font-medium">
                                    Esse quiz vai analisar se você se encaixa nos critérios atualizados da lei espanhola (SMI 2026).
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                                <Clock className="w-4 h-4" />
                                <span>Leva menos de 3 minutos | Resultado no final</span>
                            </div>

                            <button
                                onClick={handleStart}
                                className="w-full py-5 bg-brand-yellow text-navy-950 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-3"
                            >
                                Começar <ChevronRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {step === 'lead' && (
                        <motion.div
                            key="lead"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card bg-navy-900/50 border-white/5 p-8 md:p-12 rounded-[2.5rem] space-y-8"
                        >
                            <div className="space-y-2 text-center">
                                <h2 className="text-2xl font-black text-white tracking-tight">Antes de começarmos...</h2>
                                <p className="text-white/60 text-sm font-medium">Deixe seus contatos para enviarmos o resumo detalhado do seu perfil.</p>
                            </div>

                            <form onSubmit={handleLeadSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Seu nome"
                                            className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                            value={leadData.name}
                                            onChange={e => setLeadData({ ...leadData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">E-mail</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                        <input
                                            required
                                            type="email"
                                            placeholder="exemplo@gmail.com"
                                            className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                            value={leadData.email}
                                            onChange={e => setLeadData({ ...leadData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">WhatsApp</label>
                                    <div className="relative flex gap-2 z-20">
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                className="w-24 px-3 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all flex items-center justify-between gap-2"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <img
                                                        src={`https://flagcdn.com/w20/${COUNTRIES.find(c => c.code === leadData.countryCode)?.flag || 'br'}.png`}
                                                        alt="flag"
                                                        className="w-5 h-3.5 object-cover rounded-sm"
                                                    />
                                                    <span className="text-sm">{leadData.countryCode}</span>
                                                </span>
                                                <ChevronRight className={`w-4 h-4 transition-transform ${showCountryDropdown ? 'rotate-90' : 'rotate-0'}`} />
                                            </button>

                                            {showCountryDropdown && (
                                                <div className="absolute top-full left-0 mt-2 w-48 max-h-60 overflow-y-auto bg-navy-900 border border-white/10 rounded-xl shadow-xl z-50">
                                                    {COUNTRIES.map((country) => (
                                                        <button
                                                            key={country.code}
                                                            type="button"
                                                            onClick={() => {
                                                                setLeadData({ ...leadData, countryCode: country.code });
                                                                setShowCountryDropdown(false);
                                                            }}
                                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                                                        >
                                                            <img
                                                                src={`https://flagcdn.com/w20/${country.flag}.png`}
                                                                alt={country.label}
                                                                className="w-5 h-3.5 object-cover rounded-sm"
                                                            />
                                                            <span className="text-white font-bold text-sm">{country.label}</span>
                                                            <span className="text-white/40 text-sm ml-auto">{country.code}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative flex-1">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                            <input
                                                required
                                                type="tel"
                                                placeholder="(00) 00000-0000"
                                                className={`w-full pl-12 pr-5 py-4 bg-white/5 border rounded-2xl text-white font-bold focus:outline-none transition-all ${phoneError ? 'border-red-500/50' : 'border-white/10 focus:border-brand-yellow'
                                                    }`}
                                                value={leadData.phone}
                                                onChange={e => {
                                                    setLeadData({ ...leadData, phone: e.target.value });
                                                    setPhoneError(false);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {phoneError && (
                                        <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest mt-1 pl-2">Por favor, insira um número válido.</p>
                                    )}
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full py-5 bg-brand-yellow text-navy-950 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? 'Processando...' : 'Avançar para o Quiz'} <ChevronRight className="w-5 h-5" />
                                </button>
                            </form>

                            <button
                                onClick={() => setStep('intro')}
                                className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Voltar
                            </button>
                        </motion.div>
                    )}

                    {step === 'quiz' && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card bg-navy-900/50 border-white/5 p-8 md:p-10 rounded-[2.5rem] space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden mr-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
                                        className="h-full bg-brand-yellow"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest whitespace-nowrap">
                                    {currentQuestionIndex + 1} / {QUESTIONS.length}
                                </span>
                            </div>

                            <div className="relative min-h-[340px]">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentQuestionIndex}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6"
                                    >
                                        <h2 className="text-2xl font-black text-white leading-tight">
                                            {typeof currentQ.question === 'function'
                                                ? currentQ.question(answers)
                                                : currentQ.question}
                                        </h2>

                                        <div className="grid gap-3">
                                            {currentQ.options.map((opt, i) => (
                                                <motion.button
                                                    key={`${currentQuestionIndex}-${i}`}
                                                    whileTap={{ scale: 0.95, backgroundColor: "rgba(250, 204, 21, 1)", color: "rgba(10, 15, 30, 1)" }}
                                                    onClick={(e) => {
                                                        (e.currentTarget as HTMLButtonElement).blur();
                                                        handleAnswer(opt.points, opt.value);
                                                    }}
                                                    className="w-full p-5 bg-white/5 border border-white/5 rounded-2xl text-left text-white/80 font-bold transition-all outline-none md:hover:bg-brand-yellow md:hover:text-navy-950 md:hover:border-brand-yellow group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{opt.text}</span>
                                                        <ChevronRight className="w-5 h-5 opacity-0 md:group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={() => {
                                    const prevIndex = getPrevQuestionIndex(currentQuestionIndex, answers);
                                    if (prevIndex !== -1) {
                                        setCurrentQuestionIndex(prevIndex);
                                        // Optional: Remove answer for current question when going back? 
                                        // For now, we prefer to keep state but updating it again wipes old forward state.
                                    } else {
                                        setStep('intro');
                                    }
                                }}
                                className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Voltar
                            </button>
                        </motion.div>
                    )}

                    {step === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card bg-navy-900/50 border-white/5 p-8 md:p-12 rounded-[2.5rem] text-center space-y-8"
                        >
                            {(() => {
                                const res = calculateResult();
                                const data = getResultData(res);
                                return (
                                    <>
                                        <div className={`w-24 h-24 ${data.bg} rounded-3xl flex items-center justify-center mx-auto mb-6 border ${data.border}`}>
                                            {data.icon}
                                        </div>

                                        <div className="space-y-4">
                                            <h2 className={`text-3xl font-black ${data.color} tracking-tight uppercase`}>
                                                {data.title}
                                            </h2>
                                            <p className="text-white font-bold text-lg leading-relaxed">
                                                {data.description}
                                            </p>
                                        </div>

                                        <div className="bg-white/5 rounded-3xl p-6 text-left space-y-4 border border-white/5">
                                            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-2">Análise do Perfil</h4>
                                            <ul className="space-y-3">
                                                {data.details.map((detail, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-white/70 font-medium leading-relaxed items-start">
                                                        <div className="w-1.5 h-1.5 bg-brand-yellow rounded-full mt-2 flex-shrink-0" />
                                                        <span>{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="space-y-4">
                                            <a
                                                href="https://wa.link/72twf9"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-5 bg-brand-yellow text-navy-950 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-3"
                                            >
                                                Quero saber como aplicar <Send className="w-4 h-4" />
                                            </a>
                                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                                                *Análise inicial apenas, não substitui consultoria jurídica.
                                            </p>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >
            {/* Google Tag Manager (noscript) for Quiz Page (GTM-NGPB795D) */}
            <noscript>
                <iframe
                    src="https://www.googletagmanager.com/ns.html?id=GTM-NGPB795D"
                    height="0"
                    width="0"
                    style={{ display: 'none', visibility: 'hidden' }}
                ></iframe>
            </noscript>
        </div >
    );
};

export default Quiz;

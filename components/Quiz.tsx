import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, CheckCircle2, AlertCircle, XCircle, Send, Clock, ArrowLeft, User, Mail, Phone } from 'lucide-react';
import { saveQuizLeadInitial, updateQuizLeadFinal, supabase } from '../lib/supabase';

type Question = {
    id: number;
    question: string;
    options: {
        text: string;
        value: string;
        points: number;
    }[];
};

const QUESTIONS: Question[] = [
    {
        id: 1,
        question: "Como você trabalha atualmente?",
        options: [
            { text: "Trabalho remotamente para uma empresa", value: "employee", points: 10 },
            { text: "Sou freelancer / prestador de serviços", value: "freelancer", points: 10 },
            { text: "Tenho um negócio online", value: "business", points: 10 },
            { text: "Não trabalho de forma remota", value: "none", points: 0 },
        ]
    },
    {
        id: 2,
        question: "De onde vem sua renda principal?",
        options: [
            { text: "100% de fora da Espanha", value: "outside", points: 10 },
            { text: "Parte de fora, parte da Espanha", value: "mixed", points: 5 },
            { text: "Da Espanha", value: "inside", points: 0 },
        ]
    },
    {
        id: 3,
        question: "Há quanto tempo você presta serviço nesta modalidade?",
        options: [
            { text: "Há 1 ano ou mais", value: "more_1y", points: 10 },
            { text: "Entre 3 e 6 meses", value: "3_6", points: 5 },
            { text: "Menos de 3 meses", value: "less_3", points: 0 },
        ]
    },
    {
        id: 4,
        question: "Qual sua renda média mensal?",
        options: [
            { text: "Acima de €3.000 (~R$ 18.000)", value: "high", points: 15 },
            { text: "Entre €2.500 e €3.000 (~R$ 15.000 - R$ 18.000)", value: "mid", points: 10 },
            { text: "Menos de €2.500 (~R$ 15.000)", value: "low", points: 0 },
        ]
    },
    {
        id: 5,
        question: "Você consegue comprovar essa renda?",
        options: [
            { text: "Sim", value: "yes", points: 10 },
            { text: "Parcialmente", value: "partial", points: 5 },
            { text: "Não", value: "no", points: 0 },
        ]
    },
    {
        id: 6,
        question: "Em qual forma de comprovação profissional você se enquadra?",
        options: [
            { text: "Diploma universitário", value: "degree", points: 10 },
            { text: "Experiência profissional de 3 anos ou mais comprovada", value: "exp_3y", points: 10 },
            { text: "Nenhum dos dois", value: "none", points: 0 },
        ]
    },
    {
        id: 7,
        question: "Você teve antecedentes criminais nos últimos 5 anos?",
        options: [
            { text: "Não", value: "no", points: 10 },
            { text: "Sim", value: "yes", points: -50 },
        ]
    },
    {
        id: 8,
        question: "Por quanto tempo você pretende morar na Espanha?",
        options: [
            { text: "Por 3 anos ou mais", value: "3y_more", points: 10 },
            { text: "Pelo menos 1 ano", value: "1y_more", points: 10 },
            { text: "Ainda não sei", value: "unknown", points: 5 },
        ]
    }
];

const Quiz: React.FC = () => {
    const [step, setStep] = useState<'intro' | 'lead' | 'quiz' | 'result'>('intro');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<{ value: string; points: number }[]>([]);
    const [loading, setLoading] = useState(false);

    // Lead State
    const [leadData, setLeadData] = useState({
        name: '',
        email: '',
        countryCode: '+55',
        phone: ''
    });
    const [leadId, setLeadId] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState(false);

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
                setLeadId(result.id);
                setStep('quiz');
            } else {
                // Fallback: Se o banco falhar, deixa o usuário fazer o quiz mesmo assim para não travar
                console.warn('Banco de dados não salvou o lead, mas permitindo quiz...');
                setStep('quiz');
            }
        } catch (error) {
            console.error('Error submitting lead:', error);
            // Fallback total
            setStep('quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (points: number, value: string) => {
        const newAnswers = [...answers, { points, value }];
        setAnswers(newAnswers);

        // Pequeno delay para o usuário ver o clique antes de avançar (melhora UX mobile)
        setTimeout(async () => {
            if (currentQuestion < QUESTIONS.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
            } else {
                // Salvar resultado final no banco
                if (leadId) {
                    const resultGrade = calculateResult(newAnswers);
                    const score = newAnswers.reduce((acc, curr) => acc + curr.points, 0);
                    await updateQuizLeadFinal(leadId, resultGrade, score);
                }
                setStep('result');
            }
        }, 200);
    };

    const calculateResult = (currentAnswers = answers) => {
        // Regras de "Deal-breakers" (Trava obrigatória)
        const hasLowIncome = currentAnswers.some(a => a.value === 'low'); // Menos de 2.500€
        const hasLowExperience = currentAnswers.some(a => a.value === 'less_3'); // Menos de 3 meses
        const hasCriminalRecord = currentAnswers.some(a => a.value === 'yes' && QUESTIONS[6].id === 7);

        if (hasLowIncome || hasLowExperience || hasCriminalRecord) {
            return 'C';
        }

        const totalPoints = currentAnswers.reduce((acc, curr) => acc + curr.points, 0);

        if (totalPoints >= 70) return 'A';
        if (totalPoints >= 40) return 'B';
        return 'C';
    };

    const getResultData = (result: string) => {
        const hasLowIncome = answers.some(a => a.value === 'low');
        const hasLowExperience = answers.some(a => a.value === 'less_3');

        switch (result) {
            case 'A':
                return {
                    title: "Elegível ✅",
                    description: "Você atende aos principais critérios do visto de nômade digital da Espanha.",
                    color: "text-green-400",
                    bg: "bg-green-400/10",
                    border: "border-green-400/20",
                    icon: <CheckCircle2 className="w-12 h-12 text-green-400" />,
                    details: [
                        "Seu perfil profissional remoto está bem estabelecido.",
                        "Sua renda atende ou supera o mínimo exigido.",
                        "A documentação acadêmica ou profissional é um ponto forte.",
                        "Próximos passos: Organizar a lista de documentos e iniciar a aplicação."
                    ]
                };
            case 'B':
                return {
                    title: "Possivelmente elegível ⚠️",
                    description: "Você tem um perfil promissor, mas alguns pontos precisam de atenção antes de aplicar.",
                    color: "text-amber-400",
                    bg: "bg-amber-400/10",
                    border: "border-amber-400/20",
                    icon: <AlertCircle className="w-12 h-12 text-amber-400" />,
                    details: [
                        "Sua renda está próxima do limite e pode precisar de mais garantias.",
                        "O tempo de vínculo com a empresa ou clientes pode ser um ponto de dúvida.",
                        "Recomendação: Aguardar completar 3 meses de vínculo estável ou aumentar a renda média.",
                        "Sugestão: Preparar evidências extras de formação ou experiência profissional."
                    ]
                };
            default:
                const reasons = [];
                if (hasLowIncome) reasons.push("Sua renda atual está abaixo do mínimo exigido pelo governo espanhol (€2.500/mês).");
                if (hasLowExperience) reasons.push("O tempo de contrato ou prestação de serviço é inferior a 3 meses (exigência mínima).");
                if (!hasLowIncome && !hasLowExperience) reasons.push("Seu perfil atual não atende aos critérios fundamentais (renda, tempo de vínculo ou antecedentes).");

                return {
                    title: "Não elegível no momento ❌",
                    description: "Atualmente você não atende aos critérios essenciais para esse visto.",
                    color: "text-red-400",
                    bg: "bg-red-400/10",
                    border: "border-red-400/20",
                    icon: <XCircle className="w-12 h-12 text-red-400" />,
                    details: [
                        ...reasons,
                        "O que fazer: Buscar uma oportunidade remota que atenda ao valor mínimo estipulado ou aguardar o tempo de vínculo necessário."
                    ]
                };
        }
    };

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
                                    Esse quiz vai analisar se você se encaixa nos critérios gerais do visto de nômade digital da Espanha.
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
                                    <div className="flex gap-2">
                                        <select
                                            className="w-24 px-3 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all appearance-none"
                                            value={leadData.countryCode}
                                            onChange={e => setLeadData({ ...leadData, countryCode: e.target.value })}
                                        >
                                            <option value="+55">🇧🇷 +55</option>
                                            <option value="+34">🇪🇸 +34</option>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+351">🇵🇹 +351</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+49">🇩🇪 +49</option>
                                            <option value="+33">🇫🇷 +33</option>
                                            <option value="+39">🇮🇹 +39</option>
                                        </select>
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
                                        animate={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                                        className="h-full bg-brand-yellow"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest whitespace-nowrap">
                                    {currentQuestion + 1} / {QUESTIONS.length}
                                </span>
                            </div>

                            <div className="relative min-h-[340px]">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentQuestion}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6"
                                    >
                                        <h2 className="text-2xl font-black text-white leading-tight">
                                            {QUESTIONS[currentQuestion].question}
                                        </h2>

                                        <div className="grid gap-3">
                                            {QUESTIONS[currentQuestion].options.map((opt, i) => (
                                                <motion.button
                                                    key={`${currentQuestion}-${i}`} // Chave única por pergunta para forçar re-render total
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
                                    if (currentQuestion > 0) {
                                        setCurrentQuestion(currentQuestion - 1);
                                        setAnswers(answers.slice(0, -1));
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
            </div>
        </div>
    );
};

export default Quiz;

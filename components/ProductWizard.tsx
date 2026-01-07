import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ListTodo,
    Newspaper,
    Crown,
    Sparkles,
    ChevronRight,
    X,
    Target,
    Users
} from 'lucide-react';

interface ProductWizardProps {
    onClose: () => void;
}

const ProductWizard: React.FC<ProductWizardProps> = ({ onClose }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Bem-vindo ao NomadFlow!",
            description: "Sua plataforma definitiva para organizar sua imigração para a Espanha. Vamos fazer um tour rápido?",
            icon: <Sparkles className="w-8 h-8 text-brand-yellow" />,
            color: "from-brand-yellow/20 to-transparent"
        },
        {
            title: "Dashboard Inteligente",
            description: "Aqui você acompanha sua meta financeira, câmbio em tempo real e o progresso da sua 'Expedição Espanha'.",
            icon: <LayoutDashboard className="w-8 h-8 text-blue-400" />,
            color: "from-blue-500/20 to-transparent"
        },
        {
            title: "Checklist de Documentos",
            description: "Na aba 'Tarefas', gerenciamos cada documento necessário, avisando o que precisa de tradução ou apostila.",
            icon: <ListTodo className="w-8 h-8 text-green-400" />,
            color: "from-green-500/20 to-transparent"
        },
        {
            title: "Conteúdo Curado",
            description: "Em 'News', você encontra guias práticos e todas as atualizações sobre o Visto de Nômade Digital.",
            icon: <Newspaper className="w-8 h-8 text-purple-400" />,
            color: "from-purple-500/20 to-transparent"
        },
        {
            title: "Hub Elite & Comunidade",
            description: "Acesse tutoriais em vídeo exclusivos e troque experiências com outros nômades que já estão na Espanha.",
            icon: <Crown className="w-8 h-8 text-brand-yellow" />,
            color: "from-brand-yellow/20 to-transparent"
        },
        {
            title: "Tudo Pronto!",
            description: "Agora é com você. Comece preenchendo seus dados e organizando seus primeiros documentos. Boa sorte!",
            icon: <Target className="w-8 h-8 text-red-400" />,
            color: "from-red-500/20 to-transparent"
        }
    ];

    const nextStep = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-navy-950/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-navy-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5 flex">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-full transition-all duration-500 ${i <= step ? 'flex-1 bg-brand-yellow' : 'flex-1 bg-transparent'}`}
                        />
                    ))}
                </div>

                {/* Decorative Background */}
                <div className={`absolute inset-0 bg-gradient-to-b ${steps[step].color} pointer-events-none transition-all duration-500`} />

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-10 md:p-12 space-y-8 relative z-10 text-center">
                    <div className="flex justify-center">
                        <motion.div
                            key={step}
                            initial={{ scale: 0.5, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-xl mb-4"
                        >
                            {steps[step].icon}
                        </motion.div>
                    </div>

                    <div className="space-y-4">
                        <motion.h2
                            key={`title-${step}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-black text-white tracking-tighter"
                        >
                            {steps[step].title}
                        </motion.h2>
                        <motion.p
                            key={`desc-${step}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-blue-100/60 font-medium leading-relaxed"
                        >
                            {steps[step].description}
                        </motion.p>
                    </div>

                    <div className="pt-4 flex flex-col gap-4">
                        <button
                            onClick={nextStep}
                            className="w-full py-5 bg-brand-yellow text-brand-dark rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-white hover:text-navy-950 transition-all flex items-center justify-center gap-2 group"
                        >
                            {step === steps.length - 1 ? 'Começar Jornada' : 'Próximo Passo'}
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={onClose}
                            className="text-xs font-bold text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em]"
                        >
                            Pular Tour
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductWizard;

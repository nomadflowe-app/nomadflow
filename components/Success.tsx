import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuccessProps {
    onContinue: () => void;
}

const Success: React.FC<SuccessProps> = ({ onContinue }) => {
    useEffect(() => {
        // Efeito de confete ao carregar
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 space-y-8">
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="relative"
            >
                <div className="w-32 h-32 bg-gradient-to-br from-gold-400 to-gold-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-gold-500/40">
                    <Crown className="w-16 h-16 text-white" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-navy-950"
                >
                    <CheckCircle2 className="w-8 h-8 text-white" />
                </motion.div>
            </motion.div>

            <div className="space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-black text-white tracking-tight"
                >
                    ¡Bienvenido, <span className="text-gold-500 text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-200">Elite</span>!
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-blue-200/60 font-medium max-w-xs mx-auto"
                >
                    Seu acesso ilimitado foi desbloqueado com sucesso. Prepare-se para sua jornada na Espanha!
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-2 gap-4 w-full max-w-sm"
            >
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <Sparkles className="w-5 h-5 text-gold-500 mb-2" />
                    <span className="text-[10px] font-black uppercase text-white/40 block">Checklist</span>
                    <span className="text-sm font-bold text-white">100% Liberado</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <Crown className="w-5 h-5 text-gold-500 mb-2" />
                    <span className="text-[10px] font-black uppercase text-white/40 block">Comunidade</span>
                    <span className="text-sm font-bold text-white">VIP Ativado</span>
                </div>
            </motion.div>

            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={onContinue}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-navy-950 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
                Começar Expedição
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
        </div>
    );
};

export default Success;

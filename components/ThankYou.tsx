import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Rocket,
    Instagram,
    MessageCircle,
    Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ThankYou: React.FC = () => {
    useEffect(() => {
        // Fallback para window.confetti (mais estável em mobile via CDN)
        const fire = (window as any).confetti || confetti;

        const runConfetti = () => {
            // Disparo inicial central
            fire({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 10000,
                useWorker: true,
                scalar: 1.2
            });

            // Tiros laterais
            setTimeout(() => {
                fire({
                    particleCount: 80,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.6 },
                    zIndex: 10000,
                    scalar: 1.2
                });
            }, 200);

            setTimeout(() => {
                fire({
                    particleCount: 80,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.6 },
                    zIndex: 10000,
                    scalar: 1.2
                });
            }, 400);
        };

        // Pequeno delay para garantir que o layout mobile renderizou
        const timeoutId = setTimeout(runConfetti, 500);

        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000, scalar: 1.1 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 30 * (timeLeft / duration);
            fire({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            fire({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 350);

        return () => {
            clearInterval(interval);
            clearTimeout(timeoutId);
        };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-yellow/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="visible"
                animate="visible"
                className="max-w-2xl w-full text-center space-y-12 relative z-10"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="relative inline-block">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                            className="w-24 h-24 bg-gradient-to-br from-brand-yellow to-yellow-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-yellow/20"
                        >
                            <ShieldCheck className="w-12 h-12 text-navy-950" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-navy-950 shadow-lg"
                        >
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </motion.div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                            ¡Sua Jornada <span className="text-brand-yellow">Elite</span> Começa Agora!
                        </h1>
                        <p className="text-blue-200/60 text-lg font-medium max-w-lg mx-auto">
                            Pagamento confirmado com sucesso. Você acaba de dar o passo mais importante para sua vida na Espanha.
                        </p>
                    </div>
                </motion.div>

                {/* Features Unlocked Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: <Rocket className="w-5 h-5" />, title: "Acesso Total", desc: "Toda a plataforma liberada" },
                        { icon: <Sparkles className="w-5 h-5" />, title: "Checklist", desc: "Passo a passo completo" },
                        { icon: <ShieldCheck className="w-5 h-5" />, title: "Comunidade", desc: "Networking VIP ativado" }
                    ].map((item, idx) => (
                        <div key={idx} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-brand-yellow/30 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow mb-4 mx-auto group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                            <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest">{item.desc}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Next Steps / CTA */}
                <motion.div variants={itemVariants} className="space-y-8">
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl space-y-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-left space-y-1">
                                <h4 className="text-white font-bold text-lg">Próximo passo:</h4>
                                <p className="text-white/60 text-sm">Acesse seu painel e comece a preencher seu perfil.</p>
                            </div>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="group flex items-center justify-center gap-3 px-8 py-5 bg-brand-yellow text-navy-950 rounded-2xl font-black uppercase tracking-widest hover:scale-105 hover:bg-white active:scale-95 transition-all shadow-xl shadow-brand-yellow/10 w-full md:w-auto"
                            >
                                Ir para o Dashboard
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Support Links */}
                    <div className="flex flex-wrap justify-center gap-8 pt-4">
                        <a href="#" className="flex items-center gap-2 text-white/40 hover:text-white transition-all">
                            <Instagram className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">@nomadflow</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 text-white/40 hover:text-white transition-all">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Suporte VIP</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 text-white/40 hover:text-white transition-all">
                            <Mail className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">E-mail</span>
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ThankYou;

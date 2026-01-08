import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Users, Star, TrendingUp, Handshake, Globe } from 'lucide-react';

const BeAPartner: React.FC = () => {
    return (
        <div className="min-h-screen bg-navy-950 font-sans text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <header className="p-6 md:p-12 relative z-10 flex items-center justify-between max-w-7xl mx-auto">
                <Link to="/" className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">Voltar para Home</span>
                </Link>
                <div className="text-xl font-black tracking-tighter">Nomad<span className="text-brand-yellow">Flow</span></div>
            </header>

            <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-yellow/10 rounded-lg border border-brand-yellow/20 text-brand-yellow font-bold text-xs uppercase tracking-widest">
                            <Star className="w-3 h-3 fill-brand-yellow" />
                            Seja um Parceiro
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.1] md:leading-[1.1]">
                            Cresça junto com&nbsp;a
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-white to-brand-yellow bg-[200%_auto] animate-shine mt-2">
                                Revolução Nômade.
                            </span>
                        </h1>

                        <p className="text-lg text-blue-100/60 leading-relaxed max-w-xl">
                            Você é um influenciador, criador de conteúdo ou representa uma empresa que atende nômades digitais? Vamos construir algo grandioso juntos.
                        </p>

                        <div className="space-y-4 text-blue-100/60 font-medium">
                            <p>✔️ Conecte-se com brasileiros indo para a Espanha</p>
                            <p>✔️ Parceria flexível e aberta a negociação</p>
                            <p>✔️ Vamos crescer juntos!</p>
                        </div>

                    </motion.div>

                    {/* Right Content - Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-yellow/20 to-transparent blur-3xl -z-10" />

                        <form className="glass-card bg-navy-900/50 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white">Vamos conversar?</h3>
                                <p className="text-sm text-white/50">Preencha os dados abaixo e nossa equipe entrará em contato.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-brand-yellow uppercase tracking-widest ml-2">Nome</label>
                                        <input type="text" placeholder="Seu nome" className="w-full bg-navy-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-yellow transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-brand-yellow uppercase tracking-widest ml-2">Empresa / @</label>
                                        <input type="text" placeholder="@seuinstagram" className="w-full bg-navy-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-yellow transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-brand-yellow uppercase tracking-widest ml-2">Email Profissional</label>
                                    <input type="email" placeholder="contato@exemplo.com" className="w-full bg-navy-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-yellow transition-colors" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-brand-yellow uppercase tracking-widest ml-2">Como podemos colaborar?</label>
                                    <textarea rows={4} placeholder="Conte um pouco sobre sua audiência e ideias de parceria..." className="w-full bg-navy-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-yellow transition-colors resize-none" />
                                </div>
                            </div>

                            <button type="button" className="w-full py-4 bg-brand-yellow text-navy-950 rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group">
                                Enviar Proposta
                                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <p className="text-center text-[10px] text-white/30 uppercase tracking-widest">
                                Ao enviar, você concorda com nossos termos de parceria.
                            </p>
                        </form>
                    </motion.div>

                </div>
            </main>
        </div>
    );
};



export default BeAPartner;

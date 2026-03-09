import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock,
    PlayCircle,
    Calendar,
    Users,
    Video,
    Clock,
    ArrowRight,
    ExternalLink,
    MessageCircle,
    CheckCircle2,
    Sparkles,
    GraduationCap,
    Globe
} from 'lucide-react';
import { UserProfile } from '../types';

type SpanishTab = 'Conteúdo' | 'Agenda' | 'Particular';

const SPANISH_VIDEOS = [
    {
        id: 'es1',
        title: 'Espanhol no Aeroporto e Imigração',
        instructor: 'Prof. Ana Garcia',
        duration: '45 min',
        thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80',
        desc: 'Termos essenciais para passar pela imigração sem medo.'
    },
    {
        id: 'es2',
        title: 'Alugando Imóvel em Madri/Barcelona',
        instructor: 'Prof. Ana Garcia',
        duration: '52 min',
        thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80',
        desc: 'Vocabulário para ler contratos e falar com imobiliárias.'
    },
    {
        id: 'es3',
        title: 'Saúde e Farmácia: O que dizer?',
        instructor: 'Prof. Ana Garcia',
        duration: '38 min',
        thumbnail: 'https://images.unsplash.com/photo-1576091160550-217359f49f4a?auto=format&fit=crop&q=80',
        desc: 'Como explicar sintomas e comprar medicamentos.'
    }
];

const SpanishModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SpanishTab>('Conteúdo');
    const [profile] = useState<UserProfile>(() => {
        return JSON.parse(localStorage.getItem('nomad_profile') || '{}');
    });

    const hasAccess = profile?.hasSpanishAccess || profile?.isAdmin;

    if (!hasAccess) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full p-12 rounded-[3rem] bg-white/5 border border-white/10 text-center space-y-8 backdrop-blur-xl"
                >
                    <div className="w-20 h-20 bg-brand-yellow/10 rounded-3xl flex items-center justify-center text-brand-yellow mx-auto mb-6">
                        <Lock className="w-10 h-10" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-white tracking-tight">Módulo de Espanhol Bloqueado</h2>
                        <p className="text-blue-200/60 font-medium leading-relaxed">
                            Este módulo é exclusivo para alunos do curso de Espanhol com a Prof. Ana Garcia.
                            Domine o idioma e chegue na Espanha com confiança total.
                        </p>
                    </div>
                    <div className="pt-4">
                        <button className="w-full py-4 bg-brand-yellow text-navy-950 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-yellow/10">
                            Saber Mais sobre o Curso
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="pb-32 space-y-8 max-w-7xl mx-auto">
            <header className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-brand-yellow to-yellow-600 rounded-2xl flex items-center justify-center text-navy-950 shadow-lg shadow-brand-yellow/20">
                            <Globe className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Espanhol Nomad</h1>
                            <p className="text-blue-200/60 font-medium">Domine o idioma da sua nova vida.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Professor Online</span>
                        </div>
                    </div>
                </div>

                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
                    {(['Conteúdo', 'Agenda', 'Particular'] as SpanishTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all z-10 ${activeTab === tab ? 'text-navy-950' : 'text-white/40'}`}
                        >
                            {tab}
                        </button>
                    ))}
                    <motion.div
                        initial={false}
                        animate={{
                            x: activeTab === 'Conteúdo' ? '0%' : activeTab === 'Agenda' ? '100%' : '200%'
                        }}
                        className="absolute h-[calc(100%-8px)] w-[calc(33.33%-4px)] top-1 left-1 bg-brand-yellow rounded-xl shadow-lg"
                    />
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === 'Conteúdo' && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {SPANISH_VIDEOS.map(video => (
                            <div key={video.id} className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-brand-yellow/30 transition-all hover:-translate-y-1">
                                <div className="aspect-video relative overflow-hidden">
                                    <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                    <div className="absolute inset-0 bg-navy-950/40 group-hover:bg-navy-950/20 transition-all flex items-center justify-center">
                                        <div className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center text-navy-950 transform group-hover:scale-110 transition-transform">
                                            <PlayCircle className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-navy-950/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-brand-yellow" />
                                            {video.duration}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-brand-yellow text-[10px] font-black uppercase tracking-widest">{video.instructor}</p>
                                        <h3 className="text-xl font-bold text-white group-hover:text-brand-yellow transition-colors leading-tight">{video.title}</h3>
                                    </div>
                                    <p className="text-sm text-blue-200/60 line-clamp-2">{video.desc}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'Agenda' && (
                    <motion.div
                        key="agenda"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Proxima Live - Jitsi Embed */}
                            <div className="md:col-span-2 p-1 rounded-[3rem] bg-gradient-to-br from-brand-yellow/20 to-brand-yellow/5 border border-brand-yellow/20 overflow-hidden">
                                <div className="bg-navy-950/50 p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white animate-pulse">
                                            <Video className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-xl font-black text-white">Sala de Aulas Ao Vivo</h3>
                                            <p className="text-white/60 font-medium text-xs">Entrar na sala com câmera e microfone habilitados.</p>
                                        </div>
                                    </div>
                                    <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                                        AO VIVO
                                    </span>
                                </div>
                                <div className="aspect-video w-full bg-black relative">
                                    <iframe
                                        src="https://meet.jit.si/NomadFlowSpanishClassDemo"
                                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                                        className="w-full h-full border-0"
                                        title="Jitsi Meet"
                                    ></iframe>
                                </div>
                            </div>

                            {/* Calendário Mensal */}
                            <div className="md:col-span-2 p-10 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-white uppercase tracking-widest">Programação Mensal</h3>
                                    <Calendar className="w-5 h-5 text-white/40" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { day: '05 Mar', topic: 'Vocabulário de Aluguel', type: 'Live' },
                                        { day: '12 Mar', topic: 'Saúde e Hospitais', type: 'Live' },
                                        { day: '19 Mar', topic: 'Trabalho e Networking', type: 'Workshop' },
                                        { day: '26 Mar', topic: 'Tira-dúvidas Geral', type: 'Live' }
                                    ].map((event, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 text-center border-r border-white/10 pr-4">
                                                    <p className="text-white font-black leading-none">{event.day.split(' ')[0]}</p>
                                                    <p className="text-[8px] text-white/40 uppercase font-bold">{event.day.split(' ')[1]}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">{event.topic}</p>
                                                    <span className="text-[10px] text-brand-yellow font-black uppercase tracking-tighter">{event.type}</span>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                                                <div className="w-1.5 h-1.5 bg-brand-yellow rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'Particular' && (
                    <motion.div
                        key="booking"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="max-w-4xl mx-auto space-y-12">
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl font-black text-white tracking-tight">Agendamento 1-on-1</h2>
                                <p className="text-blue-200/60 font-medium max-w-lg mx-auto leading-relaxed">
                                    Reserve seu horário exclusivo com a professora para tirar dúvidas ou praticar conversação.
                                </p>
                            </div>

                            {/* Calendly Integration */}
                            <div className="w-full h-[700px] bg-white border border-white/10 rounded-[3rem] overflow-hidden relative shadow-2xl">
                                <iframe
                                    src="https://calendly.com/young-werther-design-co/demo-call?hide_gdpr_banner=1&background_color=1a1a1a&text_color=ffffff&primary_color=fbbf24"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    title="Agendamento"
                                ></iframe>
                            </div>

                            {/* Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { icon: <Clock />, label: "Duração", val: "50 min / aula" },
                                    { icon: <Video />, label: "Plataforma", val: "Google Meet" },
                                    { icon: <MessageCircle />, label: "Suporte", val: "WhatsApp Individual" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3">
                                        <div className="text-brand-yellow">{item.icon}</div>
                                        <div className="space-y-1">
                                            <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">{item.label}</p>
                                            <p className="text-white font-bold">{item.val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpanishModule;

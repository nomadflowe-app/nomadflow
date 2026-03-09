import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Video,
    Calendar,
    Users,
    MessageCircle,
    Settings,
    Plus,
    Clock,
    Sparkles,
    CheckCircle2,
    ExternalLink,
    Play
} from 'lucide-react';

const SpanishTeacherPortal: React.FC = () => {
    const [isRoomOpen, setIsRoomOpen] = useState(false);

    const students = [
        { id: '1', name: 'Andrew', email: 'andrew@example.com', credits: 2, lastLesson: '15/02' },
        { id: '2', name: 'Mariana', email: 'mariana@nomad.com', credits: 5, lastLesson: '12/02' },
        { id: '3', name: 'Ricardo', email: 'ricardo@visas.es', credits: 0, lastLesson: '10/02' }
    ];

    const upcomingBookings = [
        { id: 'b1', student: 'Andrew', time: 'Amanhã, às 14:00', type: '1-on-1' },
        { id: 'b2', student: 'Mariana', time: 'Quinta, às 10:30', type: '1-on-1' }
    ];

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/10 p-8 rounded-[3rem]">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-navy-950 rounded-2xl flex items-center justify-center border border-white/10">
                        <img src="https://picsum.photos/seed/teacher/100" className="w-full h-full object-cover rounded-2xl" alt="Prof. Ana" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Portal da Professora</h2>
                        <p className="text-brand-yellow font-black uppercase text-[10px] tracking-widest">Prof. Ana Garcia</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsRoomOpen(!isRoomOpen)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${isRoomOpen
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-brand-yellow text-navy-950 hover:scale-105'
                            }`}
                    >
                        {isRoomOpen ? <><Clock className="w-5 h-5" /> Encerrar Aula</> : <><Video className="w-5 h-5" /> Iniciar Aula Ao Vivo</>}
                    </button>
                    <button className="p-4 bg-white/10 rounded-2xl text-white border border-white/10 hover:bg-white hover:text-navy-950 transition-all">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Status Column */}
                <div className="lg:col-span-2 space-y-8">
                    {isRoomOpen ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-1 rounded-[3rem] bg-red-600/20 border border-red-600/30 overflow-hidden"
                        >
                            <div className="bg-navy-950/50 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                                    <span className="text-white font-black uppercase text-[10px] tracking-widest">Sala Permanente Ativa</span>
                                </div>
                                <span className="text-white/40 text-[10px] font-bold">Monitorando participações...</span>
                            </div>
                            <div className="aspect-video bg-black relative">
                                <iframe
                                    src="https://meet.jit.si/NomadFlowSpanishClassDemo"
                                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                                    className="w-full h-full border-0"
                                    title="Teacher Monitor"
                                ></iframe>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                                <div className="w-12 h-12 bg-brand-yellow/10 rounded-2xl flex items-center justify-center text-brand-yellow">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-white">42</p>
                                    <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Alunos Ativos</p>
                                </div>
                            </div>
                            <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-white">128</p>
                                    <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Aulas Concluídas</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Students Table */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-black text-white tracking-tight">Meus Alunos</h3>
                            <button className="text-[10px] font-black uppercase tracking-widest text-brand-yellow flex items-center gap-2">
                                Ver todos <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="divide-y divide-white/5">
                            {students.map(student => (
                                <div key={student.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                                            {student.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{student.name}</p>
                                            <p className="text-white/40 text-xs">{student.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="hidden sm:block text-right">
                                            <p className={`text-xs font-black ${student.credits > 0 ? 'text-brand-yellow' : 'text-red-500'}`}>
                                                {student.credits} aulas
                                            </p>
                                            <p className="text-[10px] text-white/40 uppercase font-medium">Saldo</p>
                                        </div>
                                        <button className="p-2 bg-white/10 rounded-lg text-white hover:bg-brand-yellow hover:text-navy-950 transition-all">
                                            <MessageCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Next Class Booking */}
                    <div className="p-8 bg-brand-yellow text-navy-950 rounded-[2.5rem] space-y-6 shadow-xl shadow-brand-yellow/10">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5" />
                            <h3 className="font-black uppercase text-xs tracking-widest">Próximos Agendamentos</h3>
                        </div>
                        <div className="space-y-4">
                            {upcomingBookings.map(booking => (
                                <div key={booking.id} className="p-4 bg-navy-950/10 rounded-2xl space-y-2">
                                    <p className="font-black text-sm">{booking.student}</p>
                                    <div className="flex items-center justify-between opacity-60">
                                        <span className="text-[10px] font-bold">{booking.time}</span>
                                        <span className="text-[9px] px-2 py-0.5 border border-navy-950/20 rounded-md font-black">{booking.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-3 border border-navy-950/20 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-navy-950 hover:text-white transition-all">
                            Gerenciar Agenda completa
                        </button>
                    </div>

                    {/* Resources */}
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
                        <h3 className="text-white font-black uppercase text-xs tracking-widest">Recursos Rápidos</h3>
                        <div className="grid gap-3">
                            <button className="w-full p-4 bg-white/5 rounded-2xl flex items-center justify-between group hover:bg-brand-yellow/10 transition-all border border-transparent hover:border-brand-yellow/20">
                                <div className="flex items-center gap-3">
                                    <Plus className="w-4 h-4 text-white/40 group-hover:text-brand-yellow" />
                                    <span className="text-white font-bold text-sm">Postar Novo Material</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/20" />
                            </button>
                            <button className="w-full p-4 bg-white/5 rounded-2xl flex items-center justify-between group hover:bg-brand-yellow/10 transition-all border border-transparent hover:border-brand-yellow/20">
                                <div className="flex items-center gap-3">
                                    <MessageCircle className="w-4 h-4 text-white/40 group-hover:text-brand-yellow" />
                                    <span className="text-white font-bold text-sm">Chat da Comunidade</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/20" />
                            </button>
                            <button className="w-full p-4 bg-white/5 rounded-2xl flex items-center justify-between group hover:bg-brand-yellow/10 transition-all border border-transparent hover:border-brand-yellow/20">
                                <div className="flex items-center gap-3">
                                    <Video className="w-4 h-4 text-white/40 group-hover:text-brand-yellow" />
                                    <span className="text-white font-bold text-sm">Gravações Anteriores</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/20" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ArrowRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
);

export default SpanishTeacherPortal;

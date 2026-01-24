import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    User,
    CreditCard,
    FileText,
    Sparkles,
    ListTodo,
    Plus,
    X,
    Lock,
    Crown
} from 'lucide-react';
import { Category, UserProfile } from '../types';
import { ChecklistItemCard } from './ChecklistItemCard';
import { useChecklist } from '../context/ChecklistContext';
// PremiumModal removido (agora global)
import { ContentProtection } from './ContentProtection';
import { useToast } from '../context/ToastContext';

const Tasks: React.FC = () => {
    const { checklist, toggleDoc, addItem, deleteItem } = useChecklist();
    const [activeGroup, setActiveGroup] = useState<'Visto' | 'Pessoal'>('Visto');
    const [activeCategory, setActiveCategory] = useState<Category | 'Todos'>('Todos');
    const [profile] = useState<UserProfile>(() => {
        return JSON.parse(localStorage.getItem('nomad_profile') || '{}');
    });
    const isPremiumUser = profile?.tier && profile?.tier !== 'free';
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [showLimitModal, setShowLimitModal] = useState(false);

    const categories: (Category | 'Todos')[] = ['Todos', 'Trabalho', 'Pessoal', 'Financeiro', 'Formulários'];

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'Trabalho': return <Briefcase className="w-4 h-4" />;
            case 'Pessoal': return <User className="w-4 h-4" />;
            case 'Financeiro': return <CreditCard className="w-4 h-4" />;
            case 'Formulários': return <FileText className="w-4 h-4" />;
            default: return <Sparkles className="w-4 h-4" />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const handleAddTask = () => {
        const customCount = checklist.filter(i => i.isPersonal).length;
        const isPremium = profile?.tier && profile?.tier !== 'free';

        if (!isPremium && customCount >= 10) {
            setShowLimitModal(true);
            return;
        }

        setIsAdding(true);
    };

    const submitTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle) return;

        addItem({
            title: newTaskTitle,
            description: newTaskDesc || 'Meta personalizada',
            category: 'Pessoal',
            isPersonal: true
        });

        setNewTaskTitle('');
        setNewTaskDesc('');
        setIsAdding(false);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-32"
        >
            <motion.header variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow">
                            <ListTodo className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Tarefas</h1>
                            <p className="text-white/60 font-medium italic">Seu checklist de imigração.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {(!profile?.tier || profile?.tier === 'free') && (
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                                    Minhas Metas
                                </span>
                                <span className={`text-xs font-bold ${checklist.filter(i => i.isPersonal).length >= 10 ? 'text-red-400' : 'text-brand-yellow'}`}>
                                    {checklist.filter(i => i.isPersonal).length}/10
                                </span>
                            </div>
                        )}
                        <button
                            onClick={handleAddTask}
                            className="p-3 bg-brand-blue rounded-xl text-white shadow-lg hover:bg-brand-blue/80 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline font-bold text-sm">Nova Meta</span>
                        </button>
                    </div>
                </div>
            </motion.header>

            <motion.div variants={itemVariants} className="flex flex-col gap-6">
                {/* Group Selector */}
                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
                    <button
                        onClick={() => { setActiveGroup('Visto'); setActiveCategory('Todos'); }}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all z-10 ${activeGroup === 'Visto' ? 'text-navy-950' : 'text-white/40'}`}
                    >
                        Checklist do Visto
                    </button>
                    <button
                        onClick={() => { setActiveGroup('Pessoal'); setActiveCategory('Todos'); }}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all z-10 ${activeGroup === 'Pessoal' ? 'text-navy-950' : 'text-white/40'}`}
                    >
                        Minhas Metas
                    </button>
                    <motion.div
                        initial={false}
                        animate={{ x: activeGroup === 'Visto' ? '0%' : '100%' }}
                        className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] top-1 left-1 bg-brand-yellow rounded-xl shadow-lg"
                    />
                </div>

                {/* Sub-category Filter (Only for Visto) */}
                {activeGroup === 'Visto' && (
                    <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar w-full">
                        {['Todos', 'Trabalho', 'Financeiro', 'Formulários'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat as any)}
                                className={`p-3 rounded-2xl transition-all duration-300 border flex items-center gap-3 flex-shrink-0 ${activeCategory === cat ? 'bg-brand-blue border-brand-blue text-white shadow-lg px-6' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 px-4'}`}
                            >
                                {getCategoryIcon(cat)}
                                {activeCategory === cat && <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>}
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Add Task Modal / Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={submitTask} className="glass-card rounded-[2rem] p-6 border-brand-yellow/30 bg-brand-yellow/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Nova Meta Pessoal</h3>
                                <button type="button" onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <input
                                    autoFocus
                                    placeholder="Título da meta (ex: Comprar malas)"
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-yellow"
                                />
                                <input
                                    placeholder="Descrição (opcional)"
                                    value={newTaskDesc}
                                    onChange={e => setNewTaskDesc(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-brand-yellow"
                                />
                                <button type="submit" className="w-full bg-brand-yellow text-brand-dark font-black uppercase tracking-widest py-3 rounded-xl hover:bg-white transition-all">
                                    Adicionar
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className={`grid gap-4 ${activeGroup === 'Visto' && !isPremiumUser ? 'opacity-50 pointer-events-none' : ''}`}>
                <AnimatePresence mode="popLayout">
                    {checklist
                        .filter(item => {
                            if (activeGroup === 'Pessoal') return item.isPersonal;
                            if (activeGroup === 'Visto') {
                                if (item.isPersonal) return false;
                                return activeCategory === 'Todos' || item.category === activeCategory;
                            }
                            return false;
                        })
                        .map(item => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <ChecklistItemCard
                                    item={item}
                                    onToggle={toggleDoc}
                                    onDelete={deleteItem}
                                    isLocked={!isPremiumUser && !item.isPersonal}
                                    onLockClick={() => document.dispatchEvent(new CustomEvent('open-premium-modal'))}
                                />
                            </motion.div>
                        ))}
                </AnimatePresence>
            </motion.div>

            {/* Premium Overlay for locked Visto checklist */}
            {activeGroup === 'Visto' && !isPremiumUser && (
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-[-100px] relative z-20">
                    <ContentProtection isPremium={false} />
                </motion.div>
            )}

            {/* Premium Modal removido (agora global no App.tsx) */}

            {/* Limit Reached Modal */}
            <AnimatePresence>
                {showLimitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-navy-900 border border-white/10 rounded-[2rem] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-brand-yellow/20 rounded-full flex items-center justify-center mx-auto">
                                <Lock className="w-8 h-8 text-brand-yellow" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white">Limite Atingido</h3>
                                <p className="text-white/60">Membros gratuitos podem adicionar até 10 metas pessoais.</p>
                            </div>
                            <div className="space-y-3">
                                <button onClick={() => setShowLimitModal(false)} className="w-full py-3 bg-brand-yellow text-brand-dark rounded-xl font-black uppercase tracking-widest hover:bg-white transition-all">
                                    Entendi
                                </button>
                                <div className="flex items-center justify-center gap-2 text-brand-yellow/60 text-xs font-bold uppercase tracking-widest">
                                    <Crown className="w-3 h-3" />
                                    Hub Elite Ilimitado
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Tasks;

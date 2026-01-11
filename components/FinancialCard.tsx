import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Edit2, X, Save, TrendingUp, Sparkles } from 'lucide-react';
import { UserGoal } from '../types';
import CircularProgress from './CircularProgress';

interface FinancialCardProps {
    goal: UserGoal;
    onSave: (newGoal: UserGoal) => void;
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
    percentage: number;
    variants?: any;
}

export const FinancialCard: React.FC<FinancialCardProps> = ({
    goal,
    onSave,
    isEditing,
    setIsEditing,
    percentage,
    variants
}) => {
    const [editedGoal, setEditedGoal] = useState<UserGoal>(goal);
    const [eurRate, setEurRate] = useState<number>(0);

    React.useEffect(() => {
        if (!isEditing) {
            setEditedGoal(goal);
        }
    }, [goal, isEditing]);

    // Fetch exchange rate for dual display
    React.useEffect(() => {
        const fetchRate = async () => {
            try {
                const response = await fetch('https://economia.awesomeapi.com.br/last/EUR-BRL');
                const data = await response.json();
                if (data.EURBRL) {
                    setEurRate(parseFloat(data.EURBRL.bid));
                }
            } catch (error) {
                console.error('Erro ao buscar cotação para o card:', error);
            }
        };
        fetchRate();
        const interval = setInterval(fetchRate, 5 * 60 * 1000); // 5 min
        return () => clearInterval(interval);
    }, []);

    const convertValue = (val: number, from: string) => {
        if (!eurRate) return '...';
        if (from === '€') {
            return `R$ ${(val * eurRate).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return `€ ${(val / eurRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleSave = () => {
        onSave(editedGoal);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedGoal(goal);
        setIsEditing(false);
    };

    return (
        <>
            {/* Renda Mensal Card */}
            <motion.div
                variants={variants}
                whileHover={{ scale: 1.01, translateY: -2 }}
                className="glass-card rounded-[2.5rem] p-6 flex flex-col justify-between h-full group relative overflow-hidden"
            >
                {/* Modern Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-yellow/10 transition-colors" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl flex items-center justify-center text-brand-yellow group-hover:scale-110 transition-transform">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">Status Financeiro</h3>
                                <p className="text-xs font-bold text-white mt-1">Renda Mensal Alvo</p>
                            </div>
                        </div>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="p-2 text-white/20 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/5">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={handleCancel} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-red-500/20"><X className="w-4 h-4" /></button>
                                <button onClick={handleSave} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-all border border-green-500/20"><Save className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        {!isEditing ? (
                            <>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-black text-brand-yellow">{goal.currency}</span>
                                    <p className="text-4xl font-black text-white tracking-tighter leading-none">
                                        {goal.monthlyRequiredIncome?.toLocaleString() || '0'}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1 mt-2">
                                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-brand-yellow/50" />
                                        Equiv. {convertValue(goal.monthlyRequiredIncome || 0, goal.currency || '€')}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2 py-2">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Valor Mensal ({goal.currency})</label>
                                <input
                                    type="number"
                                    value={editedGoal.monthlyRequiredIncome}
                                    onChange={(e) => setEditedGoal({ ...editedGoal, monthlyRequiredIncome: Number(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-black text-white focus:outline-none focus:border-brand-yellow/50 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Reserva Financeira Card */}
            <motion.div
                variants={variants}
                whileHover={{ scale: 1.01, translateY: -2 }}
                className="glass-card rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-8 h-full group relative overflow-hidden"
            >
                {/* Modern Mesh Gradient Background */}
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-yellow/5 blur-[80px] rounded-full -ml-24 -mb-24 pointer-events-none" />

                <div className="flex-1 space-y-6 w-full relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl flex items-center justify-center text-brand-yellow">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Progresso de Reserva</span>
                    </div>

                    <div className="space-y-1">
                        {!isEditing ? (
                            <>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-black text-brand-yellow">{goal.currency}</span>
                                    <div className="text-4xl font-black text-white tracking-tighter leading-none truncate">
                                        {goal.currentAmount?.toLocaleString() || '0'}
                                    </div>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Total Salvo</span>
                                </div>
                                <div className="mt-2 text-[11px] font-bold text-brand-yellow/60 uppercase tracking-wider bg-brand-yellow/5 border border-brand-yellow/10 px-3 py-1 rounded-full inline-block">
                                    ≈ {convertValue(goal.currentAmount || 0, goal.currency || '€')}
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <div className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] font-black text-white/60 tracking-widest uppercase">
                                        Alvo: {goal.currency}{goal.targetAmount?.toLocaleString() || '0'}
                                    </div>
                                    <div className="flex-1 h-[1px] bg-white/5" />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4 py-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">Já Guardado</label>
                                        <input
                                            type="number"
                                            value={editedGoal.currentAmount}
                                            onChange={(e) => setEditedGoal({ ...editedGoal, currentAmount: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-bold focus:outline-none focus:border-brand-yellow/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">Meta Final</label>
                                        <input
                                            type="number"
                                            value={editedGoal.targetAmount}
                                            onChange={(e) => setEditedGoal({ ...editedGoal, targetAmount: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-bold focus:outline-none focus:border-brand-yellow/50 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative z-10 p-2 bg-black/20 rounded-full border border-white/5 shadow-2xl">
                    <CircularProgress percentage={percentage} label="Concluído" size={150} strokeWidth={12} />
                </div>
            </motion.div>
        </>
    );
};

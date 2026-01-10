
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Edit2, X, Save, TrendingUp } from 'lucide-react';
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

    // Updates local state when prop changes, if not currently editing
    React.useEffect(() => {
        if (!isEditing) {
            setEditedGoal(goal);
        }
    }, [goal, isEditing]);

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
            <motion.div variants={variants} className="glass-card rounded-[2.5rem] p-8 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-yellow/20 rounded-2xl text-brand-yellow"><Wallet className="w-5 h-5" /></div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Renda Mensal Alvo</h3>
                        </div>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="text-white/40 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                        ) : (
                            <div className="flex gap-3">
                                <button onClick={handleCancel} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                                <button onClick={handleSave} className="text-green-400 hover:text-green-300"><Save className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        {!isEditing ? (
                            <>
                                <p className="text-3xl font-black text-white">{goal.currency} {goal.monthlyRequiredIncome?.toLocaleString() || '0'}</p>
                                <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Meta personalizada de faturamento</p>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/60 uppercase">Mensal Necessário ({goal.currency})</label>
                                <input
                                    type="number"
                                    value={editedGoal.monthlyRequiredIncome}
                                    onChange={(e) => setEditedGoal({ ...editedGoal, monthlyRequiredIncome: Number(e.target.value) })}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-bold focus:outline-none focus:border-brand-yellow"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <motion.div variants={variants} className="glass-card rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center gap-2 text-white"><TrendingUp className="w-5 h-5 text-brand-yellow" /><span className="text-sm font-bold uppercase tracking-wider">Reserva Financeira</span></div>

                    <div className="space-y-1">
                        {!isEditing ? (
                            <>
                                <div className="text-4xl font-black text-white flex items-baseline gap-2">{goal.currency}{goal.currentAmount?.toLocaleString() || '0'}<span className="text-sm font-bold text-white/40 uppercase tracking-tighter">Salvo</span></div>
                                <p className="text-white/60 text-sm">Meta de {goal.currency}{goal.targetAmount?.toLocaleString() || '0'}.</p>
                            </>
                        ) : (
                            <div className="space-y-3 mt-2">
                                <div>
                                    <label className="text-[9px] font-black text-white/60 uppercase block mb-1">Valor Guardado ({goal.currency})</label>
                                    <input
                                        type="number"
                                        value={editedGoal.currentAmount}
                                        onChange={(e) => setEditedGoal({ ...editedGoal, currentAmount: Number(e.target.value) })}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-bold focus:outline-none focus:border-brand-yellow"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-white/60 uppercase block mb-1">Meta Total ({goal.currency})</label>
                                    <input
                                        type="number"
                                        value={editedGoal.targetAmount}
                                        onChange={(e) => setEditedGoal({ ...editedGoal, targetAmount: Number(e.target.value) })}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-bold focus:outline-none focus:border-brand-yellow"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <CircularProgress percentage={percentage} label="Reserva" size={140} strokeWidth={10} />
            </motion.div>
        </>
    );
};

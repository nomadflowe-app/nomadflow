
import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Check,
    Building2,
    Languages,
    Trash2,
    Lock
} from 'lucide-react';
import { ChecklistItem } from '../types';

interface ChecklistItemCardProps {
    item: ChecklistItem;
    onToggle: (id: string, field: 'isCompleted' | 'isTranslated' | 'isApostilled') => void;
    onDelete?: (id: string) => void;
    isLocked?: boolean;
    onLockClick?: () => void;
}

export const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({ item, onToggle, onDelete, isLocked, onLockClick }) => {
    const isFinalized = (i: ChecklistItem) => {
        const t = i.needsTranslation ? i.isTranslated : true;
        const a = i.needsApostille ? i.isApostilled : true;
        return t && a && i.isCompleted;
    };

    const finalized = isFinalized(item);

    return (
        <motion.div
            key={item.id}
            layout
            onClick={() => isLocked && onLockClick?.()}
            className={`glass-card rounded-[2rem] p-6 transition-all group overflow-hidden relative ${finalized ? 'bg-brand-blue/30 border-brand-yellow' : 'border-white/10'} ${isLocked ? 'cursor-pointer active:scale-95' : ''}`}
        >
            {/* Lock Overlay */}
            {isLocked && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-navy-950/20 backdrop-blur-[4px]">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/20 shadow-2xl">
                        <Lock className="w-6 h-6 text-brand-yellow animate-pulse" />
                    </div>
                </div>
            )}

            <div className={`flex items-start justify-between gap-4 transition-all duration-500 ${isLocked ? 'blur-sm grayscale opacity-30 select-none' : ''}`}>
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark bg-brand-yellow px-2 py-1 rounded-lg">{item.category}</span>
                        {item.isPersonal && onDelete && !isLocked && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.id);
                                }}
                                className="text-white/20 hover:text-red-400 transition-colors p-1"
                                title="Excluir tarefa"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{item.title}</h3>
                        <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="mt-4 space-y-3 p-4 bg-white/5 rounded-2xl">
                        <TaskRow completed={item.isCompleted} label="Tenho o documento original" onClick={() => onToggle(item.id, 'isCompleted')} isLocked={isLocked} />
                        {item.needsApostille && <TaskRow completed={item.isApostilled} label="Apostilamento de Haia realizado" onClick={() => onToggle(item.id, 'isApostilled')} icon={<Building2 className="w-3 h-3" />} isLocked={isLocked} />}
                        {item.needsTranslation && <TaskRow completed={item.isTranslated} label="Tradução Juramentada realizada" onClick={() => onToggle(item.id, 'isTranslated')} icon={<Languages className="w-3 h-3" />} isLocked={isLocked} />}
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${finalized ? 'bg-brand-yellow text-brand-dark' : 'bg-white/10 text-white/20'}`}>
                    <CheckCircle2 className={`w-6 h-6 ${finalized ? 'scale-110' : 'opacity-40'}`} />
                </div>
            </div>
        </motion.div>
    );
};

const TaskRow = ({ completed, label, onClick, icon, isLocked }: any) => (
    <button
        onClick={(e) => {
            if (isLocked) return;
            e.stopPropagation();
            onClick();
        }}
        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left ${isLocked ? 'cursor-default' : 'hover:bg-white/5'}`}
    >
        <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${completed ? 'bg-brand-yellow border-brand-yellow' : 'border-white/20'}`}>{completed && <Check className="w-3.5 h-3.5 text-brand-dark" />}</div>
        <div className="flex items-center gap-2">{icon && <span className={completed ? 'text-white/40' : 'text-brand-yellow'}>{icon}</span>}<span className={`text-xs font-medium ${completed ? 'text-white/40 line-through' : 'text-white/90'}`}>{label}</span></div>
    </button>
);

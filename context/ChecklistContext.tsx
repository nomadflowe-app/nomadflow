
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ChecklistItem } from '../types';
import { INITIAL_CHECKLIST } from '../constants';
import { syncChecklist } from '../lib/supabase';
import { useToast } from './ToastContext';

interface ChecklistContextType {
    checklist: ChecklistItem[];
    toggleDoc: (id: string, field: 'isCompleted' | 'isTranslated' | 'isApostilled') => void;
    addItem: (item: Omit<ChecklistItem, 'id' | 'isCompleted' | 'isTranslated' | 'isApostilled' | 'needsTranslation' | 'needsApostille'>) => void;
    deleteItem: (id: string) => void;
    overallProgress: number;
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

export const ChecklistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
        const saved = localStorage.getItem('nomad_checklist');
        return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
    });

    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Load user profile to get email for sync
    useEffect(() => {
        const savedProfile = localStorage.getItem('nomad_profile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            if (profile.email) setUserEmail(profile.email);
        }
    }, []);

    // Sync with localStorage and Supabase
    useEffect(() => {
        localStorage.setItem('nomad_checklist', JSON.stringify(checklist));
        if (userEmail) {
            syncChecklist(userEmail, checklist);
        }
    }, [checklist, userEmail]);

    const addItem = (newItem: Omit<ChecklistItem, 'id' | 'isCompleted' | 'isTranslated' | 'isApostilled' | 'needsTranslation' | 'needsApostille'>) => {
        const item: ChecklistItem = {
            id: crypto.randomUUID(),
            ...newItem,
            isCompleted: false,
            isTranslated: false,
            isApostilled: false,
            needsTranslation: false, // Default for custom tasks
            needsApostille: false,   // Default for custom tasks
            isPersonal: true
        };
        setChecklist(prev => [...prev, item]);
        showToast('Nova tarefa adicionada!', 'success');
    };

    const deleteItem = (id: string) => {
        setChecklist(prev => prev.filter(item => item.id !== id));
        showToast('Tarefa removida.', 'error'); // Using error style for deletion, or maybe neutral
    };

    const toggleDoc = (id: string, field: 'isCompleted' | 'isTranslated' | 'isApostilled') => {
        setChecklist(prev => prev.map(i => {
            if (i.id === id) {
                // Show celebration toast if marking as completed
                if (field === 'isCompleted' && !i.isCompleted) {
                    showToast(`Documento "${i.title}" concluído!`, 'success');
                }
                return { ...i, [field]: !i[field] };
            }
            return i;
        }));
    };

    const overallProgress = useMemo(() => {
        const totalPoints = checklist.length;
        if (totalPoints === 0) return 0;
        const completed = checklist.filter(item => {
            const t = item.needsTranslation ? item.isTranslated : true;
            const a = item.needsApostille ? item.isApostilled : true;
            return t && a && item.isCompleted;
        }).length;
        return (completed / totalPoints) * 100;
    }, [checklist]);

    return (
        <ChecklistContext.Provider value={{ checklist, toggleDoc, addItem, deleteItem, overallProgress }}>
            {children}
        </ChecklistContext.Provider>
    );
};

export const useChecklist = () => {
    const context = useContext(ChecklistContext);
    if (context === undefined) {
        throw new Error('useChecklist must be used within a ChecklistProvider');
    }
    return context;
};

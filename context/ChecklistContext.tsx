
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ChecklistItem } from '../types';
import { INITIAL_CHECKLIST } from '../constants';
import { syncChecklist, getChecklist } from '../lib/supabase'; // Updated import
import { useToast } from './ToastContext';

interface ChecklistContextType {
    checklist: ChecklistItem[];
    toggleDoc: (id: string, field: 'isCompleted' | 'isTranslated' | 'isApostilled') => void;
    addItem: (item: Omit<ChecklistItem, 'id' | 'isCompleted' | 'isTranslated' | 'isApostilled' | 'needsTranslation' | 'needsApostille'>) => void;
    deleteItem: (id: string) => void;
    overallProgress: number;
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

export const ChecklistProvider: React.FC<{ children: ReactNode; userEmail?: string }> = ({ children, userEmail }) => {
    const { showToast } = useToast();
    const mergeWithInitial = (items: ChecklistItem[]) => {
        return items.map(item => {
            const initial = INITIAL_CHECKLIST.find(i => i.id === item.id);
            if (initial) {
                return {
                    ...item,
                    needsTranslation: initial.needsTranslation,
                    needsApostille: initial.needsApostille,
                    title: initial.title, // Keep titles updated too
                    category: initial.category
                };
            }
            return item;
        });
    };

    const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
        const saved = localStorage.getItem('nomad_checklist');
        if (saved) {
            const parsed = JSON.parse(saved);
            return mergeWithInitial(parsed);
        }
        return INITIAL_CHECKLIST;
    });

    const [isLoaded, setIsLoaded] = useState(false);

    // Sync DOWN from Supabase when user changes
    useEffect(() => {
        console.log('[ChecklistContext] User changed:', userEmail);
        setIsLoaded(false);

        if (userEmail) {
            getChecklist(userEmail).then(items => {
                if (items && items.length > 0) {
                    const merged = mergeWithInitial(items);
                    setChecklist(merged);
                    localStorage.setItem('nomad_checklist', JSON.stringify(merged));
                } else {
                    setChecklist(JSON.parse(JSON.stringify(INITIAL_CHECKLIST)));
                }
                setIsLoaded(true);
            });
        } else {
            setChecklist(JSON.parse(JSON.stringify(INITIAL_CHECKLIST)));
            localStorage.removeItem('nomad_checklist');
            setIsLoaded(false);
        }
    }, [userEmail]);

    // Sync UP to Supabase on change
    useEffect(() => {
        if (isLoaded && userEmail) {
            localStorage.setItem('nomad_checklist', JSON.stringify(checklist));
            syncChecklist(userEmail, checklist);
        }
    }, [checklist, userEmail, isLoaded]);


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

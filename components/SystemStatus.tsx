import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Server, Shield, CreditCard, Activity, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

// Reusing the key via environment variables
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

interface StatusItem {
    id: string;
    label: string;
    status: 'loading' | 'success' | 'error';
    message?: string;
}

interface SystemStatusProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ isOpen, onClose }) => {
    const [checks, setChecks] = useState<StatusItem[]>([
        { id: 'db', label: 'Banco de Dados (Supabase)', status: 'loading' },
        { id: 'auth', label: 'Autenticação (Auth)', status: 'loading' },
        { id: 'stripe', label: 'Pagamentos (Stripe)', status: 'loading' },
    ]);

    useEffect(() => {
        if (isOpen) {
            runChecks();
        }
    }, [isOpen]);

    const updateCheck = (id: string, status: 'success' | 'error', message?: string) => {
        setChecks(prev => prev.map(item => item.id === id ? { ...item, status, message } : item));
    };

    const runChecks = async () => {
        // Reset
        setChecks(prev => prev.map(c => ({ ...c, status: 'loading', message: undefined })));

        // 1. Check Database
        try {
            const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
            if (error) throw error;
            updateCheck('db', 'success', 'Conectado e respondendo.');
        } catch (error: any) {
            updateCheck('db', 'error', error.message || 'Falha na conexão.');
        }

        // 2. Check Auth
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            updateCheck('auth', 'success', data.session ? 'Sessão ativa.' : 'Serviço operacional (Sem sessão).');
        } catch (error: any) {
            updateCheck('auth', 'error', error.message);
        }

        // 3. Check Stripe
        try {
            const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
            if (!stripe) throw new Error('Falha ao inicializar SDK.');
            updateCheck('stripe', 'success', 'SDK Inicializado corretamente.');
        } catch (error: any) {
            updateCheck('stripe', 'error', error.message);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1001] bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#0a0f1d] border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl space-y-6"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Activity className="w-6 h-6 text-brand-yellow" />
                                <h2 className="text-xl font-black text-white uppercase tracking-wider">Status do Sistema</h2>
                            </div>
                            <button onClick={onClose} className="p-2 bg-white/5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {checks.map(check => (
                                <div key={check.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${check.status === 'success' ? 'bg-green-500/10 text-green-500' :
                                            check.status === 'error' ? 'bg-red-500/10 text-red-500' :
                                                'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {check.id === 'db' && <Server className="w-5 h-5" />}
                                            {check.id === 'auth' && <Shield className="w-5 h-5" />}
                                            {check.id === 'stripe' && <CreditCard className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-sm">{check.label}</h3>
                                            <p className={`text-xs font-medium ${check.status === 'success' ? 'text-green-500' :
                                                check.status === 'error' ? 'text-red-500' :
                                                    'text-white/40'
                                                }`}>
                                                {check.message || 'Verificando...'}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        {check.status === 'loading' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                                        {check.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                        {check.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={runChecks}
                            className="w-full py-4 bg-white/5 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 transition-all"
                        >
                            Executar Novamente
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

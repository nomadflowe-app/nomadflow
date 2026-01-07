import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Crown
} from 'lucide-react';
import { UserGoal, UserProfile } from '../types';
import { ContentProtection } from './ContentProtection';
import { syncGoal, syncProfile } from '../lib/supabase';
import PremiumModal from './PremiumModal';
import { FinancialCard } from './FinancialCard';
import { useToast } from '../context/ToastContext';
import { useChecklist } from '../context/ChecklistContext';
import CircularProgress from './CircularProgress';
import CurrencyConverter from './CurrencyConverter';
import { redirectToCheckout } from '../lib/stripe';

const Dashboard: React.FC = () => {
  const { showToast } = useToast();
  const { overallProgress } = useChecklist();

  const [profile] = useState<UserProfile>(() => {
    return JSON.parse(localStorage.getItem('nomad_profile') || '{}');
  });

  const [goal, setGoal] = useState<UserGoal>(() => {
    const saved = localStorage.getItem('nomad_goal');
    return saved ? JSON.parse(saved) : {
      targetCountry: 'Espanha',
      targetAmount: 0,
      currentAmount: 0,
      currency: '€',
      monthlyRequiredIncome: 0
    };
  });

  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(() => {
    return profile?.tier && profile?.tier !== 'free';
  });

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Sincronização Goal
  useEffect(() => {
    localStorage.setItem('nomad_goal', JSON.stringify(goal));
  }, [goal]);

  const handleSaveGoal = async (newGoal: UserGoal) => {
    setGoal(newGoal);
    setIsEditingGoal(false);
    if (profile?.email) {
      await syncGoal(profile.email, newGoal);
    }
    showToast('Meta financeira atualizada com sucesso!', 'success');
  };

  const handleUpgrade = async (priceId: string) => {
    if (!profile.id || !profile.email) {
      showToast('Erro: Usuário não identificado para pagamento.', 'error');
      return;
    }

    try {
      showToast('Redirecionando para o pagamento seguro...', 'success');
      await redirectToCheckout(profile.id, profile.email, priceId);
    } catch (err: any) {
      const message = err.message || 'Falha ao iniciar checkout. Tente novamente.';
      showToast(message, 'error');
    }
  };

  const financialPercentage = useMemo(() => {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  }, [goal]);

  return (
    <div className="space-y-8 pb-32">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Hola, <span className="text-brand-yellow">{profile.fullName?.split(' ')[0]}</span>.</h1>
          <p className="text-white/60 font-medium italic">Sua expedição rumo à Espanha.</p>
        </div>
        {!isPremiumUser && (
          <button
            onClick={() => setShowPremiumModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-brand-yellow rounded-2xl text-white hover:scale-105 transition-all shadow-lg"
          >
            <Crown className="w-4 h-4 text-brand-yellow" />
            <span className="text-[10px] font-black uppercase tracking-widest">Upgrade Elite</span>
          </button>
        )}
      </motion.header>

      <AnimatePresence>
        {showPremiumModal && (
          <PremiumModal
            isOpen={showPremiumModal}
            onClose={() => setShowPremiumModal(false)}
            onUpgrade={handleUpgrade}
          />
        )}
      </AnimatePresence>

      <CurrencyConverter />

      <div className="grid lg:grid-cols-2 gap-6">
        <FinancialCard
          goal={goal}
          onSave={handleSaveGoal}
          isEditing={isEditingGoal}
          setIsEditing={setIsEditingGoal}
          percentage={financialPercentage}
        />

        <section className="space-y-6">
          {!isPremiumUser ? (
            <ContentProtection isPremium={false} />
          ) : (
            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-black text-white tracking-tight">Expedição Espanha</h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-brand-yellow">{Math.round(overallProgress)}%</span>
                    <span className="text-2xl font-black text-white/40 uppercase tracking-widest">Concluído</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden relative">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} className="h-full bg-brand-yellow relative">
                    <div className="absolute inset-0 progress-shimmer-effect opacity-60" />
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 rounded-[2rem] border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[200px]">
            <h3 className="text-white font-bold">Próximos Passos?</h3>
            <p className="text-white/60 text-sm max-w-xs">Acesse a aba <span className="text-brand-yellow font-bold">Tarefas</span> para gerenciar seu checklist detalhado.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

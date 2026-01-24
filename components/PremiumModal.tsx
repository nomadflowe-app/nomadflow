import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Crown, Star, Flame, Zap, ShieldCheck } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (priceId: string) => void;
}

const PLANS = [
  {
    id: 'mensal',
    name: 'Elite Mensal',
    price: 'R$ 79',
    period: '/mês',
    description: 'Ideal para quem busca rapidez e flexibilidade.',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-blue-400 to-blue-600',
    priceId: 'price_1SniJeD1nKpsWc8ow9unN1Cb',
    features: ['Checklist do Visto', 'Guias & Tutoriais', 'Comunidade VIP', 'Templates Editáveis']
  },
  {
    id: 'anual',
    name: 'Elite Anual',
    price: 'R$ 549',
    period: '/ano',
    description: 'O melhor custo-benefício para sua jornada.',
    icon: <Flame className="w-5 h-5" />,
    color: 'from-gold-400 to-gold-600',
    priceId: 'price_1SniKQD1nKpsWc8or2Zn3epn',
    popular: true,
    features: ['Tudo do Mensal', 'Templates Editáveis', 'Suporte Prioritário', 'Economia de 50%']
  }
];

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState('anual');

  if (!isOpen) return null;

  const currentPlan = PLANS.find(p => p.id === selectedPlan)!;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start md:items-center justify-center p-4 overflow-y-auto bg-navy-950/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-navy-950/60"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl bg-navy-900 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-8 md:right-8 p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all z-20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left Side: Plans View */}
        <div className="flex-1 p-6 md:p-12 space-y-6 md:space-y-8 bg-white/[0.02]">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2 md:gap-3">
              Escolha seu plano <ShieldCheck className="w-6 h-6 text-brand-yellow" />
            </h2>
            <p className="text-sm md:text-base text-blue-200/60 font-medium">Selecione a melhor opção para sua expedição.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-5 md:p-6 rounded-2xl md:rounded-3xl border transition-all duration-300 text-left flex flex-col gap-3 group outline-none ${selectedPlan === plan.id
                  ? 'bg-white/10 border-brand-yellow shadow-lg shadow-brand-yellow/10'
                  : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-yellow text-navy-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg z-10 whitespace-nowrap">
                    Mais Popular
                  </div>
                )}

                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white shadow-lg`}>
                  {plan.icon}
                </div>

                <div>
                  <h3 className="font-black text-white text-base md:text-lg">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-2xl font-black text-white">{plan.price}</span>
                    <span className="text-[10px] md:text-xs text-white/40 font-bold">{plan.period}</span>
                  </div>
                </div>

                {selectedPlan === plan.id && (
                  <motion.div layoutId="activePlan" className="absolute inset-0 border-2 border-brand-yellow rounded-2xl md:rounded-3xl pointer-events-none" />
                )}
              </button>
            ))}
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              {currentPlan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-yellow/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-brand-yellow" />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Action Card */}
        <div className="w-full md:w-80 p-6 md:p-12 md:border-l border-white/10 flex flex-col justify-between bg-brand-yellow/5">
          <div className="space-y-6 text-center md:text-left">
            <div className="space-y-1 md:space-y-2">
              <span className="text-[10px] font-black text-brand-yellow uppercase tracking-[0.2em]">Você selecionou</span>
              <h4 className="text-xl md:text-2xl font-black text-white">{currentPlan.name}</h4>
              <p className="text-xs md:text-sm text-white/50">{currentPlan.description}</p>
            </div>

            <div className="p-5 md:p-6 bg-navy-950/50 rounded-2xl md:rounded-3xl border border-white/5 space-y-1">
              <span className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest">Total a pagar</span>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <h5 className="text-2xl md:text-3xl font-black text-brand-yellow">{currentPlan.price}</h5>
                <span className="text-[10px] md:text-xs text-white/20 font-bold">{currentPlan.period}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-0 space-y-4">
            <button
              onClick={() => onUpgrade(currentPlan.priceId)}
              className="w-full py-4 md:py-5 bg-brand-yellow text-navy-950 rounded-xl md:rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden group"
            >
              <Star className="w-5 h-5 fill-navy-950 group-hover:rotate-45 transition-transform" />
              Assinar Agora
            </button>
            <p className="text-[10px] text-center text-white/20 font-bold uppercase tracking-widest">
              Ambiente 100% Seguro via Stripe
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumModal;

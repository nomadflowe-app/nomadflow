import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, ShieldCheck, Flame } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (priceId: string) => void;
  isForced?: boolean;
  onLogout?: () => void;
}

const PLANS = [
  {
    id: 'anual',
    name: 'Elite Anual',
    price: 'R$ 649,00',
    period: 'à vista',
    installments: '10x de R$ 78,00',
    description: 'O melhor custo-benefício para sua jornada.',
    icon: <Flame className="w-6 h-6" />,
    color: 'from-brand-yellow/20 to-brand-yellow/5',
    priceId: 'price_anual_10x',
    popular: true,
    checkoutUrl: 'https://pay.kiwify.com.br/1CE7oz8',
    features: ['Checklist do Visto', 'Guias & Tutoriais', 'Comunidade VIP', 'Templates Editáveis', 'Suporte Prioritário']
  }
];

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade, isForced = false, onLogout }) => {
  if (!isOpen) return null;

  const currentPlan = PLANS[0];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto bg-navy-950/60 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0"
        onClick={!isForced ? onClose : undefined}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-[#1a365d] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row z-10 my-8 md:my-0"
      >
        {/* Left Side: Plan Info */}
        <div className="flex-1 p-6 md:p-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              Elite Anual <ShieldCheck className="w-8 h-8 text-brand-yellow" />
            </h2>
            <p className="text-base text-blue-200/60 font-medium">Assine agora e tenha acesso imediato a todas as ferramentas.</p>
          </div>

          {/* Single Plan Card */}
          <div className="relative group max-w-sm">
            <div className="absolute -top-3 left-8 bg-brand-yellow text-navy-950 text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-widest shadow-xl z-10 whitespace-nowrap">
              Valor promocional
            </div>

            <div className="p-6 md:p-8 rounded-[2rem] border-2 border-brand-yellow bg-white/5 backdrop-blur-sm shadow-[0_0_40px_rgba(250,204,21,0.15)] space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-yellow">
                {currentPlan.icon}
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">{currentPlan.name}</h3>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-black text-white">{currentPlan.installments}</span>
                  <span className="text-xs text-brand-yellow font-bold uppercase tracking-widest">OU {currentPlan.price} À VISTA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 max-w-xl bg-white/5 p-6 rounded-3xl border border-white/5">
            {currentPlan.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-yellow/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-brand-yellow" />
                </div>
                <span className="text-xs font-bold text-white/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Summary Sidebar */}
        <div className="w-full md:w-[320px] p-6 md:p-10 bg-navy-950/40 backdrop-blur-2xl border-l border-white/10 flex flex-col justify-between relative">

          {/* Header Actions */}
          <div className="absolute top-6 right-6 flex gap-2">
            {!isForced ? (
              <button
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              onLogout && (
                <button
                  onClick={onLogout}
                  className="px-5 py-2 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  Sair
                </button>
              )
            )}
          </div>

          <div className="space-y-8 mt-10 md:mt-16">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-brand-yellow uppercase tracking-[0.2em]">Você selecionou</span>
              <h4 className="text-2xl font-black text-white">{currentPlan.name}</h4>
              <p className="text-xs text-white/40 leading-relaxed">{currentPlan.description}</p>
            </div>

            <div className="p-6 bg-navy-950/80 rounded-[2rem] border border-white/5 space-y-1.5">
              <span className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em]">Investimento</span>
              <div className="flex flex-col">
                <h5 className="text-2xl font-black text-brand-yellow leading-tight">{currentPlan.installments}</h5>
                <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest leading-none">ou {currentPlan.price} {currentPlan.period}</span>
              </div>
            </div>
          </div>

          <div className="space-y-5 mt-10">
            <a
              href={currentPlan.checkoutUrl}
              onClick={() => onUpgrade(currentPlan.priceId)}
              className="w-full py-5 bg-[#82c91e] text-white rounded-2xl font-black text-lg uppercase tracking-[0.1em] shadow-[0_20px_40px_rgba(130,201,30,0.3)] hover:shadow-[0_25px_50px_rgba(130,201,30,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden group"
            >
              <Star className="w-5 h-5 fill-white animate-pulse" />
              Assinar Agora
            </a>
            <p className="text-[9px] text-center text-white/20 font-bold uppercase tracking-[0.2em]">
              Ambiente 100% Seguro via Kiwify
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default PremiumModal;

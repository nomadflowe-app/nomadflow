import React from 'react';
import { Lock, Crown, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentProtectionProps {
  children?: React.ReactNode;
  isPremium: boolean;
  drippingDays?: number;
}

export const ContentProtection: React.FC<ContentProtectionProps> = ({ children, isPremium, drippingDays }) => {
  if (isPremium && !drippingDays) {
    return <>{children}</>;
  }

  const isDripping = isPremium && drippingDays !== undefined && drippingDays > 0;

  return (
    <div
      className="relative overflow-hidden rounded-[2.5rem] bg-navy-950/20 border border-white/5 isolate group min-h-[400px] cursor-pointer"
      onClick={(e) => {
        // Evita disparar se clicar no próprio botão (que já tem seu handler)
        if ((e.target as HTMLElement).tagName !== 'BUTTON') {
          document.dispatchEvent(new CustomEvent('open-premium-modal'));
        }
      }}
    >
      {/* Blurred Content Background */}
      <div className="filter blur-2xl opacity-40 pointer-events-none select-none p-6 flex flex-col h-full" aria-hidden="true">
        {children || (
          <div className="space-y-4 flex-1 py-4">
            <div className="h-10 bg-white/10 rounded-2xl w-full" />
            <div className="h-3 bg-white/10 rounded-full w-[90%]" />
            <div className="h-3 bg-white/10 rounded-full w-[70%]" />
            <div className="h-10 bg-white/10 rounded-2xl w-full" />
            <div className="h-3 bg-white/10 rounded-full w-[80%]" />
          </div>
        )}
      </div>

      {/* Premium Core Card - Centered in Viewport shadow */}
      <div className="absolute inset-0 z-20 flex items-start justify-center p-6 pt-20 md:items-center md:pt-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          className="w-full max-w-[280px] glass-card bg-navy-900/90 backdrop-blur-3xl border-brand-yellow/30 p-8 rounded-[2rem] text-center space-y-6 shadow-2xl relative overflow-hidden"
        >
          {/* Accent decoration */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-yellow/10 blur-3xl rounded-full" />

          <div className="w-16 h-16 bg-brand-yellow/20 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-brand-yellow/10">
            {isDripping ? (
              <Clock className="w-8 h-8 text-brand-yellow" />
            ) : (
              <Lock className="w-8 h-8 text-brand-yellow" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              {isDripping ? 'Quase Lá!' : 'Área de Membros'}
            </h3>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              {isDripping
                ? `Este conteúdo estratégico será liberado para você em ${drippingDays} ${drippingDays === 1 ? 'dia' : 'dias'}.`
                : <>Este conteúdo é exclusivo para assinantes da <span className="text-brand-yellow">Expedição Elite</span>.</>
              }
            </p>
          </div>

          <div className="space-y-3 relative z-10 pt-2">
            {!isDripping ? (
              <button
                onClick={() => document.dispatchEvent(new CustomEvent('open-premium-modal'))}
                className="w-full py-3 bg-brand-yellow text-navy-950 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-[0_0_30px_rgba(250,204,21,0.2)] active:scale-95"
              >
                Desbloquear Agora
              </button>
            ) : (
              <div className="w-full py-3 bg-white/5 border border-white/10 text-white/40 rounded-xl font-black uppercase tracking-widest text-[10px]">
                Aguardando Liberação
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-brand-yellow/40 text-[8px] font-black uppercase tracking-widest">
              <Crown className="w-3 h-3" />
              Upgrade Instantâneo
            </div>
          </div>
        </motion.div>
      </div>

      {/* Overlay gradient to fade out content */}
      <div className="absolute inset-0 bg-navy-950/40 z-10" />
    </div>
  );
};

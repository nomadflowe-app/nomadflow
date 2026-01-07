import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentProtectionProps {
  children: React.ReactNode;
  isPremium: boolean;
}

export const ContentProtection: React.FC<ContentProtectionProps> = ({ children, isPremium }) => {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-navy-950/50 min-h-[400px] flex items-center justify-center border border-white/5">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/50 to-transparent" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 glass-card p-10 text-center max-w-sm mx-4 space-y-6 border-brand-yellow/20 shadow-2xl"
      >
        <div className="w-20 h-20 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto border border-brand-yellow/20 shadow-[0_0_30px_rgba(250,204,21,0.1)]">
          <Lock className="w-10 h-10 text-brand-yellow" />
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-black text-white tracking-tight">
            Conteúdo Exclusivo <span className="text-brand-yellow">Elite</span>
          </h3>
          <p className="text-white/60 font-medium leading-relaxed">
            Este material faz parte do acervo avançado do NomadFlow.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3 text-sm font-bold text-white/80">
              <Crown className="w-4 h-4 text-brand-yellow" />
              <span>Guias Completos</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-white/80 mt-2">
              <Crown className="w-4 h-4 text-brand-yellow" />
              <span>Tutoriais em Vídeo</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-white/80 mt-2">
              <Crown className="w-4 h-4 text-brand-yellow" />
              <span>Comunidade VIP</span>
            </div>
          </div>

          <p className="text-xs text-center text-white/40 font-medium px-4">
            Acesse o Painel Principal para realizar o upgrade.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

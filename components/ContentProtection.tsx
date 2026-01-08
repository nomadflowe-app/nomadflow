import React from 'react';
import { Lock } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-[2.5rem] bg-navy-950/20 border border-white/5 isolate group h-full">
      {/* Heavily Blurred Content Background */}
      <div className="filter blur-2xl opacity-20 pointer-events-none select-none p-6 min-h-[400px] flex flex-col" aria-hidden="true">
        {children}
        {/* Fillers to ensure volume underneath */}
        <div className="flex-1 space-y-4 mt-6">
          <div className="h-4 bg-white/20 rounded w-3/4" />
          <div className="h-4 bg-white/20 rounded w-1/2" />
          <div className="h-32 bg-white/10 rounded-xl" />
        </div>
      </div>

      {/* Centered Lock Icon */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('open-premium-modal'))}
          className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.4)] hover:scale-110 transition-transform cursor-pointer"
        >
          <Lock className="w-8 h-8 text-navy-950" />
        </button>
      </div>

      {/* Overlay gradient to fade out content */}
      <div className="absolute inset-0 bg-navy-950/60 z-10" />
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  User,
  Briefcase,
  ChevronRight,
  Calculator,
  Target,
  Wallet,
  Globe,
  Star,
  Minus,
  Plus
} from 'lucide-react';
import { UserProfile, UserGoal } from '../types';
import { syncProfile, syncGoal } from '../lib/supabase';

interface OnboardingProps {
  onComplete: (profile: UserProfile, goal: UserGoal) => void;
  initialEmail?: string;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialEmail }) => {
  const [step, setStep] = useState(1);
  const [customGoal, setCustomGoal] = useState({
    targetAmount: 0,
    currentAmount: 0,
    monthlyRequired: 0
  });

  const [data, setData] = useState<Partial<UserProfile>>({
    fullName: '',
    familyContext: 'solo',
    childrenCount: 0,
    workType: 'employee',
    yearsOfExperience: 3,
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  useEffect(() => {
    if (step === 4) {
      const baseSMI = 1210;
      let monthlyIncome = baseSMI * 2.5;

      if (data.familyContext === 'couple') {
        monthlyIncome += baseSMI * 0.75;
      } else if (data.familyContext === 'family') {
        monthlyIncome += baseSMI * 0.75;
        monthlyIncome += (data.childrenCount || 0) * (baseSMI * 0.25);
      }

      setCustomGoal({
        monthlyRequired: Math.round(monthlyIncome),
        targetAmount: Math.round(monthlyIncome * 12),
        currentAmount: 0
      });
    }
  }, [step, data]);

  const handleFinish = async () => {
    // Usa o email autenticado se disponível, senão gera um (fallback)
    const emailToUse = initialEmail || `${data.fullName?.toLowerCase().replace(/\s/g, '.')}@user.com`;

    const profile: UserProfile = {
      ...data as UserProfile,
      email: emailToUse,
      phone: '', city: '', state: '', country: 'Brasil',
      isOnboarded: true,
      tier: 'free'
    };

    const goal: UserGoal = {
      targetCountry: 'Espanha',
      targetAmount: customGoal.targetAmount,
      currentAmount: customGoal.currentAmount,
      currency: '€',
      monthlyRequiredIncome: customGoal.monthlyRequired
    };

    // Sincronização com Supabase
    // Isso cria a entrada na tabela 'profiles' primeiro, evitando erro de FK em 'checklists' depois
    await syncProfile(profile);
    await syncGoal(profile.email, goal);

    onComplete(profile, goal);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-brand-dark flex flex-col items-center justify-center p-6 overflow-y-auto no-scrollbar">
      <div className="max-w-md w-full space-y-8 py-12">
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-brand-yellow' : 'w-2 bg-white/20'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-white leading-tight tracking-tighter">Vamos mapear sua expedição.</h2>
                <p className="text-white/60 font-medium">Como devemos te chamar nesta jornada?</p>
              </div>
              <div className="space-y-6">
                <input type="text" placeholder="Seu nome aqui..." className="w-full px-8 py-6 bg-white/5 border-2 border-brand-yellow rounded-[2rem] text-white font-bold focus:outline-none shadow-2xl transition-all text-xl" value={data.fullName} onChange={e => setData({ ...data, fullName: e.target.value })} />
                <button disabled={!data.fullName} onClick={nextStep} className="w-full py-6 bg-white text-brand-dark rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl disabled:opacity-20 flex items-center justify-center gap-3 group transition-all">
                  PRÓXIMO <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-white leading-tight tracking-tighter">Quem te acompanha?</h2>
                <p className="text-white/60 font-medium">Os requisitos financeiros mudam conforme o núcleo familiar.</p>
              </div>
              <div className="grid gap-4">
                <SelectionCard selected={data.familyContext === 'solo'} onClick={() => setData({ ...data, familyContext: 'solo', childrenCount: 0 })} icon={<User className="w-6 h-6" />} title="Vou Sozinho(a)" desc="Processo individual focado." />
                <SelectionCard selected={data.familyContext === 'couple'} onClick={() => setData({ ...data, familyContext: 'couple', childrenCount: 0 })} icon={<Users className="w-6 h-6" />} title="Com Cônjuge" desc="Aplicação para casal." />
                <SelectionCard selected={data.familyContext === 'family'} onClick={() => setData({ ...data, familyContext: 'family' })} icon={<Globe className="w-6 h-6" />} title="Com Família" desc="Titular + Dependentes." />
              </div>

              {/* Seletor de Filhos se "Com Família" estiver selecionado */}
              <AnimatePresence>
                {data.familyContext === 'family' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Quantidade de Filhos</p>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">+25% do SMI por dependente</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setData({ ...data, childrenCount: Math.max(0, (data.childrenCount || 0) - 1) })}
                          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xl font-black text-white w-6 text-center">{data.childrenCount}</span>
                        <button
                          onClick={() => setData({ ...data, childrenCount: (data.childrenCount || 0) + 1 })}
                          className="w-10 h-10 rounded-xl bg-brand-yellow text-brand-dark flex items-center justify-center hover:scale-105 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-6 bg-white/5 border border-white/10 text-white rounded-[2rem] font-bold">Voltar</button>
                <button onClick={nextStep} className="flex-[2] py-6 bg-white text-brand-dark rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Continuar</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-white leading-tight tracking-tighter">Sua Atividade.</h2>
                <p className="text-white/60 font-medium">Como você presta seus serviços remotamente?</p>
              </div>
              <div className="grid gap-4">
                <SelectionCard selected={data.workType === 'employee'} onClick={() => setData({ ...data, workType: 'employee' })} icon={<Briefcase className="w-6 h-6" />} title="Empregado (CLT)" desc="Contrato fixo com empresa." />
                <SelectionCard selected={data.workType === 'freelancer'} onClick={() => setData({ ...data, workType: 'freelancer' })} icon={<Target className="w-6 h-6" />} title="Freelancer / PJ" desc="Prestação de serviços (B2B)." />
              </div>

              {/* Seletor de Anos de Experiência */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-white">Anos de Experiência</p>
                  <span className="px-3 py-1 bg-brand-yellow text-brand-dark rounded-lg font-black text-xs">{data.yearsOfExperience} Anos</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={data.yearsOfExperience}
                  onChange={e => setData({ ...data, yearsOfExperience: Number(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-yellow"
                />
                <div className="flex justify-between text-[10px] font-black text-white/20 uppercase tracking-widest">
                  <span>Iniciante</span>
                  <span>Especialista</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-6 bg-white/5 border border-white/10 text-white rounded-[2rem] font-bold">Voltar</button>
                <button onClick={nextStep} className="flex-[2] py-6 bg-white text-brand-dark rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Avançar</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-brand-yellow/20 rounded-full flex items-center justify-center mx-auto border border-brand-yellow/40"><Star className="w-10 h-10 text-brand-yellow fill-brand-yellow" /></div>
                <h2 className="text-4xl font-black text-white tracking-tighter">Personalize sua Meta.</h2>
                <p className="text-white/70 font-medium text-sm px-4">Defina seus objetivos financeiros de acordo com sua realidade atual.</p>
              </div>
              <div className="glass-card rounded-[3rem] p-10 space-y-8 bg-brand-blue/30 border-white/10">
                <div className="space-y-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Renda Mensal Necessária (€)</label><div className="relative"><Calculator className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-yellow" /><input type="number" value={customGoal.monthlyRequired} onChange={e => setCustomGoal({ ...customGoal, monthlyRequired: Number(e.target.value) })} className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white font-black focus:outline-none focus:border-brand-yellow transition-all text-xl" /></div></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Economia Atual (€)</label><div className="relative"><Wallet className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-yellow" /><input type="number" placeholder="Quanto você já tem?" value={customGoal.currentAmount || ''} onChange={e => setCustomGoal({ ...customGoal, currentAmount: Number(e.target.value) })} className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white font-black focus:outline-none focus:border-brand-yellow transition-all text-xl" /></div></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Meta de Reserva Total (€)</label><div className="relative"><Target className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-yellow" /><input type="number" value={customGoal.targetAmount} onChange={e => setCustomGoal({ ...customGoal, targetAmount: Number(e.target.value) })} className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white font-black focus:outline-none focus:border-brand-yellow transition-all text-xl" /></div></div>
                </div>
              </div>
              <button onClick={handleFinish} className="w-full py-7 bg-brand-yellow text-brand-dark rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] transition-all">Gerar Meu Dashboard</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SelectionCard = ({ selected, onClick, icon, title, desc }: any) => (
  <button onClick={onClick} className={`p-8 rounded-[2.5rem] border-2 text-left transition-all duration-500 flex items-center gap-6 ${selected ? 'bg-white/10 border-brand-yellow shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/5'}`}>
    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${selected ? 'bg-brand-yellow text-brand-dark' : 'bg-white/10 text-brand-yellow'}`}>{icon}</div>
    <div className="space-y-1"><h4 className="text-xl font-black text-white tracking-tight">{title}</h4><p className="text-xs font-medium text-white/40">{desc}</p></div>
  </button>
);

export default Onboarding;

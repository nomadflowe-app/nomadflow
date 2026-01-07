import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Zap, ArrowRight, CheckCircle, Plane, Star, Users, Calculator, PiggyBank, FileCheck, Luggage, Newspaper, GraduationCap, MessagesSquare, Headset } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden font-sans selection:bg-brand-yellow selection:text-navy-950">

      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-brand-yellow/30 rounded-full blur-[100px] animate-pulse-slow delay-2000" />
      </div>

      {/* Navbar Transparente */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,204,0,0.3)]">
            <Plane className="w-5 h-5 text-navy-950 fill-navy-950" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">Nomad<span className="text-brand-yellow">Flow</span></span>
        </div>
        <button
          onClick={onOpenAuth}
          className="px-4 py-2 md:px-6 md:py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md rounded-full text-white font-bold text-xs md:text-sm transition-all shadow-lg hover:shadow-white/5 whitespace-nowrap"
        >
          Acessar Plataforma
        </button>
      </nav>

      {/* Hero Section Split */}
      <section className="relative z-10 min-h-screen flex items-center pt-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">

          {/* Left: Copy & CTA */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-brand-yellow/30 rounded-full shadow-[0_0_15px_rgba(255,204,0,0.1)] mx-auto lg:mx-0">
              <span className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-brand-yellow uppercase tracking-[0.2em]">Agora disponível para Brasileiros</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tighter">
              Organize sua jornada rumo ao <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-white to-brand-yellow bg-[200%_auto] animate-shine">Visto de Nômade Digital na Espanha.</span>
            </h1>

            <p className="text-lg text-blue-100/80 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Tudo o que você precisa para se organizar, planejar e solicitar o Visto de Nômade Digital na Espanha, em um único lugar.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-8 py-4 bg-brand-yellow text-navy-950 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_10px_40px_-10px_rgba(255,204,0,0.4)] hover:shadow-[0_20px_60px_-15px_rgba(255,204,0,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                Começar minha jornada
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Right: Visual Experience */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">

              {/* Main Decorative Circle */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-yellow/10 to-transparent rounded-full blur-3xl animate-spin-slow" />

              {/* Floating Cards */}
              <div className="absolute top-[10%] right-[10%] z-20">
                <FloatingCard delay={0}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-black">Status do Visto</p>
                      <p className="text-sm font-bold text-white">Aprovado e Emitido</p>
                    </div>
                  </div>
                </FloatingCard>
              </div>

              <div className="absolute bottom-[20%] left-[0%] z-30">
                <FloatingCard delay={1.5}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black tracking-widest text-red-400 uppercase">Live Agora</span>
                    </div>
                    <p className="text-xs text-white font-medium w-32 leading-tight">Workshop: Impostos na Espanha com Dr. Carlos</p>
                  </div>
                </FloatingCard>
              </div>

              {/* Central App Mockup Concept */}
              <div className="absolute inset-8 bg-navy-900/50 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  </div>
                  <div className="h-2 w-20 bg-white/10 rounded-full" />
                </div>
                <div className="p-8 space-y-6 flex-1 bg-gradient-to-b from-navy-900 to-navy-950">
                  <div className="space-y-2">
                    <div className="h-8 w-3/4 bg-white/10 rounded-lg" />
                    <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-brand-yellow/5 border border-brand-yellow/20 rounded-2xl" />
                    <div className="h-32 bg-white/5 border border-white/10 rounded-2xl" />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* Grid de Benefícios Moderno */}
      <section className="relative z-10 px-6 md:px-12 pb-20 pt-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BenefitCard
            icon={<Calculator className="w-6 h-6" />}
            title="Calculadora de Câmbio"
            desc="Acompanhe valores atualizados e tome decisões financeiras mais seguras para sua mudança."
          />
          <BenefitCard
            icon={<PiggyBank className="w-6 h-6" />}
            title="Reserva Financeira"
            desc="Defina metas, acompanhe sua evolução e saiba exatamente quando estará pronto financeiramente."
          />
          <BenefitCard
            icon={<FileCheck className="w-6 h-6" />}
            title="Checklist de Documentos"
            desc="Nada de erros ou esquecimentos: siga o passo a passo exigido pelas autoridades espanholas."
          />
          <BenefitCard
            icon={<Luggage className="w-6 h-6" />}
            title="Checklist Pessoal"
            desc="Organize sua vida antes da viagem e evite imprevistos na transição para a Espanha."
          />
          <BenefitCard
            icon={<Newspaper className="w-6 h-6" />}
            title="Central de Notícias"
            desc="Fique por dentro de mudanças na legislação, prazos e exigências do Visto de Nômade Digital."
          />
        </div>
      </section>

      {/* Hub Elite Section */}
      <section className="relative z-10 px-6 md:px-12 pb-32 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-navy-900 to-navy-950 border border-brand-yellow/20 rounded-[3rem] p-12 relative overflow-hidden">

          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-yellow/10 rounded-lg border border-brand-yellow/20">
                <Star className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-yellow">Acesso Premium</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Hub <span className="text-brand-yellow">Elite</span></h2>
              <p className="text-lg text-blue-100/80 leading-relaxed">
                Acelere sua aprovação com ferramentas e suporte exclusivos para membros da elite nômade.
              </p>

              <div className="space-y-6">
                <EliteFeature
                  icon={<GraduationCap className="w-5 h-5" />}
                  title="Tutoriais Práticos e Guias"
                  desc="Conteúdo aprofundado, atualizado e direto ao ponto para acelerar sua aprovação."
                />
                <EliteFeature
                  icon={<MessagesSquare className="w-5 h-5" />}
                  title="Comunidade Exclusiva"
                  desc="Conecte-se com pessoas que já estão na Espanha ou no mesmo caminho que você."
                />
                <EliteFeature
                  icon={<Headset className="w-5 h-5" />}
                  title="Suporte Personalizado"
                  desc="Acompanhamento humano para tirar dúvidas e evitar erros que podem atrasar seu visto."
                />
              </div>
            </div>

            {/* Visual Representation of Elite Hub */}
            <div className="relative h-full min-h-[400px] bg-black/20 rounded-3xl border border-white/5 overflow-hidden hidden lg:flex items-center justify-center">
              <div className="text-center space-y-4 opacity-50">
                <div className="w-20 h-20 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-10 h-10 text-brand-yellow" />
                </div>
                <p className="text-sm font-black text-white uppercase tracking-widest">Área de Membros</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center text-white/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 grayscale opacity-50">
              <Plane className="w-5 h-5" />
              <span className="font-bold tracking-tighter">NomadFlow</span>
            </div>
            <div className="flex gap-8 text-sm font-medium">
              <Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
              <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            </div>
            <p className="text-xs">© {new Date().getFullYear()} NomadFlow.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const BenefitCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="glass-card bg-navy-900/40 backdrop-blur-sm rounded-[2rem] p-8 space-y-4 group border border-white/5 hover:border-brand-yellow/30 hover:bg-navy-900/60 transition-all duration-500 hover:-translate-y-2">
    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white group-hover:bg-brand-yellow group-hover:text-navy-950 transition-all duration-300">
      {icon}
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-black text-white group-hover:text-brand-yellow transition-colors">{title}</h3>
      <p className="text-blue-100/60 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const EliteFeature = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex gap-4 items-start group">
    <div className="w-10 h-10 bg-brand-yellow/10 rounded-xl flex items-center justify-center text-brand-yellow flex-shrink-0 group-hover:bg-brand-yellow group-hover:text-navy-950 transition-all">
      {icon}
    </div>
    <div>
      <h4 className="text-white font-bold text-lg">{title}</h4>
      <p className="text-blue-100/60 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const FloatingCard = ({ children, delay }: { children: React.ReactNode, delay: number }) => (
  <motion.div
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    className="glass-card bg-navy-800/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl"
  >
    {children}
  </motion.div>
);


export default LandingPage;

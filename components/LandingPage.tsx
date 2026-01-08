import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Zap, ArrowRight, CheckCircle, Plane, Star, Users, Calculator, PiggyBank, FileCheck, Luggage, Newspaper, GraduationCap, MessagesSquare, Headset, Instagram, Facebook, Linkedin } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1]
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden font-sans selection:bg-brand-yellow selection:text-navy-950">

      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-brand-yellow/30 rounded-full blur-[100px] animate-pulse-slow delay-2000" />
      </div>

      {/* Navbar Transparente */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center backdrop-blur-md bg-navy-950/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
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
      <section className="relative z-10 min-h-screen flex items-center pt-40 md:pt-48 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center w-full">

          {/* Left: Copy & CTA */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 text-center lg:text-left pr-4"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-brand-yellow/30 rounded-full shadow-[0_0_15px_rgba(255,204,0,0.1)] mx-auto lg:mx-0">
              <span className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-brand-yellow uppercase tracking-[0.2em]">Agora disponível para Brasileiros</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-black text-white leading-[1.1] tracking-tighter"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)' }}
            >
              Organize sua <br />
              jornada rumo ao <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-white to-brand-yellow bg-[200%_auto] animate-shine">Visto de Nômade</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-white to-brand-yellow bg-[200%_auto] animate-shine">Digital na Espanha</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base md:text-lg text-blue-100/80 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Tudo o que você precisa para se organizar, planejar e solicitar o Visto de Nômade Digital na Espanha, em um único lugar.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-8 py-4 bg-brand-yellow text-navy-950 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_10px_40px_-10px_rgba(255,204,0,0.4)] hover:shadow-[0_20px_60px_-15px_rgba(255,204,0,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                Começar minha jornada
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right: Visual Experience (Now Image) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="relative hidden lg:flex justify-center items-center"
          >
            <div className="relative w-full max-w-xl scale-110 origin-center">
              <div className="absolute inset-0 bg-brand-yellow/20 blur-[100px] rounded-full opacity-50 animate-pulse-slow" />
              <motion.img
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                src="/hero-phones.png"
                alt="App Interface Preview"
                className="relative z-10 w-full h-auto drop-shadow-2xl"
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* Grid de Benefícios Moderno */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 px-6 md:px-12 pb-20 pt-10 max-w-7xl mx-auto"
      >
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
      </motion.section >

      {/* Hub Elite Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 px-6 md:px-12 pb-32 max-w-7xl mx-auto"
      >
        <div className="bg-gradient-to-br from-navy-900 to-navy-950 border border-brand-yellow/20 rounded-[3rem] p-12 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)]">

          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-brand-yellow/10 rounded-lg border border-brand-yellow/20"
              >
                <Star className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-yellow">Acesso Premium</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Hub <span className="text-brand-yellow">Elite</span></h2>
              <p className="text-lg text-blue-100/80 leading-relaxed">
                Aumente suas chances de aprovação com ferramentas e suporte exclusivos para membros da elite nômade.
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

            {/* Visual Representation of Elite Hub (Moved Animation) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto scale-90">

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
                        <p className="text-[10px] text-white/50 uppercase font-black">Checklist do Visto</p>
                        <p className="text-sm font-bold text-white">Concluído rumo a viagem</p>
                      </div>
                    </div>
                  </FloatingCard>
                </div>

                <div className="absolute bottom-[20%] left-[0%] z-30">
                  <FloatingCard delay={1.5}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse" />
                        <span className="text-[10px] font-black tracking-widest text-brand-yellow uppercase">Meta Financeira</span>
                      </div>
                      <p className="text-xs text-white font-medium w-32 leading-tight">Você atingiu 85% da sua reserva para a Espanha!</p>
                    </div>
                  </FloatingCard>
                </div>

                {/* Central App Mockup Concept */}
                <div className="absolute inset-8 bg-navy-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                  {/* Mockup Header */}
                  <div className="p-6 border-b border-white/5 flex justify-between items-center bg-navy-950/50">
                    <div className="space-y-1">
                      <div className="h-2 w-24 bg-brand-yellow/20 rounded-full" />
                      <div className="h-4 w-32 bg-white/20 rounded-full" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-yellow to-yellow-600 shadow-lg" />
                  </div>

                  {/* Mockup Body */}
                  <div className="p-6 space-y-6 flex-1 bg-gradient-to-b from-navy-900 to-navy-950 relative">
                    {/* Progress Section */}
                    <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between text-[10px] text-white/60 font-medium uppercase tracking-widest">
                        <span>Progresso do Visto</span>
                        <span className="text-brand-yellow">68%</span>
                      </div>
                      <div className="h-2 w-full bg-navy-950 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "68%" }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-brand-yellow rounded-full shadow-[0_0_10px_rgba(255,204,0,0.5)]"
                        />
                      </div>
                    </div>

                    {/* Grid Features */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl space-y-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="h-2 w-16 bg-blue-400/20 rounded-full" />
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="h-2 w-20 bg-emerald-400/20 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Glass Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </motion.section >

      {/* Footer */}
      < footer className="relative z-10 py-12 text-center text-white/20 border-t border-white/5" >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2 grayscale opacity-50 hover:opacity-100 transition-opacity duration-300">
                <Plane className="w-5 h-5" />
                <span className="font-bold tracking-tighter text-white/40">NomadFlow</span>
              </div>
              <div className="flex gap-4">
                <SocialLink href="https://instagram.com" icon={<Instagram className="w-4 h-4" />} />
                <SocialLink href="https://facebook.com" icon={<Facebook className="w-4 h-4" />} />
                <SocialLink href="https://linkedin.com" icon={<Linkedin className="w-4 h-4" />} />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
              <Link to="/seja-parceiro" className="text-brand-yellow hover:text-white transition-colors font-bold group flex items-center gap-1">
                Seja um Parceiro
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
              <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            </div>

            <p className="text-xs">© {new Date().getFullYear()} NomadFlow.</p>
          </div>
        </div>
      </footer >
    </div >
  );
};

const SocialLink = ({ href, icon }: { href: string, icon: React.ReactNode }) => (
  <motion.a
    whileHover={{ scale: 1.2, rotate: 8 }}
    whileTap={{ scale: 0.9 }}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-yellow hover:text-navy-950 transition-all duration-300"
  >
    {icon}
  </motion.a>
);

const BenefitCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -10 }}
      className="glass-card bg-navy-900/40 backdrop-blur-sm rounded-[2rem] p-8 space-y-4 group border border-white/5 hover:border-brand-yellow/30 hover:bg-navy-900/60 transition-all duration-500 shadow-xl"
    >
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white group-hover:bg-brand-yellow group-hover:text-navy-950 transition-all duration-300 group-hover:rotate-12">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-black text-white group-hover:text-brand-yellow transition-colors">{title}</h3>
        <p className="text-blue-100/60 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
};

const EliteFeature = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    className="flex gap-4 items-start group"
  >
    <div className="w-10 h-10 bg-brand-yellow/10 rounded-xl flex items-center justify-center text-brand-yellow flex-shrink-0 group-hover:bg-brand-yellow group-hover:text-navy-950 transition-all group-hover:scale-110">
      {icon}
    </div>
    <div>
      <h4 className="text-white font-bold text-lg group-hover:text-brand-yellow transition-colors">{title}</h4>
      <p className="text-blue-100/60 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const FloatingCard = ({ children, delay }: { children: React.ReactNode, delay: number }) => (
  <motion.div
    animate={{
      y: [0, -15, 0],
      rotate: [0, 2, 0]
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
    className="glass-card bg-navy-800/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl"
  >
    {children}
  </motion.div>
);


export default LandingPage;

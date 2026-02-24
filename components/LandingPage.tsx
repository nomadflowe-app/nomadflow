import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Map,
  Scale,
  Lock,
  MessageCircle,
  Instagram,
  Facebook,
  Linkedin,
  Plane,
  FileCheck,
  Calculator,
  GraduationCap,
  Headset,
  AlertTriangle,
  Globe,
  Briefcase,
  Users,
  Star,
  Zap,
  Compass,
  CheckCircle2,
  Languages,
  Library,
  BookOpen
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden font-sans selection:bg-brand-yellow selection:text-navy-950 text-white">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[70%] md:w-[50%] h-[50%] bg-blue-600/10 md:bg-blue-600/20 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[70%] md:w-[50%] h-[50%] bg-purple-600/10 md:bg-purple-600/20 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute top-[15%] right-[10%] w-[40%] md:w-[30%] h-[30%] bg-brand-yellow/5 md:bg-brand-yellow/10 rounded-full blur-[80px] md:blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-12 py-4 flex justify-between items-center backdrop-blur-md bg-navy-950/80 border-b border-white/5">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg md:text-xl font-black tracking-tighter text-white">Nomad<span className="text-brand-yellow">Flow</span></span>
        </div>
        <button
          onClick={onOpenAuth}
          className="px-4 md:px-6 py-2 bg-brand-yellow text-navy-950 font-bold rounded-full hover:bg-brand-yellow/90 transition-all shadow-lg active:scale-95 text-xs md:text-sm whitespace-nowrap"
        >
          Acessar Plataforma
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 md:pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
        {/* Floating Background Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 text-brand-yellow/10 md:text-brand-yellow/20"
          >
            <Globe className="w-16 h-16 md:w-24 md:h-24" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 right-10 text-blue-500/5 md:text-blue-500/10"
          >
            <Plane className="w-20 h-20 md:w-32 md:h-32" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center md:text-left space-y-6 md:space-y-8 relative z-10"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20">
            <span className="text-[10px] md:text-xs font-black text-brand-yellow uppercase tracking-widest">Autonomia & Economia Real</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] md:leading-[1.05] tracking-tighter text-center md:text-left">
            <span className="block">Seu Visto de</span>
            <span className="block">Nômade na</span>
            <span className="block">Espanha: <span className="text-brand-yellow">Menos</span></span>
            <span className="block text-brand-yellow">de 10% do custo</span>
            <span className="block">de uma assessoria.</span>
          </h1>

          <p className="text-base md:text-xl text-blue-100/80 leading-relaxed max-w-2xl mx-auto md:mx-0">
            Não gaste fortunas com promessas que ninguém pode garantir. Tenha o mapa completo, ferramentas de cálculo e checklists oficiais para conquistar seu visto sozinho.
          </p>

          <div className="flex flex-col items-center md:items-start gap-4">
            <button
              onClick={onOpenAuth}
              className="w-full md:w-auto px-8 py-4 md:py-5 bg-brand-yellow text-navy-950 rounded-2xl font-black text-base md:text-lg uppercase tracking-widest shadow-[0_0_30px_rgba(255,204,0,0.3)] hover:shadow-[0_0_50px_rgba(255,204,0,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              Começar agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-yellow" />
              Reembolso garantido em até 7 dias, risco zero.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex-1 w-full max-w-2xl md:max-w-3xl relative px-4 mt-12 md:mt-0"
        >
          <div className="relative group scale-105 md:scale-100">
            <div className="absolute inset-0 bg-brand-yellow/10 md:bg-brand-yellow/20 blur-[80px] md:blur-[100px] rounded-full group-hover:bg-brand-yellow/30 transition-colors" />

            {/* Floating Elements on Image */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -left-4 md:-top-6 md:-left-6 bg-navy-900 border border-white/10 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-xl z-20"
            >
              <Compass className="w-5 h-5 md:w-6 md:h-6 text-brand-yellow" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-navy-900 border border-white/10 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-xl z-20"
            >
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
            </motion.div>

            <img
              src="/hero-phones.png"
              alt="App Preview"
              className="relative z-10 w-full drop-shadow-2xl group-hover:scale-[1.02] transition-transform duration-700"
              onError={(e) => {
                console.error("Image failed to load:", e);
              }}
            />
          </div>
        </motion.div>
      </section>



      {/* The Problem Section */}
      <section className="relative z-10 py-24 bg-navy-900/50 backdrop-blur-sm border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 text-red-400 mb-4 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">A Verdade sobre as Assessorias</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
            Por que pagar caro por um risco que é o mesmo?
          </h2>

          <p className="text-lg md:text-xl text-blue-100/70 leading-relaxed">
            Muita gente acredita que uma assessoria garante a aprovação. <strong className="text-white">A verdade?</strong> A decisão é 100% do governo espanhol.
            Mesmo as assessorias mais caras se isentam de responsabilidade em caso de negativa.
          </p>

          <p className="text-lg md:text-xl text-blue-100/70 leading-relaxed">
            Se o risco é o mesmo, por que pagar fortunas apenas para alguém organizar papéis que você mesmo pode gerenciar?
            No <span className="text-brand-yellow font-bold">NomadFlow</span>, você tem as mesmas informações por uma fração do preço, guardando seu dinheiro para o que importa: <strong className="text-white">sua vida na Espanha.</strong>
          </p>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">

          {/* Card A: Tradicional */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 space-y-6 grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition-all duration-500"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-white/60" />
              </div>
              <h3 className="text-2xl font-black text-white/60">Assessoria Tradicional</h3>
            </div>

            <div className="space-y-6 divide-y divide-white/5">
              <div className="pt-4">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Custo Estimado</p>
                <p className="text-xl font-bold text-red-300">R$ 6.000 a R$ 12.000+</p>
              </div>
              <div className="pt-4">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Garantia</p>
                <div className="flex items-center gap-2 text-white/60">
                  <X className="w-4 h-4 text-red-400" />
                  Nenhuma (se isentam da decisão)
                </div>
              </div>
              <div className="pt-4">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Controle</p>
                <p className="text-white/60">Você fica na dependência de terceiros</p>
              </div>
              <div className="pt-4">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Risco</p>
                <p className="text-white/60">O mesmo de fazer sozinho</p>
              </div>
            </div>
          </motion.div>

          {/* Card B: NomadFlow */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-navy-900 border-2 border-brand-yellow rounded-3xl p-8 md:p-12 space-y-6 relative overflow-hidden shadow-2xl shadow-brand-yellow/10"
          >
            <div className="absolute top-0 right-0 bg-brand-yellow text-navy-950 text-xs font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest">
              Escolha Inteligente
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-brand-yellow text-navy-950 flex items-center justify-center shadow-lg shadow-brand-yellow/50">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black text-white">NomadFlow</h3>
            </div>

            <div className="space-y-6 divide-y divide-white/10">
              <div className="pt-4">
                <p className="text-xs font-black text-brand-yellow uppercase tracking-widest mb-1">Custo</p>
                <p className="text-3xl font-black text-brand-yellow">Menos de 10% <span className="text-lg text-white/60 font-medium">de uma assessoria</span></p>
              </div>
              <div className="pt-4">
                <p className="text-xs font-black text-brand-yellow uppercase tracking-widest mb-1">Garantia</p>
                <div className="flex items-center gap-2 text-white font-bold">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  7 dias de satisfação total
                </div>
              </div>
              <div className="pt-4">
                <p className="text-xs font-black text-brand-yellow uppercase tracking-widest mb-1">Controle</p>
                <p className="text-white font-bold">Autonomia total com nosso GPS passo a passo</p>
              </div>
              <div className="pt-4">
                <p className="text-xs font-black text-brand-yellow uppercase tracking-widest mb-1">Economia</p>
                <p className="text-white font-bold">Dinheiro direto para sua reserva financeira</p>
              </div>
            </div>

            <button onClick={onOpenAuth} className="w-full py-4 mt-4 bg-brand-yellow text-navy-950 rounded-xl font-black uppercase tracking-widest hover:bg-white hover:scale-[1.02] transition-all">
              Escolher NomadFlow
            </button>
          </motion.div>

        </div>
      </section>

      {/* Roadmap Section */}
      <section className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Seu Caminho para a Liberdade</h2>
          <p className="text-blue-100/60 max-w-2xl mx-auto">Um processo claro, dividido em 4 etapas fundamentais para você não se perder.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 relative">
          <div className="hidden md:block absolute top-[40%] left-0 w-full h-px bg-white/10 border-t border-dashed border-white/20 -z-10" />

          {[
            { step: "01", title: "Cálculo & Planejamento", desc: "Use nossas calculadoras para saber sua reserva exata." },
            { step: "02", title: "Organização Documental", desc: "Siga o checklist inteligente baseado na lei espanhola." },
            { step: "03", title: "Submissão Digital", desc: "Guia passo a passo para enviar seu processo online." },
            { step: "04", title: "Aprovação & Mudança", desc: "Prepare as malas para viver o sonho espanhol." }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors relative"
            >
              <span className="text-4xl font-black text-brand-yellow/20 absolute top-4 right-6">{item.step}</span>
              <div className="w-10 h-10 rounded-full bg-brand-yellow text-navy-950 flex items-center justify-center font-black mb-6 shadow-lg shadow-brand-yellow/20">
                {idx + 1}
              </div>
              <h3 className="text-lg font-black mb-2">{item.title}</h3>
              <p className="text-sm text-blue-100/60 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 space-y-4">
            <span className="text-brand-yellow font-black uppercase tracking-[0.2em] text-xs">O que você recebe</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Ferramentas de Poder</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<FileCheck className="w-6 h-6" />}
              title="Checklist Inteligente"
              desc="Baseado na Lei de Startups (Ley 28/2022). Saiba exatamente o que preparar."
            />
            <FeatureCard
              icon={<Calculator className="w-6 h-6" />}
              title="Calculadora de Reserva"
              desc="Saiba quanto precisa em conta para ser aprovado, sem erros de câmbio."
            />
            <FeatureCard
              icon={<GraduationCap className="w-6 h-6" />}
              title="Hub de Conteúdo"
              desc="Tutoriais práticos para preencher formulários sozinho, sem travar."
            />
            <FeatureCard
              icon={<Headset className="w-6 h-6" />}
              title="Suporte Direto"
              desc="Tira-dúvidas sobre a plataforma para você nunca se sentir desamparado."
            />
          </div>
        </div>
      </section>



      {/* Who We Are Section */}
      <section className="relative z-10 py-24 px-6 md:px-12 max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">De Nômades para Nômades.</h2>
          <p className="text-lg text-blue-100/70 leading-relaxed">
            O NomadFlow não nasceu em um escritório de advocacia, mas sim da experiência real de quem sentiu na pele o desafio de mudar para a Espanha.
          </p>
          <p className="text-lg text-blue-100/70 leading-relaxed">
            Percebemos que as assessorias cobravam valores exorbitantes apenas para organizar documentos que já são públicos. Entendemos que o que o nômade digital realmente precisa não é de alguém para "segurar sua mão", mas sim de um mapa de navegação preciso.
          </p>
          <p className="text-lg text-blue-100/70 leading-relaxed">
            Desenvolvemos o NomadFlow para ser esse GPS. Unimos tecnologia e a legislação oficial (Lei 28/2022) para criar uma plataforma que entrega autonomia, segurança e economia. Nossa missão é garantir que você não gaste o dinheiro da sua viagem antes mesmo de ela começar.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
          <div className="space-y-2">
            <div className="text-brand-yellow font-black text-xl">Informação Validada</div>
            <p className="text-xs text-white/50">Baseada em fontes oficiais do governo espanhol.</p>
          </div>
          <div className="space-y-2">
            <div className="text-brand-yellow font-black text-xl">Foco em Autonomia</div>
            <p className="text-xs text-white/50">Ferramentas criadas para você ser o dono do seu processo.</p>
          </div>
          <div className="space-y-2">
            <div className="text-brand-yellow font-black text-xl">Transparência Total</div>
            <p className="text-xs text-white/50">Sem promessas falsas, apenas organização real.</p>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16 space-y-4">
          <span className="text-brand-yellow font-black uppercase tracking-[0.2em] text-xs">Rede de Apoio</span>
          <h2 className="text-3xl md:text-5xl font-black text-white">Nossos Parceiros Estratégicos</h2>
          <p className="text-blue-100/60 max-w-2xl mx-auto">
            Conectamos você aos melhores profissionais para garantir que cada etapa da sua jornada seja impecável.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <PartnerCard
            icon={<Languages className="w-8 h-8" />}
            title="Tradutor Juramentado"
            specialty="Espanhol"
            desc="Melhor tempo de entrega e melhor preço do mercado. Traduções oficiais aceitas pelo governo espanhol."
          />
          <PartnerCard
            icon={<Scale className="w-8 h-8" />}
            title="Advogada Espanhola"
            specialty="Especialista em Imigração"
            desc="O melhor preço para suporte jurídico especializado e revisão final de processos complexos."
          />
          <PartnerCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Professora de Espanhol"
            specialty="Nativa"
            desc="Aprenda o espanhol real para o dia a dia e para as entrevistas, com foco em imigração."
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 bg-navy-900/30 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12">Perguntas Frequentes</h2>

          <div className="space-y-4">
            <FaqItem
              question="O NomadFlow é uma assessoria jurídica?"
              answer="Não. Somos uma plataforma de tecnologia e organização. Você economiza milhares de reais fazendo o processo sozinho, usando nossa tecnologia para não errar."
              isOpen={openFaq === 0}
              onClick={() => toggleFaq(0)}
            />
            <FaqItem
              question="É seguro fazer o processo sem assessoria?"
              answer="Sim! O processo é administrativo. Com as informações certas e organização, qualquer pessoa pode aplicar. O governo não exige advogados."
              isOpen={openFaq === 1}
              onClick={() => toggleFaq(1)}
            />
            <FaqItem
              question="Eu preciso ser da área de TI para conseguir esse visto?"
              answer="Não! O visto é para qualquer profissional que consiga trabalhar remotamente (CLT ou PJ). No app, explicamos como cada perfil se organiza."
              isOpen={openFaq === 2}
              onClick={() => toggleFaq(2)}
            />
            <FaqItem
              question="O app ajuda quem vai com a família?"
              answer="Com certeza. Nossa calculadora de reserva financeira considera os valores adicionais exigidos para dependentes."
              isOpen={openFaq === 3}
              onClick={() => toggleFaq(3)}
            />
            <FaqItem
              question="O que acontece se eu não gostar?"
              answer="Você tem 7 dias de garantia incondicional. Devolvemos seu dinheiro sem burocracia."
              isOpen={openFaq === 4}
              onClick={() => toggleFaq(4)}
            />
            <FaqItem
              question="O suporte tira dúvidas do visto?"
              answer="Ajudamos você a entender as exigências e como usar a plataforma para ter sucesso, mas quem assina e executa o processo é você."
              isOpen={openFaq === 5}
              onClick={() => toggleFaq(5)}
            />
          </div>

          <div className="mt-16 text-center space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
            <p className="text-lg font-medium text-white">Ainda com dúvidas se o NomadFlow é para você?</p>
            <p className="text-sm text-white/60">Nosso time está online para te ajudar a entender como a plataforma pode acelerar sua jornada.</p>
            <a
              href="https://wa.me/" // TODO: Substituir pelo numero real
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-900/20"
            >
              <MessageCircle className="w-5 h-5" />
              Falar com Suporte no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 bg-navy-950 text-center space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-6 w-full opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-white/40" />
            <span className="font-bold text-white/40">NomadFlow © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-yellow transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-brand-yellow transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-brand-yellow transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
          <div className="flex gap-6 text-sm font-bold text-white/40">
            <Link to="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-[10px] text-white/20 leading-relaxed border-t border-white/5 pt-8">
          <strong className="block text-white/30 mb-2 uppercase tracking-widest">Aviso Legal Obrigatório</strong>
          O NomadFlow é um software de organização e produtividade. Não prestamos assessoria jurídica ou representação consular.
          A aprovação do visto é de inteira responsabilidade das autoridades espanholas e do cumprimento dos requisitos pelo usuário.
        </div>
      </footer>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-navy-900/50 border border-white/5 p-8 rounded-3xl hover:border-brand-yellow/30 hover:bg-navy-900 transition-all duration-300 group"
  >
    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:bg-brand-yellow group-hover:text-navy-950 transition-colors group-hover:scale-110">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-yellow transition-colors">{title}</h3>
    <p className="text-sm text-blue-100/60 leading-relaxed">{desc}</p>
  </motion.div>
);

const FaqItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => (
  <div className="border border-white/5 rounded-2xl overflow-hidden bg-navy-900/20">
    <button
      onClick={onClick}
      className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-colors"
    >
      <span className="font-bold text-white pr-4">{question}</span>
      <ChevronDown className={`w-5 h-5 text-brand-yellow transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="p-6 pt-0 text-blue-100/70 text-sm leading-relaxed border-t border-white/5">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const PartnerCard = ({ icon, title, specialty, desc }: { icon: any, title: string, specialty: string, desc: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    whileHover={{ y: -10 }}
    className="bg-navy-900/50 border border-white/10 p-10 rounded-[2.5rem] flex flex-col items-center text-center group hover:bg-navy-900 hover:border-brand-yellow/30 transition-all duration-500 shadow-xl"
  >
    <div className="w-20 h-20 bg-brand-yellow/10 rounded-3xl flex items-center justify-center text-brand-yellow mb-8 group-hover:bg-brand-yellow group-hover:text-navy-950 transition-all duration-500 group-hover:scale-110 shadow-lg shadow-brand-yellow/5">
      {icon}
    </div>
    <div className="space-y-2 mb-6">
      <h3 className="text-2xl font-black text-white group-hover:text-brand-yellow transition-colors">{title}</h3>
      <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10">
        <span className="text-[10px] font-bold text-brand-yellow uppercase tracking-widest">{specialty}</span>
      </div>
    </div>
    <p className="text-blue-100/60 text-sm leading-relaxed font-medium">
      {desc}
    </p>
  </motion.div>
);

export default LandingPage;

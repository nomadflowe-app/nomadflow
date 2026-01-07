import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Database, ChevronLeft, Server, UserCheck, HardDrive } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-navy-950 text-white selection:bg-brand-yellow/30 selection:text-white">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[70vw] h-[70vw] bg-green-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[70vw] h-[70vw] bg-brand-yellow/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
                {/* Header */}
                <header className="mb-12 text-center space-y-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-brand-yellow hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-8">
                        <ChevronLeft className="w-4 h-4" />
                        Voltar ao Início
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                            <ShieldCheck className="w-8 h-8 text-green-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Política de <span className="text-green-500">Privacidade</span>
                        </h1>
                        <p className="text-blue-100/60 text-lg max-w-2xl mx-auto leading-relaxed">
                            Como protegemos seus dados enquanto você foca na sua imigração.
                        </p>
                    </motion.div>
                </header>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-8"
                >
                    {/* Data Collection */}
                    <section className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/5 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                                <Database className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-white">1. Dados que Coletamos</h2>
                        </div>

                        <div className="space-y-4 text-white/70 leading-relaxed">
                            <p>
                                Para fornecer nossos serviços e personalizar sua experiência no NomadFlow, coletamos apenas os dados essenciais:
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <UserCheck className="w-5 h-5 text-brand-yellow" />
                                        <h3 className="font-bold text-white">Informações de Cadastro</h3>
                                    </div>
                                    <p className="text-sm">Nome, e-mail e foto de perfil (quando fornecida via login social) para criar e gerenciar sua conta.</p>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <HardDrive className="w-5 h-5 text-brand-yellow" />
                                        <h3 className="font-bold text-white">Dados de Progresso</h3>
                                    </div>
                                    <p className="text-sm">Status das suas checklists, data de viagem e metas salvas para que você possa continuar de onde parou.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Usage & Protection */}
                    <section className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/5 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-white">2. Como Protegemos seus Dados</h2>
                        </div>

                        <div className="space-y-4 text-white/70 leading-relaxed">
                            <p>
                                A segurança dos seus dados é nossa prioridade. Utilizamos infraestrutura de nível empresarial para garantir a integridade e privacidade das suas informações.
                            </p>
                            <ul className="space-y-4 mt-4">
                                <li className="flex gap-4">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                    <p><strong>Criptografia:</strong> Todos os dados sensíveis são transmitidos via conexão segura (SSL/TLS) e armazenados em bancos de dados seguros.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                    <p><strong>Autenticação Segura:</strong> Utilizamos provedores de autenticação modernos (Supabase Auth/Google) para que nunca tenhamos acesso à sua senha original.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                    <p><strong>Acesso Restrito:</strong> Seus dados de progresso e checklists são privados e acessíveis apenas por você através da sua conta logada.</p>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* User Rights */}
                    <section className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/5 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-brand-yellow/10 text-brand-yellow">
                                <Eye className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-white">3. Seus Direitos</h2>
                        </div>

                        <div className="space-y-4 text-white/70 leading-relaxed">
                            <p>
                                Você tem total controle sobre suas informações. De acordo com a LGPD (Brasil) e GDPR (Europa), você tem o direito de:
                            </p>
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 grid gap-4">
                                <p>• Solicitar uma cópia de todos os dados que temos sobre você.</p>
                                <p>• Corrigir informações incompletas ou imprecisas.</p>
                                <p>• <strong>Solicitar a exclusão total da sua conta e de todos os dados associados</strong> a qualquer momento.</p>
                            </div>
                            <p className="text-sm pt-4">
                                Para exercer qualquer um desses direitos, basta entrar em contato conosco através do suporte na plataforma ou pelo e-mail de contato oficial.
                            </p>
                        </div>
                    </section>

                    <div className="text-center pt-8 pb-12 text-white/40 text-sm">
                        <p>Última atualização: {new Date().getFullYear()}</p>
                        <p>NomadFlow © Todos os direitos reservados.</p>
                    </div>

                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

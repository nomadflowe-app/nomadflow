import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Scale, Users, Lock, ChevronLeft, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfUse: React.FC = () => {
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-navy-950 text-white selection:bg-brand-yellow/30 selection:text-white">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[70vw] h-[70vw] bg-brand-yellow/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[70vw] h-[70vw] bg-blue-600/5 rounded-full blur-[120px]" />
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
                        <div className="w-16 h-16 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-yellow/20">
                            <Scale className="w-8 h-8 text-brand-yellow" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Termos de Uso e <span className="text-brand-yellow">Responsabilidade</span>
                        </h1>
                        <p className="text-blue-100/60 text-lg max-w-2xl mx-auto leading-relaxed">
                            Transparência total sobre o propósito, o alcance e as regras da nossa comunidade.
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
                    {/* Disclaimer Section */}
                    <section className="glass-card p-8 md:p-10 rounded-[2.5rem] border border-red-500/20 bg-red-500/5 relative overflow-hidden group hover:bg-red-500/10 transition-colors">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <ShieldAlert className="w-32 h-32" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-red-500/20 text-red-500">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-red-100">Isenção de Responsabilidade</h2>
                            </div>

                            <div className="space-y-4 text-red-100/80 leading-relaxed font-medium">
                                <p>
                                    <strong className="text-white">O NomadFlow NÃO é um escritório de advocacia e não presta assessoria jurídica individualizada.</strong>
                                </p>
                                <p>
                                    Todo o conteúdo disponibilizado nesta plataforma (guias, tutoriais, checklists e templates) tem caráter estritamente <strong>informativo e educacional</strong>. O material foi desenvolvido com base na experiência prática dos criadores (que obtiveram sucesso em seus processos) e nas informações oficiais disponibilizadas pelo Governo da Espanha.
                                </p>
                                <p>
                                    Embora nos esforcemos para manter as informações atualizadas conforme os critérios oficiais, <strong>NÃO GARANTIMOS 100% DE ÊXITO</strong> em sua solicitação. A aprovação de vistos e autorizações de residência é uma prerrogativa soberana e exclusiva das autoridades imigratórias da Espanha (UGE-CE), sujeita à análise subjetiva dos funcionários e às particularidades do caso de cada solicitante.
                                </p>
                                <div className="bg-red-500/20 p-4 rounded-xl border border-red-500/20 mt-4">
                                    <p className="text-sm font-bold text-red-200">
                                        O uso deste aplicativo é destinado a pessoas que desejam realizar o processo por conta própria ("Do It Yourself"). Ao utilizar nossos guias, você assume total responsabilidade pela preparação, conferência e apresentação dos seus documentos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/5 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-brand-yellow/10 text-brand-yellow">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-white">Propriedade Intelectual e Pirataria</h2>
                        </div>

                        <div className="space-y-4 text-white/70 leading-relaxed">
                            <p>
                                Todo o conteúdo presente no NomadFlow (vídeos, textos, layouts, documentos de modelo e estratégias) é de propriedade exclusiva e intelectual dos criadores e protegido pelas leis de direitos autorais.
                            </p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-brand-yellow mt-1 flex-shrink-0" />
                                    <span>É <strong>estritamente proibido</strong> compartilhar, revender, distribuir ou publicar qualquer parte do conteúdo exclusivo desta área de membros.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-brand-yellow mt-1 flex-shrink-0" />
                                    <span>O acesso é pessoal e intransferível. O compartilhamento de login/senha poderá resultar no banimento imediato e definitivo da plataforma, sem direito a reembolso.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-brand-yellow mt-1 flex-shrink-0" />
                                    <span>Monitoramos acessos simultâneos e atividades suspeitas para garantir a segurança e exclusividade da nossa comunidade.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Community Rules */}
                    <section className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/5 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-white">Regras da Comunidade</h2>
                        </div>

                        <div className="space-y-4 text-white/70 leading-relaxed">
                            <p>
                                A comunidade do NomadFlow é um espaço colaborativo para troca de experiências e apoio mútuo. Para manter um ambiente saudável e produtivo, todos os membros devem seguir estas diretrizes:
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <h3 className="font-bold text-white mb-2">Respeito Mútuo</h3>
                                    <p className="text-sm">Não toleramos discursos de ódio, preconceito, assédio ou falta de educação com outros membros ou com a equipe.</p>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <h3 className="font-bold text-white mb-2">Colaboração</h3>
                                    <p className="text-sm">O objetivo é ajudar. Compartilhe suas dúvidas e, se souber, ajude a responder as de outros nômades.</p>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <h3 className="font-bold text-white mb-2">Sem Spam</h3>
                                    <p className="text-sm">É proibido divulgar serviços externos, correntes, ou qualquer material não relacionado ao propósito da imigração.</p>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <h3 className="font-bold text-white mb-2">Privacidade</h3>
                                    <p className="text-sm">Nunca compartilhe dados sensíveis (números de documentos, senhas, etc) publicamente nos posts.</p>
                                </div>
                            </div>
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

export default TermsOfUse;

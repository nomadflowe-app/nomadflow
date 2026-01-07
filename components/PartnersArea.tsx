
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ExternalLink,
    Copy,
    Check,
    MessageCircle,
    ShieldCheck,
    Home,
    Landmark,
    Briefcase
} from 'lucide-react';
import { getPartners } from '../lib/supabase';

interface Partner {
    id: string;
    name: string;
    category: string;
    description: string;
    whatsapp: string;
    site_url: string;
    discount_code: string;
    logo_url: string;
    is_exclusive: boolean;
}

const CATEGORIES = [
    { id: 'Todos', label: 'Todos', icon: null },
    { id: 'Vistos', label: 'Vistos & Legal', icon: ShieldCheck },
    { id: 'Financeiro', label: 'Financeiro', icon: Landmark },
    { id: 'Moradia', label: 'Moradia', icon: Home },
    { id: 'Seguros', label: 'Seguros', icon: ShieldCheck },
    { id: 'Outros', label: 'Outros', icon: Briefcase },
];

export const PartnersArea: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        try {
            const data = await getPartners();
            if (data) setPartners(data);
        } catch (error) {
            console.error('Error loading partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredPartners = partners.filter(p => {
        const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-8">
            <div className="space-y-12">

                {/* Header */}
                <div className="space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-white tracking-tighter"
                    >
                        Rede de <span className="text-brand-yellow">Parceiros</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-blue-200/60 max-w-2xl font-medium"
                    >
                        Descontos exclusivos e serviços verificados para acelerar sua jornada nômade.
                    </motion.p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto custom-scrollbar">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeCategory === cat.id
                                    ? 'bg-brand-yellow text-navy-950 shadow-lg shadow-brand-yellow/20'
                                    : 'bg-white/5 text-white hover:bg-white/10'
                                    }`}
                            >
                                {cat.icon && <cat.icon className="w-3 h-3" />}
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-brand-yellow transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar parceiro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-brand-yellow/50 transition-all placeholder:text-white/20"
                        />
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white/5 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence mode='popLayout'>
                            {filteredPartners.map((partner) => (
                                <motion.div
                                    layout
                                    key={partner.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="glass-card bg-navy-900/50 hover:bg-navy-900 border-white/5 hover:border-brand-yellow/20 rounded-[2rem] p-6 flex flex-col gap-6 group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-yellow/5"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center overflow-hidden">
                                            {partner.logo_url ? (
                                                <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <Briefcase className="w-8 h-8 text-navy-950" />
                                            )}
                                        </div>
                                        {partner.is_exclusive && (
                                            <span className="bg-brand-yellow/10 text-brand-yellow text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-brand-yellow/20">
                                                Exclusivo
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        <h3 className="text-xl font-bold text-white group-hover:text-brand-yellow transition-colors">{partner.name}</h3>
                                        <p className="text-sm text-blue-200/60 leading-relaxed line-clamp-3">{partner.description}</p>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        {partner.discount_code && (
                                            <div className="p-3 bg-black/20 rounded-xl flex justify-between items-center group/code">
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider block">Cupom</span>
                                                    <code className="text-brand-yellow font-mono font-bold text-sm tracking-wide">{partner.discount_code}</code>
                                                </div>
                                                <button
                                                    onClick={() => handleCopyCode(partner.discount_code, partner.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                                                    title="Copiar cupom"
                                                >
                                                    {copiedId === partner.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            {partner.whatsapp && (
                                                <a
                                                    href={formatWhatsappLink(partner.whatsapp, partner.name)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-[#25D366]/20 text-white hover:text-[#25D366] text-xs font-bold transition-all border border-transparent hover:border-[#25D366]/30"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    Whatsapp
                                                </a>
                                            )}
                                            {partner.site_url && (
                                                <a
                                                    href={partner.site_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Site
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper for whatsapp link
const formatWhatsappLink = (number: string, partnerName: string) => {
    const cleanNum = number.replace(/\D/g, '');
    const text = encodeURIComponent(`Olá! Sou membro do NomadFlow e gostaria de saber mais sobre os benefícios da ${partnerName}.`);
    return `https://wa.me/${cleanNum}?text=${text}`;
};

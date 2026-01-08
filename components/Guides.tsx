
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronRight,
  X,
  Flame,
  CheckCircle,
  Newspaper,
  Calendar,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { getGuides } from '../lib/supabase';
import { ContentArticle } from '../types';
import { useContentProtection } from '../hooks/useContentProtection';

const Guides: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ContentArticle | null>(null);
  const [articles, setArticles] = useState<ContentArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useContentProtection(!!selectedArticle);

  React.useEffect(() => {
    async function loadArticles() {
      setLoading(true);
      const data = await getGuides();

      const mappedArticles: ContentArticle[] = data.map((g: any) => ({
        id: g.id,
        title: g.title,
        category: g.category || 'Geral',
        excerpt: g.excerpt || '',
        content: typeof g.content === 'string' ? g.content : JSON.stringify(g.content),
        isPremium: g.is_premium || false,
        readTime: g.read_time || '5 min',
        thumbnail: g.thumbnail || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800'
      }));

      setArticles(mappedArticles);
      setLoading(false);
    }
    loadArticles();
  }, []);

  const filteredNews = useMemo(() => {
    return articles.filter(a =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, articles]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-32"
    >
      <motion.header variants={itemVariants} className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Notícias & Updates</h1>
            <p className="text-white/60 font-medium italic">Monitorando o cenário migratório em tempo real.</p>
          </div>
          <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow border border-brand-yellow/20">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar notícias e updates..."
            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-white transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.header>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
              <p className="text-white/40 font-black uppercase text-[10px] tracking-widest">Buscando Atualizações...</p>
            </motion.div>
          ) : filteredNews.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-20 space-y-4">
              <MessageSquare className="w-12 h-12 text-white/10 mx-auto" />
              <p className="text-white/40 font-black uppercase text-xs tracking-widest">Nenhuma notícia encontrada</p>
            </motion.div>
          ) : (
            filteredNews.map(article => (
              <motion.div
                layout
                key={article.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedArticle(article)}
                className="glass-card bg-navy-900/40 hover:bg-navy-900 border-white/5 hover:border-brand-yellow/20 rounded-[2.5rem] overflow-hidden cursor-pointer group relative flex flex-col h-full shadow-lg hover:shadow-2xl hover:shadow-brand-yellow/5 transition-all duration-500"
              >
                <div className="relative h-56 flex-shrink-0 overflow-hidden">
                  <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent opacity-90" />

                  <div className="absolute top-5 left-5 z-20">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-lg ${article.category === 'Urgente' ? 'bg-red-500/20 border-red-500/40 text-red-500' : 'bg-navy-950/40 border-white/10 text-brand-yellow'
                      }`}>
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-1 relative">
                  {/* Decorative line */}
                  <div className="absolute top-0 left-7 right-7 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                      <Calendar className="w-3 h-3 text-brand-yellow/50" />
                      {article.readTime} LEITURA
                    </div>
                    <h3 className="text-xl font-black text-white leading-tight group-hover:text-brand-yellow transition-colors line-clamp-2">{article.title}</h3>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center gap-4">
                    <p className="text-xs text-white/50 flex-1 line-clamp-2 font-medium leading-relaxed">
                      "{article.excerpt}"
                    </p>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-brand-yellow group-hover:text-navy-950 transition-all shadow-lg">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] bg-brand-dark overflow-y-auto no-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="min-h-screen pb-32"
            >
              <div className="relative h-[45vh]">
                <img src={selectedArticle.thumbnail} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-10 left-8 bg-white/10 backdrop-blur-2xl p-4 rounded-[1.5rem] text-white hover:bg-white/20 border border-white/10 transition-all z-20 shadow-2xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="max-w-2xl mx-auto px-6 -mt-32 relative space-y-12">
                <div className="space-y-8 bg-brand-dark/95 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-white/10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-yellow bg-brand-yellow/10 px-4 py-2 rounded-xl border border-brand-yellow/20">
                        {selectedArticle.category}
                      </span>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{selectedArticle.readTime} de leitura</span>
                    </div>

                    <h2 className="text-4xl font-black text-white leading-tight tracking-tighter">
                      {selectedArticle.title}
                    </h2>
                  </div>

                  <div className="prose max-w-none text-white leading-relaxed space-y-8 font-medium text-lg">
                    <p className="text-xl text-white font-black italic border-l-4 border-brand-yellow pl-6 py-2">"{selectedArticle.excerpt}"</p>

                    <div className="space-y-6 text-white/80">
                      {selectedArticle.content.split('. ').map((paragraph, i) => (
                        <p key={i}>{paragraph}.</p>
                      ))}
                    </div>

                    <div className="glass-card p-10 rounded-[3rem] border-white/10 bg-white/5 space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-yellow text-brand-dark rounded-2xl shadow-lg"><Flame className="w-6 h-6" /></div>
                        <h4 className="text-2xl font-black text-white">Diretriz Estratégica</h4>
                      </div>
                      <ul className="space-y-5">
                        <li className="flex gap-5 items-start">
                          <CheckCircle className="w-6 h-6 text-brand-yellow mt-1 flex-shrink-0" />
                          <span className="text-base font-bold text-white/70 italic">Esta notícia foi coletada de fontes oficiais do governo espanhol.</span>
                        </li>
                        <li className="flex gap-5 items-start">
                          <CheckCircle className="w-6 h-6 text-brand-yellow mt-1 flex-shrink-0" />
                          <span className="text-base font-bold text-white/70 italic">Mantenha-se atualizado para evitar atrasos em seu processo imigratório.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Guides;

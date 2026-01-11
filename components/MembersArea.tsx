
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  PlayCircle,
  Crown,
  X,
  Users,
  Video,
  CheckCircle,
  Files,
  ArrowRight,
  Info,
  ShieldCheck,
  ChevronRight,
  Bookmark,
  ChevronLeft,
  Fingerprint,
  MapPin,
  HelpCircle,
  Play,
  FileDown,
  Clock,
  User as UserIcon,
  Flame,
  MessageSquare,
  Send,
  Plus,
  FileText,
  BadgeCheck,
  GraduationCap,
  Scale,
  Sticker,
  ExternalLink,
  Link as LinkIcon,

  MessageCircle,
  Edit3,
  Save
} from 'lucide-react';
import { ContentProtection } from './ContentProtection';
import { CommunityPost as ICommunityPost, UserProfile } from '../types';

type Tab = 'Tutoriais' | 'Guias' | 'Comunidade';

interface Tutorial {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  thumbnail: string;
  youtubeId: string;
  category: string;
  description?: string;
}

// --- 1. CONTEÚDO ISOLADO: GUIA DO VISTO ---
import { ALL_GUIDES, GUIDE_THEMES, GuideTopic } from '../src/data/guides';
import {
  getTutorials,
  getCommunityPosts,
  createCommunityPost,
  getComments,
  createComment,
  deleteCommunityPost as deletePost,
  deleteComment,
  updateCommunityPost,
  toggleLike,
  getLikeStatus
} from '../lib/supabase';
import { useContentProtection } from '../hooks/useContentProtection';

const MembersArea: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Guias');
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<GuideTopic | null>(null);
  const [activeVideo, setActiveVideo] = useState<Tutorial | null>(null);

  useContentProtection(!!selectedGuide || !!activeVideo);

  const [profile] = useState<UserProfile>(() => {
    return JSON.parse(localStorage.getItem('nomad_profile') || '{}');
  });

  const [posts, setPosts] = useState<ICommunityPost[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommunityFilter, setActiveCommunityFilter] = useState<string>('Tudo');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Dica');
  const [editingPost, setEditingPost] = useState<ICommunityPost | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostCategory, setEditPostCategory] = useState('Dica');

  // State for expanded comments
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const toggleComments = (postId: string) => {
    setExpandedPostId(prev => prev === postId ? null : postId);
  };

  // Carregar dados iniciais
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [fetchedPosts, fetchedTutorials] = await Promise.all([
        getCommunityPosts(),
        getTutorials()
      ]);

      const mappedPosts: ICommunityPost[] = fetchedPosts.map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        userName: p.user_name,
        userAvatar: p.user_avatar,
        content: p.content,
        category: p.category,
        timestamp: new Date(p.created_at).toLocaleDateString(),
        likes: p.likes,
        comments: p.comments,
        isElite: p.is_elite
      }));

      setPosts(mappedPosts);

      const mappedTutorials: Tutorial[] = (fetchedTutorials || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        instructor: t.instructor,
        duration: t.duration,
        thumbnail: t.thumbnail,
        youtubeId: t.youtube_id, // Fix: Map snake_case to camelCase
        category: 'Geral', // Default or fetch if exists
        description: t.description
      }));
      setTutorials(mappedTutorials);
      setLoading(false);
    }
    loadData();
  }, []);

  const [isPremiumUser] = useState<boolean>(() => {
    return profile?.tier && profile?.tier !== 'free';
  });

  const getDrippingDays = (contentIsDripped: boolean): number | undefined => {
    if (!contentIsDripped || !profile?.subscribedAt) return undefined;

    const subDate = new Date(profile.subscribedAt);
    const now = new Date();
    const diffTime = now.getTime() - subDate.getTime();
    const daysSinceSub = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const daysRemaining = 7 - daysSinceSub;

    return daysRemaining > 0 ? daysRemaining : undefined;
  };

  const themeGuides = useMemo(() =>
    ALL_GUIDES.filter(g => g.themeId === activeThemeId),
    [activeThemeId]);

  const activeCategories = useMemo(() =>
    Array.from(new Set(themeGuides.map(g => g.category))),
    [themeGuides]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !profile) return;

    const postData = {
      userId: profile.id || 'anonymous',
      userName: profile.fullName || 'Membro Nomad',
      userAvatar: profile.avatarUrl || 'https://picsum.photos/seed/me/100',
      content: newPostContent,
      category: newPostCategory,
      isElite: (profile.tier && profile.tier !== 'free') || false
    };

    const result = await createCommunityPost(postData);

    if (result) {
      const newPost: ICommunityPost = {
        id: result.id,
        userId: result.user_id,
        userName: result.user_name,
        userAvatar: result.user_avatar,
        content: result.content,
        category: result.category,
        timestamp: 'Agora',
        likes: 0,
        comments: 0,
        isElite: result.is_elite
      };

      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setNewPostCategory('Dica');
      setIsCreatingPost(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editPostContent.trim() || !editingPost) return;

    const updated = await updateCommunityPost(editingPost.id, {
      content: editPostContent,
      category: editPostCategory
    });

    if (updated) {
      setPosts(posts.map(p => p.id === editingPost.id ? { ...p, content: editPostContent, category: editPostCategory } : p));
      setEditingPost(null);
      setEditPostContent('');
      setEditPostCategory('Dica');
    }
  };

  const openEditModal = (post: ICommunityPost) => {
    setEditingPost(post);
    setEditPostContent(post.content);
    setEditPostCategory(post.category);
  };

  // Helper para abreviar e renderizar links
  const renderItemWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        const href = part.startsWith('http') ? part : `https://${part}`;

        // Abreviação da URL para exibição
        let displayUrl = part.replace(/^https?:\/\//, '').replace(/^www\./, '');
        if (displayUrl.length > 30) {
          const domain = displayUrl.split('/')[0];
          displayUrl = `${domain}/...`;
        }

        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-yellow/10 text-brand-yellow hover:bg-brand-yellow hover:text-navy-950 rounded-lg font-black transition-all border border-brand-yellow/20 text-[11px] decoration-none"
          >
            {displayUrl} <ExternalLink className="w-2.5 h-2.5" />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <ContentProtection isPremium={isPremiumUser}>
      <div className="pb-32 space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-yellow/10 rounded-2xl flex items-center justify-center text-brand-yellow">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Hub Elite</h1>
                <p className="text-white/60 font-medium italic">Acesso exclusivo para membros.</p>
              </div>
            </div>
            {isPremiumUser && (
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 hover:bg-green-500 hover:text-white transition-all shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Suporte VIP</span>
              </a>
            )}
          </div>

          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
            {(['Guias', 'Tutoriais', 'Comunidade'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab !== 'Guias') setActiveThemeId(null);
                }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all z-10 ${activeTab === tab ? 'text-navy-950' : 'text-white/40'}`}
              >
                {tab}
              </button>
            ))}
            <motion.div
              initial={false}
              animate={{
                x: activeTab === 'Guias' ? '0%' : activeTab === 'Tutoriais' ? '100%' : '200%'
              }}
              className="absolute h-[calc(100%-8px)] w-[calc(33.33%-4px)] top-1 left-1 bg-brand-yellow rounded-xl shadow-lg"
            />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-brand-yellow/20 border-t-brand-yellow rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Sincronizando conteúdo...</p>
            </motion.div>
          ) : (
            <>
              {activeTab === 'Guias' && (
                <motion.div
                  key={activeThemeId ? `theme-${activeThemeId}` : 'selection-page'}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  {!activeThemeId ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 px-2">
                        <div className="w-1.5 h-6 bg-white rounded-full" />
                        <h2 className="text-sm font-black text-navy-50 uppercase tracking-[0.2em]">Biblioteca de Módulos</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {GUIDE_THEMES.map(theme => {
                          const Icon = theme.icon;
                          return (
                            <button
                              key={theme.id}
                              onClick={() => setActiveThemeId(theme.id)}
                              className="glass-card bg-navy-900/50 hover:bg-navy-900 border-white/5 hover:border-brand-yellow/20 rounded-[2rem] p-6 flex flex-col gap-6 group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-yellow/5 text-left h-full"
                            >
                              <div className="flex justify-between items-start w-full">
                                <div className="w-16 h-16 rounded-2xl bg-brand-yellow/10 text-brand-yellow flex items-center justify-center shadow-lg group-hover:bg-brand-yellow group-hover:text-navy-950 transition-all">
                                  <Icon className="w-8 h-8" />
                                </div>
                                <div className="p-2 bg-white/5 rounded-xl group-hover:bg-brand-yellow/20 transition-colors">
                                  <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-brand-yellow transition-colors" />
                                </div>
                              </div>

                              <div className="space-y-2 flex-1">
                                <h3 className="text-xl font-bold text-white group-hover:text-brand-yellow transition-colors">{theme.title}</h3>
                                <p className="text-sm text-blue-200/60 leading-relaxed line-clamp-2">{theme.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <button onClick={() => setActiveThemeId(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-yellow hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Voltar ao HUB
                      </button>
                      {activeCategories.map(cat => (
                        <div key={cat} className="space-y-4">
                          <h2 className="text-sm font-black text-navy-50 uppercase px-2">{cat}</h2>
                          {themeGuides.filter(g => g.category === cat).map(guide => (
                            <button key={guide.id} onClick={() => setSelectedGuide(guide)} className="glass-card rounded-[2rem] p-6 w-full text-left flex justify-between items-center group">
                              <div className="space-y-1">
                                <h3 className="font-black text-navy-50 group-hover:text-white">{guide.title}</h3>
                                <p className="text-[10px] text-navy-50/40 uppercase font-bold">{guide.description}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-navy-50/20 group-hover:text-navy-50" />
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'Tutoriais' && (
                <motion.div key="tutorials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-1.5 h-6 bg-white rounded-full" />
                    <h2 className="text-sm font-black text-navy-50 uppercase tracking-[0.2em]">Workshops de Preenchimento</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                    {tutorials.map(tutorial => (
                      <WorkshopCard
                        key={tutorial.id}
                        title={tutorial.title}
                        instructor={tutorial.instructor}
                        duration={tutorial.duration}
                        image={tutorial.thumbnail}
                        onClick={getDrippingDays(tutorial.is_dripped) ? undefined : () => setActiveVideo(tutorial)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'Comunidade' && (
                <motion.div key="community" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Community Filters */}
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {['Tudo', 'Dúvidas', 'Conquistas', 'Networking', 'Dicas'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveCommunityFilter(filter)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeCommunityFilter === filter
                          ? 'bg-brand-yellow text-navy-950'
                          : 'bg-white/5 text-white hover:bg-white/10'
                          }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 mb-8">
                    <button
                      onClick={() => setIsCreatingPost(true)}
                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 text-left transition-colors flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 bg-brand-yellow/10 rounded-full flex items-center justify-center text-brand-yellow group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-white/40 text-sm font-medium">Compartilhe sua jornada ou dúvida...</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {posts.filter(p => activeCommunityFilter === 'Tudo' || p.category === activeCommunityFilter).map((post, index) => (
                      <CommunityPostCard
                        key={post.id}
                        post={post}
                        currentUser={profile}
                        onCommentClick={toggleComments}
                        showComments={expandedPostId === post.id}
                        onEdit={() => openEditModal(post)}
                        onDelete={async (id) => {
                          if (window.confirm('Tem certeza que deseja excluir este post?')) {
                            setPosts(posts.filter(p => p.id !== id));
                            await deletePost(id);
                          }
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedGuide && (
            <div className="fixed inset-0 z-[1000] bg-navy-950/80 backdrop-blur-xl flex items-center justify-center p-6">
              <div className="w-full max-w-2xl">
                <ContentProtection
                  isPremium={isPremiumUser}
                  drippingDays={selectedGuide.category === 'Templates' ? getDrippingDays(true) : undefined}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card bg-realWhite rounded-[3rem] p-10 w-full max-h-[85vh] overflow-y-auto border-black/5 shadow-2xl space-y-8 no-scrollbar"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg">{selectedGuide.category}</span>
                        <h2 className="text-3xl font-black text-navy-50 tracking-tighter">{selectedGuide.title}</h2>
                      </div>
                      <button onClick={() => setSelectedGuide(null)} className="p-3 bg-brand-yellow rounded-2xl text-navy-950 hover:bg-white transition-all shadow-lg">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="space-y-10">
                      <section className="space-y-4">
                        <h4 className="text-xs font-black text-navy-50/30 uppercase tracking-[0.2em] flex items-center gap-2"><Info className="w-4 h-4 text-brand-yellow" /> Contexto Estratégico</h4>
                        <p className="text-lg text-navy-50 font-medium leading-relaxed italic border-l-3 border-brand-yellow pl-6 py-1">"{selectedGuide.content.context}"</p>
                      </section>
                      <div className="grid md:grid-cols-2 gap-10">
                        <section className="space-y-4">
                          <h4 className="text-xs font-black text-navy-50/30 uppercase tracking-[0.2em] flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-yellow" /> Requisitos</h4>
                          <ul className="space-y-3">
                            {selectedGuide.content.requirements.map((req, i) => (
                              <li key={i} className="flex gap-3 text-sm text-navy-50 font-bold items-start"><div className="w-1.5 h-1.5 bg-brand-yellow rounded-full mt-1.5 flex-shrink-0" /> <span className="flex-1">{renderItemWithLinks(req)}</span></li>
                            ))}
                          </ul>
                        </section>
                        <section className="space-y-4">
                          <h4 className="text-xs font-black text-navy-50/30 uppercase tracking-[0.2em] flex items-center gap-2"><ArrowRight className="w-4 h-4 text-brand-yellow" /> Plano de Ação</h4>
                          <ul className="space-y-3">
                            {selectedGuide.content.steps.map((step, i) => (
                              <li key={i} className="flex gap-4 text-sm text-navy-50/60 font-medium items-start"><span className="text-[10px] font-black text-white bg-black/5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0">{i + 1}</span> <span className="flex-1">{renderItemWithLinks(step)}</span></li>
                            ))}
                          </ul>
                        </section>
                      </div>
                      {selectedGuide.content.important && (
                        <div className="p-8 bg-brand-yellow/5 border-2 border-dashed border-brand-yellow/20 rounded-[2.5rem] flex gap-5">
                          <Bookmark className="w-8 h-8 text-brand-yellow flex-shrink-0 mt-1" />
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">Nota Importante</p>
                            <p className="text-sm text-navy-50 font-bold italic leading-relaxed">{renderItemWithLinks(selectedGuide.content.important)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </ContentProtection>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL DO PLAYER DE VÍDEO */}
        <AnimatePresence>
          {activeVideo && (
            <div className="fixed inset-0 z-[1500] bg-navy-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
              <div className="w-full max-w-4xl">
                <ContentProtection
                  isPremium={isPremiumUser}
                  drippingDays={getDrippingDays(activeVideo.is_dripped)}
                >
                  <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl relative border border-white/10">
                    <button
                      onClick={() => setActiveVideo(null)}
                      className="absolute top-6 right-6 bg-navy-950/60 backdrop-blur-md p-4 rounded-2xl text-white hover:bg-brand-yellow hover:text-navy-950 transition-all z-10"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    {(() => {
                      const rawId = activeVideo.youtube_id || '';
                      let tempId = rawId;
                      try {
                        if (rawId.includes('http') || rawId.includes('youtube') || rawId.includes('youtu.be')) {
                          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                          const match = rawId.match(regExp);
                          if (match && match[2].length === 11) {
                            tempId = match[2];
                          }
                        }
                      } catch (e) { console.warn('Error parsing video ID', e); }

                      return (
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${tempId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&controls=1&showinfo=0`}
                          title={activeVideo.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      );
                    })()}
                  </div>
                </ContentProtection>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL CRIAÇÃO POST */}
        <AnimatePresence>
          {isCreatingPost && (
            <div className="fixed inset-0 z-[1000] bg-navy-950/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card bg-realWhite rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 w-full max-w-lg border-black/5 shadow-2xl space-y-6 md:space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-black text-navy-50 tracking-tighter">Novo Post na Elite</h2>
                  <button onClick={() => setIsCreatingPost(false)} className="text-navy-50/20 hover:text-navy-50">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Categoria</label>
                    <div className="flex flex-wrap gap-2">
                      {['Dica', 'Networking', 'Dúvidas', 'Conquistas'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setNewPostCategory(cat)}
                          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all ${newPostCategory === cat
                            ? 'bg-brand-yellow text-navy-950'
                            : 'bg-white/5 text-white hover:bg-white/10'
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Compartilhe seu insight com a comunidade..."
                    className="w-full h-32 md:h-40 bg-black/5 border border-black/5 rounded-2xl p-4 md:p-6 text-sm md:text-base text-navy-50 font-medium focus:outline-none focus:border-white transition-all resize-none"
                  />
                  <button
                    onClick={handleCreatePost}
                    className="w-full py-4 md:py-5 bg-white text-navy-950 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-all"
                  >
                    Publicar Agora <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL EDIÇÃO POST */}
        <AnimatePresence>
          {editingPost && (
            <div className="fixed inset-0 z-[1000] bg-navy-950/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card bg-realWhite rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 w-full max-w-lg border-black/5 shadow-2xl space-y-6 md:space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-black text-navy-50 tracking-tighter">Editar Post</h2>
                  <button onClick={() => setEditingPost(null)} className="text-navy-50/20 hover:text-navy-50">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Categoria</label>
                    <div className="flex flex-wrap gap-2">
                      {['Dica', 'Networking', 'Dúvidas', 'Conquistas'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setEditPostCategory(cat)}
                          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all ${editPostCategory === cat
                            ? 'bg-brand-yellow text-navy-950'
                            : 'bg-white/5 text-white hover:bg-white/10'
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    placeholder="Seu conteúdo..."
                    className="w-full h-32 md:h-40 bg-black/5 border border-black/5 rounded-2xl p-4 md:p-6 text-sm md:text-base text-navy-50 font-medium focus:outline-none focus:border-white transition-all resize-none"
                  />
                  <button
                    onClick={handleUpdatePost}
                    className="w-full py-4 md:py-5 bg-brand-yellow text-navy-950 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-all"
                  >
                    Salvar Alterações <Save className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div >
    </ContentProtection >
  );
};

export default MembersArea;

// Sub-components used in MembersArea
const WorkshopCard = ({ title, instructor, duration, image, onClick }: any) => (
  <button
    onClick={onClick}
    className="glass-card bg-navy-900/40 hover:bg-navy-900 border-white/5 hover:border-brand-yellow/20 rounded-[2.5rem] overflow-hidden cursor-pointer group relative flex flex-col h-full shadow-lg hover:shadow-2xl hover:shadow-brand-yellow/5 transition-all duration-500 hover:-translate-y-2"
  >
    <div className="relative h-56 flex-shrink-0 overflow-hidden w-full">
      <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={title} />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent opacity-90" />

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300">
          <PlayCircle className="w-8 h-8 text-navy-950 fill-navy-950" />
        </div>
      </div>

      <div className="absolute top-5 left-5 z-20">
        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/10 bg-navy-950/40 backdrop-blur-md text-white shadow-lg flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-brand-yellow" />
          {duration}
        </span>
      </div>
    </div>

    <div className="p-7 flex flex-col flex-1 relative text-left">
      {/* Decorative line */}
      <div className="absolute top-0 left-7 right-7 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
          <UserIcon className="w-3 h-3 text-brand-yellow/50" />
          {instructor}
        </div>
        <h3 className="text-xl font-black text-white leading-tight group-hover:text-brand-yellow transition-colors line-clamp-2">{title}</h3>
      </div>

      <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center gap-4">
        {onClick ? (
          <>
            <span className="text-[10px] font-black text-brand-yellow uppercase tracking-widest group-hover:text-white transition-colors">
              Assistir Aula
            </span>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-brand-yellow group-hover:text-navy-950 transition-all shadow-lg">
              <Play className="w-5 h-5 ml-0.5" />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-[10px] font-black text-orange-400 uppercase tracking-widest animate-pulse">
            <Clock className="w-3 h-3" /> Liberado em Breve
          </div>
        )}
      </div>
    </div>
  </button>
);

interface CommunityPostProps {
  post: ICommunityPost;
  currentUser: UserProfile;
  onCommentClick: (id: string) => void;
  showComments: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const CommunityPostCard: React.FC<CommunityPostProps> = ({ post, currentUser, onCommentClick, showComments, onDelete, onEdit }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  React.useEffect(() => {
    if (showComments) {
      setLoadingComments(true);
      getComments(post.id).then((data: any[]) => {
        if (data) setComments(data);
        setLoadingComments(false);
      });
    }
  }, [showComments, post.id]);

  React.useEffect(() => {
    if (currentUser.id) {
      getLikeStatus(post.id, currentUser.id).then(status => setIsLiked(status));
    }
  }, [post.id, currentUser.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      post_id: post.id,
      user_id: currentUser.id || 'anon',
      user_name: currentUser.fullName || 'Usuário',
      user_avatar: currentUser.avatarUrl || 'https://picsum.photos/50',
      content: commentText
    };

    // Optimistic update
    const tempId = Math.random().toString();
    setComments([...comments, { ...newComment, id: tempId, created_at: new Date().toISOString() }]);
    setCommentText('');

    await createComment(newComment);
    // Refresh real data
    const data = await getComments(post.id);
    if (data) setComments(data);
  };

  const handleDeleteComment = async (commentId: string) => {
    // Optimistic delete
    setComments(comments.filter(c => c.id !== commentId));
    await deleteComment(commentId, post.id);
  };

  const isAuthor = currentUser.id === post.userId;

  return (
    <div className="bg-navy-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-navy-950 font-bold ${post.isElite ? 'bg-gradient-to-br from-brand-yellow to-yellow-600 ring-2 ring-brand-yellow/30' : 'bg-white'}`}>
            {post.userAvatar ? <img src={post.userAvatar} className="w-full h-full rounded-full object-cover" /> : <UserIcon className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              {post.userName}
              {post.isElite && <span className="bg-brand-yellow/20 text-brand-yellow text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">Elite Member</span>}
            </h4>
            <span className="text-white/40 text-xs">{post.timestamp} • {post.category}</span>
          </div>
        </div>
        <div className="flex gap-1">
          {isAuthor && onEdit && (
            <button
              onClick={() => onEdit(post.id)}
              className="text-white/20 hover:text-white transition-colors p-2"
              title="Editar post"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {isAuthor && onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-white/20 hover:text-red-400 transition-colors p-2"
              title="Excluir post"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-blue-100 text-sm leading-relaxed mb-6">
        {post.content}
      </p>

      <div className="flex items-center gap-6 border-t border-white/5 pt-4">
        <button
          onClick={async () => {
            if (!currentUser.id) return;

            // Optimistic Update
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

            const result = await toggleLike(post.id, currentUser.id);

            // Sync with server result if available
            if (result) {
              setLikeCount(result.count);
              setIsLiked(result.liked);
            }
          }}
          className={`flex items-center gap-2 transition-colors group ${isLiked ? 'text-brand-yellow' : 'text-white/40 hover:text-brand-yellow'}`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${isLiked ? 'bg-brand-yellow/20' : 'group-hover:bg-brand-yellow/10'}`}>
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">{likeCount} Curtidas</span>
        </button>

        <button onClick={() => onCommentClick(post.id)} className="flex items-center gap-2 text-white/40 hover:text-blue-300 transition-colors group">
          <div className="p-1.5 rounded-full group-hover:bg-blue-400/10 transition-colors">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">{post.comments || 0} Comentários</span>
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              {loadingComments ? (
                <p className="text-xs text-white/30 text-center">Carregando...</p>
              ) : comments.map((comment, idx) => (
                <div key={idx} className="flex gap-3 group/comment">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 overflow-hidden">
                    <img src={comment.user_avatar} className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-black/20 rounded-2xl p-3 flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-white font-bold text-xs mb-1">{comment.user_name}</p>
                      {currentUser.id === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-white/10 hover:text-red-400 opacity-0 group-hover/comment:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-white/70 text-xs">{comment.content}</p>
                  </div>
                </div>
              ))}

              <form onSubmit={handleSubmit} className="relative flex items-center gap-2 mt-4">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escreva uma resposta..."
                  className="w-full bg-white/5 border border-white/5 rounded-full px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow/50 transition-colors"
                />
                <button type="submit" disabled={!commentText.trim()} className="absolute right-1 p-1.5 bg-brand-yellow text-navy-950 rounded-full disabled:opacity-50 hover:scale-105 transition-all">
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

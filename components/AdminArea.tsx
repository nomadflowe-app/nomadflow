import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Plus,
    Trash2,
    Edit3,
    Save,
    X,
    Newspaper,
    Video,
    MessageSquare,
    AlertCircle,
    Handshake,
    User,
    Mail,
    Phone,
    Clock
} from 'lucide-react';
import {
    getGuides,
    getTutorials,
    getCommunityPosts,
    deleteGuide,
    deleteTutorial,
    deleteCommunityPost,
    updateGuide,
    createGuide,
    createTutorial,
    updateTutorial,
    getPartners,
    createPartner,
    updatePartner,
    deletePartner,
    createNotification,
    getQuizLeads,
    getQuizStats
} from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { SystemStatus } from './SystemStatus';

type AdminTab = 'Notícias' | 'Tutoriais' | 'Comunidade' | 'Parceiros' | 'Notificações' | 'Leads';

export const AdminArea: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<AdminTab>('Notícias');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSystemStatusOpen, setIsSystemStatusOpen] = useState(false);
    const [quizStats, setQuizStats] = useState<any>(null);

    // Form States
    const [formData, setFormData] = useState<any>({
        title: '',
        category: '',
        excerpt: '',
        content: '',
        thumbnail: '',
        read_time: '5 min',
        is_premium: false,
        instructor: '',
        duration: '',
        video_url: '',
        whatsapp: '',
        site_url: '',
        discount_code: '',
        is_exclusive: false,
        is_dripped: false,
        notification_type: 'info',
        action_url: ''
    });

    const extractYoutubeId = (url: string) => {
        if (!url) return '';

        // Handle full URLs
        /* 
          Supported formats:
          - https://www.youtube.com/watch?v=VIDEO_ID
          - https://youtube.com/watch?v=VIDEO_ID
          - https://youtu.be/VIDEO_ID
          - VIDEO_ID (fallback)
        */
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        return (match && match[2].length === 11) ? match[2] : url;
    };

    // Carregar dados conforme a aba
    useEffect(() => {
        loadData();
    }, [activeTab]);

    async function loadData() {
        setLoading(true);
        let result: any[] = [];
        if (activeTab === 'Notícias') result = await getGuides();
        else if (activeTab === 'Tutoriais') result = await getTutorials();
        else if (activeTab === 'Comunidade') result = await getCommunityPosts();
        else if (activeTab === 'Parceiros') result = await getPartners();
        else if (activeTab === 'Leads') {
            const [leads, stats] = await Promise.all([getQuizLeads(), getQuizStats()]);
            result = leads;
            setQuizStats(stats);
        }
        setData(result);
        setLoading(false);
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este item?')) return;

        let success = false;
        if (activeTab === 'Notícias') success = await deleteGuide(id);
        else if (activeTab === 'Tutoriais') success = await deleteTutorial(id);
        else if (activeTab === 'Comunidade') success = await deleteCommunityPost(id);
        else if (activeTab === 'Parceiros') success = await deletePartner(id);

        if (success) {
            showToast('Item removido com sucesso!', 'success');
            loadData();
        }
    };


    const handleEdit = (item: any) => {
        setEditingId(item.id);

        if (activeTab === 'Notícias') {
            setFormData({
                title: item.title,
                category: item.category,
                excerpt: item.excerpt,
                content: item.content,
                thumbnail: item.thumbnail,
                read_time: item.read_time,
                is_premium: item.is_premium
            });
        } else if (activeTab === 'Tutoriais') {
            setFormData({
                title: item.title,
                instructor: item.instructor,
                duration: item.duration,
                thumbnail: item.thumbnail,
                video_url: item.youtube_id, // Mapeia do banco para o form
                is_dripped: item.is_dripped || false
            });
        } else if (activeTab === 'Parceiros') {
            setFormData({
                title: item.name,
                category: item.category,
                content: item.description,
                thumbnail: item.logo_url,
                whatsapp: item.whatsapp,
                site_url: item.site_url,
                discount_code: item.discount_code,
                is_exclusive: item.is_exclusive
            });
        }

        setIsCreating(true);
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleCreate = async () => {
        if (!formData.title) {
            showToast('O nome/título é obrigatório!', 'error');
            return;
        }

        if (activeTab === 'Tutoriais' && !formData.video_url) {
            showToast('A URL do vídeo é obrigatória!', 'error');
            return;
        }

        setIsSaving(true);
        try {
            let success = false;

            // --- NOTIFICAÇÕES (CRIAÇÃO APENAS) ---
            if (activeTab === 'Notificações') {
                const result = await createNotification({
                    title: formData.title,
                    message: formData.content, // Usando content como message
                    type: formData.notification_type,
                    action_url: formData.action_url
                });
                success = !!result;
                if (success) {
                    showToast('Notificação enviada para todos os usuários!', 'success');
                    setIsCreating(false);
                    setFormData({ ...formData, title: '', content: '', action_url: '' });
                } else {
                    showToast('Erro ao enviar notificação.', 'error');
                }
                setIsSaving(false);
                return;
            }

            // --- EDIÇÃO ---
            if (editingId) {
                if (activeTab === 'Notícias') {
                    const result = await updateGuide(editingId, {
                        title: formData.title,
                        category: formData.category,
                        excerpt: formData.excerpt,
                        content: formData.content,
                        thumbnail: formData.thumbnail,
                        read_time: formData.read_time,
                        is_premium: formData.is_premium
                    });
                    success = !!result;
                } else if (activeTab === 'Tutoriais') {
                    const videoId = extractYoutubeId(formData.video_url);
                    const result = await updateTutorial(editingId, {
                        title: formData.title,
                        instructor: formData.instructor,
                        duration: formData.duration,
                        thumbnail: formData.thumbnail,
                        video_url: videoId,
                        isDripped: formData.is_dripped
                    });
                    success = !!result;
                } else if (activeTab === 'Parceiros') {
                    const result = await updatePartner(editingId, {
                        name: formData.title,
                        category: formData.category,
                        description: formData.content,
                        logo_url: formData.thumbnail,
                        whatsapp: formData.whatsapp,
                        site_url: formData.site_url,
                        discount_code: formData.discount_code,
                        is_exclusive: formData.is_exclusive
                    });
                    success = !!result;
                }

                if (success) {
                    showToast('Atualizado com sucesso!', 'success');
                    setIsCreating(false);
                    setEditingId(null); // Limpa o estado de edição
                    setFormData({ title: '', category: '', excerpt: '', content: '', thumbnail: '', read_time: '5 min', is_premium: false, instructor: '', duration: '', video_url: '', whatsapp: '', site_url: '', discount_code: '', is_exclusive: false });
                    loadData();
                } else {
                    showToast('Erro ao atualizar.', 'error');
                }
                return; // Encerra aqui se for edição
            }

            // --- CRIAÇÃO ---
            if (activeTab === 'Notícias') {
                const result = await createGuide({
                    title: formData.title,
                    category: formData.category || 'Geral',
                    excerpt: formData.excerpt || '',
                    content: formData.content || '',
                    thumbnail: formData.thumbnail || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800',
                    read_time: formData.read_time,
                    is_premium: formData.is_premium
                });
                success = !!result;
            } else if (activeTab === 'Tutoriais') {
                const videoId = extractYoutubeId(formData.video_url);
                const result = await createTutorial({
                    title: formData.title,
                    instructor: formData.instructor || 'NomadFlow Team',
                    duration: formData.duration || '10 min',
                    thumbnail: formData.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
                    video_url: videoId,
                    isDripped: formData.is_dripped
                });
                success = !!result;
            } else if (activeTab === 'Parceiros') {
                const result = await createPartner({
                    name: formData.title,
                    category: formData.category || 'Geral',
                    description: formData.content,
                    logo_url: formData.thumbnail,
                    whatsapp: formData.whatsapp,
                    site_url: formData.site_url,
                    discount_code: formData.discount_code,
                    is_exclusive: formData.is_exclusive
                });
                success = !!result;
            }

            if (success) {
                showToast('Criado com sucesso!', 'success');
                setIsCreating(false);
                setFormData({ title: '', category: '', excerpt: '', content: '', thumbnail: '', read_time: '5 min', is_premium: false, instructor: '', duration: '', video_url: '', whatsapp: '', site_url: '', discount_code: '', is_exclusive: false });
                loadData();
            } else {
                showToast('Erro ao criar. Verifique sua conexão ou se você tem permissão de admin.', 'error');
            }
        } catch (error) {
            console.error("Erro na criação:", error);
            showToast('Erro inesperado ao criar.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-32 uppercase-none">
            <header className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Painel Admin</h1>
                        <p className="text-white/60 font-medium italic text-sm">Gerenciamento central do NomadFlow.</p>
                    </div>
                    <div className="flex gap-2">
                        {activeTab !== 'Comunidade' && (
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ title: '', category: '', excerpt: '', content: '', thumbnail: '', read_time: '5 min', is_premium: false, instructor: '', duration: '', video_url: '', whatsapp: '', site_url: '', discount_code: '', is_exclusive: false });
                                    setIsCreating(true);
                                }}
                                className="p-3 bg-brand-yellow rounded-2xl text-navy-950 hover:bg-white transition-all shadow-lg active:scale-90"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        )}
                        <button
                            onClick={() => setIsSystemStatusOpen(true)}
                            className="p-3 bg-white/10 rounded-2xl text-white border border-white/20 hover:bg-white hover:text-navy-950 transition-all"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'Notícias', icon: <Newspaper className="w-4 h-4" /> },
                        { id: 'Tutoriais', icon: <Video className="w-4 h-4" /> },
                        { id: 'Parceiros', icon: <Handshake className="w-4 h-4" /> },
                        { id: 'Comunidade', icon: <MessageSquare className="w-4 h-4" /> },
                        { id: 'Leads', icon: <User className="w-4 h-4 text-green-400" /> },
                        { id: 'Notificações', icon: <MessageSquare className="w-4 h-4 text-brand-yellow" /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as AdminTab)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 flex-shrink-0 ${activeTab === tab.id
                                ? 'bg-white text-navy-950 border-white shadow-xl'
                                : 'bg-navy-900/50 text-white/40 border-white/5 hover:bg-white/5'
                                }`}
                        >
                            {tab.icon}
                            {tab.id}
                        </button>
                    ))}
                </div>
            </header>

            <div className="space-y-4">
                {activeTab === 'Notificações' ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ title: '', content: '', notification_type: 'info', action_url: '' });
                                setIsCreating(true);
                            }}
                            className="bg-brand-yellow text-navy-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Nova Notificação
                        </button>
                        <p className="text-white/40 text-xs">As notificações enviadas não aparecem nesta lista (apenas no banco).</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20 gap-4"
                            >
                                <div className="w-10 h-10 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
                                <p className="text-white/40 font-black uppercase text-[10px] tracking-widest">Carregando painel...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid gap-4"
                            >
                                {activeTab === 'Leads' && quizStats && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase text-white/40 mb-1">Iniciados</p>
                                            <p className="text-2xl font-black text-white">{quizStats.started}</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase text-white/40 mb-1">Finalizados</p>
                                            <p className="text-2xl font-black text-white">{quizStats.completed}</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase text-white/40 mb-1">Conversão</p>
                                            <p className="text-2xl font-black text-brand-yellow">{quizStats.conversionRate.toFixed(1)}%</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase text-white/40 mb-1">Elegíveis (A)</p>
                                            <p className="text-2xl font-black text-green-400">{quizStats.results.A}</p>
                                        </div>
                                    </div>
                                )}

                                {data.map(item => (
                                    <div
                                        key={item.id}
                                        className="glass-card p-6 rounded-[2rem] border-white/5 bg-white/5 flex justify-between items-center group hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                                    >
                                        {activeTab === 'Leads' ? (
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${item.status === 'completed' ? 'bg-green-400/10 text-green-400' : 'bg-white/10 text-white/40'
                                                        }`}>
                                                        {item.status === 'completed' ? 'Finalizado' : 'Iniciado (Abandono)'}
                                                    </span>
                                                    {item.result && (
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${item.result === 'A' ? 'bg-green-400/10 text-green-400' :
                                                            item.result === 'B' ? 'bg-amber-400/10 text-amber-400' :
                                                                'bg-red-400/10 text-red-400'
                                                            }`}>
                                                            Resultado {item.result}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-white font-bold">{item.name}</h3>
                                                <div className="flex flex-wrap gap-4 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {item.email}</span>
                                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-yellow bg-brand-yellow/10 px-2 py-0.5 rounded-md">
                                                        {item.category || item.instructor || (item.name ? 'Parceiro' : 'Geral')}
                                                    </span>
                                                    {activeTab === 'Comunidade' && item.is_elite && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md">
                                                            Elite
                                                        </span>
                                                    )}
                                                    {activeTab === 'Tutoriais' && item.is_dripped && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-md">
                                                            7 Dias (Drip)
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-white font-bold leading-tight">{item.title || item.user_name || item.name}</h3>
                                                <p className="text-white/40 text-xs line-clamp-1 italic">
                                                    {item.excerpt || item.content || item.description || 'Sem descrição'}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            {activeTab === 'Leads' ? (
                                                <a
                                                    href={`https://wa.me/${item.phone.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all border border-green-500/20"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </a>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    {activeTab !== 'Comunidade' && (
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-3 bg-white/10 text-white rounded-xl hover:bg-white hover:text-navy-950 transition-all border border-white/20"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {data.length === 0 && (
                                    <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                                        <p className="text-white/20 font-black uppercase text-xs tracking-widest">Nenhum registro encontrado</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* MODAL DE CRIAÇÃO */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[1000] bg-navy-950/80 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-card bg-[#0a0f1d] rounded-[3rem] p-8 w-full max-w-xl border-white/10 shadow-2xl space-y-6 my-auto"
                        >


                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-white tracking-tight">
                                    {editingId ? 'Editar' : 'Adicionar'} {activeTab === 'Notícias' ? 'Notícia/Guia' : activeTab === 'Parceiros' ? 'Parceiro' : 'Tutorial'}
                                </h2>
                                <button onClick={() => { setIsCreating(false); setEditingId(null); }} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">
                                        {activeTab === 'Parceiros' ? 'Nome da Empresa' : activeTab === 'Notificações' ? 'Título da Notificação' : 'Título'}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                        placeholder="Título..."
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                {activeTab === 'Notificações' ? (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Mensagem</label>
                                            <textarea
                                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                placeholder="Escreva sua mensagem curta aqui..."
                                                rows={3}
                                                maxLength={200}
                                                value={formData.content}
                                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Tipo</label>
                                                <select
                                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                    value={formData.notification_type}
                                                    onChange={e => setFormData({ ...formData, notification_type: e.target.value })}
                                                >
                                                    <option value="info" className="bg-navy-900">Informação (Amarelo)</option>
                                                    <option value="news" className="bg-navy-900">Novidade (Azul)</option>
                                                    <option value="warning" className="bg-navy-900">Alerta (Vermelho)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Link de Ação (Opcional)</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                    placeholder="https://..."
                                                    value={formData.action_url}
                                                    onChange={e => setFormData({ ...formData, action_url: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : activeTab === 'Notícias' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Categoria</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                    placeholder="Ex: Urgente, Visto..."
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Tempo de Leitura</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                    placeholder="5 min"
                                                    value={formData.read_time}
                                                    onChange={e => setFormData({ ...formData, read_time: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Resumo (Excerpt)</label>
                                            <textarea
                                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                placeholder="Uma frase curta..."
                                                rows={2}
                                                value={formData.excerpt}
                                                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Conteúdo Completo</label>
                                            <textarea
                                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                placeholder="O texto principal aqui..."
                                                rows={4}
                                                value={formData.content}
                                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            />
                                        </div>
                                    </>
                                ) : activeTab === 'Parceiros' ? (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Categoria</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                placeholder="Vistos, Financeiro, Moradia..."
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Whatsapp</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                    placeholder="5511999999999"
                                                    value={formData.whatsapp}
                                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Site URL</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                    placeholder="https://..."
                                                    value={formData.site_url}
                                                    onChange={e => setFormData({ ...formData, site_url: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Cupom</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                    placeholder="NOMAD10"
                                                    value={formData.discount_code}
                                                    onChange={e => setFormData({ ...formData, discount_code: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 px-2 pt-6">
                                                <input
                                                    type="checkbox"
                                                    id="exclusive"
                                                    className="w-5 h-5 rounded-md border-white/10 bg-white/5 checked:bg-brand-yellow"
                                                    checked={formData.is_exclusive}
                                                    onChange={e => setFormData({ ...formData, is_exclusive: e.target.checked })}
                                                />
                                                <label htmlFor="exclusive" className="text-xs font-bold text-white cursor-pointer select-none">É Exclusivo?</label>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Descrição da Oferta</label>
                                            <textarea
                                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                placeholder="Descreva o benefício..."
                                                rows={4}
                                                value={formData.content}
                                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Instrutor</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                    placeholder="Nome do especialista..."
                                                    value={formData.instructor}
                                                    onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Duração</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                    placeholder="15 min"
                                                    value={formData.duration}
                                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Link do Vídeo (YouTube)</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                placeholder="Ex: https://youtu.be/..."
                                                value={formData.video_url}
                                                onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 px-2">
                                            <input
                                                type="checkbox"
                                                id="dripped"
                                                className="w-5 h-5 rounded-md border-white/10 bg-white/5 checked:bg-orange-500"
                                                checked={formData.is_dripped}
                                                onChange={e => setFormData({ ...formData, is_dripped: e.target.checked })}
                                            />
                                            <label htmlFor="dripped" className="text-xs font-bold text-white cursor-pointer select-none">Liberação após 7 dias? (Dripping)</label>
                                        </div>
                                    </>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">{activeTab === 'Parceiros' ? 'URL do Logo' : 'URL da Imagem (Thumbnail)'}</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                        placeholder="https://images.unsplash.com/..."
                                        value={formData.thumbnail}
                                        onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                                    />
                                </div>

                                <button
                                    onClick={handleCreate}
                                    disabled={isSaving}
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${isSaving
                                        ? 'bg-white/20 text-white/40 cursor-not-allowed'
                                        : 'bg-brand-yellow text-navy-950 hover:bg-white shadow-brand-yellow/10'
                                        }`}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-navy-950/20 border-t-navy-950 rounded-full animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>

                                            <Save className="w-5 h-5" />
                                            {activeTab === 'Notificações' ? 'Enviar Notificação' : editingId ? 'Salvar Alterações' : 'Salvar Conteúdo'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="p-6 rounded-[2rem] bg-brand-yellow/10 border border-brand-yellow/20 space-y-4">
                <div className="flex items-center gap-3 text-brand-yellow">
                    <AlertCircle className="w-5 h-5" />
                    <h4 className="font-black uppercase text-xs tracking-widest">Atenção Moderador</h4>
                </div>
                <p className="text-white/60 text-xs font-medium leading-relaxed">
                    As alterações feitas aqui refletem instantaneamente no aplicativo de todos os usuários.
                    Agora você pode adicionar e remover conteúdos diretamente por este painel.
                </p>
            </div>


            <SystemStatus isOpen={isSystemStatusOpen} onClose={() => setIsSystemStatusOpen(false)} />
        </div >
    );
};

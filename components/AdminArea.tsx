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
    Clock,
    Eye,
    GraduationCap,
    Calendar as CalendarIcon,
    Loader2
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
    getQuizStats,
    adminGetAllSlots,
    adminGetBookings,
    adminCreateSlot,
    adminCreateBulkSlots,
    adminDeleteSlot,
    adminDeleteAllUnbookedSlots,
    adminRescheduleBooking
} from '../lib/supabase';
import { QUESTIONS } from './QuizQuestions';
import { useToast } from '../context/ToastContext';
import { SystemStatus } from './SystemStatus';
import SpanishTeacherPortal from './SpanishTeacherPortal';

type AdminTab = 'Notícias' | 'Tutoriais' | 'Comunidade' | 'Parceiros' | 'Notificações' | 'Leads' | 'Agendamentos'; // | 'Professor';

/** Generates bulk time slots from config, treating times as Europe/Madrid */
function generateBulkSlots(config: {
    startDate: string;
    endDate: string;
    days: number[];
    startHour: string;
    endHour: string;
    meetingDuration: number;
    breakTime: number;
    price: number;
}) {
    const HOST_TZ = 'Europe/Madrid';
    const slots: { start_time: string; end_time: string; price: number }[] = [];

    /**
     * Convert a "YYYY-MM-DD HH:MM" string in Madrid time to a UTC Date.
     * We do this by building a Date in that locale using Intl tricks.
     */
    function madridToUtc(dateStr: string, timeStr: string): Date {
        // Build an ISO-like string and parse it, then correct the offset
        // Best approach: use temporal-polyfill-free method via formatting trick
        // We create a moment at midnight UTC for that date, then shift by Madrid offset
        const [h, m] = timeStr.split(':').map(Number);

        // Get Madrid offset in minutes for that date
        const tempUtcMidnight = new Date(`${dateStr}T12:00:00Z`); // noon UTC
        const madridFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: HOST_TZ,
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
        });
        const parts = madridFormatter.formatToParts(tempUtcMidnight);
        const madridHour = parseInt(parts.find(p => p.type === 'hour')!.value);
        const madridMin = parseInt(parts.find(p => p.type === 'minute')!.value);
        // offset = madridLocalHour - 12 (since we used noon UTC)
        const offsetMinutes = (madridHour - 12) * 60 + madridMin;

        // Build UTC midnight for the date
        const utcMidnight = new Date(`${dateStr}T00:00:00Z`);
        // Madrid midnight = UTC midnight - offsetMinutes
        const madridMidnightUtc = new Date(utcMidnight.getTime() - offsetMinutes * 60000);
        // Add the desired hour:minute
        return new Date(madridMidnightUtc.getTime() + (h * 60 + m) * 60000);
    }

    const slotBlock = config.meetingDuration + config.breakTime; // total block per meeting

    const startD = new Date(`${config.startDate}T12:00:00Z`);
    const endD = new Date(`${config.endDate}T12:00:00Z`);

    const cursor = new Date(startD);
    while (cursor <= endD) {
        const dateStr = cursor.toISOString().split('T')[0];
        // Find the weekday in Madrid timezone for this date
        const madridWeekday = parseInt(
            new Intl.DateTimeFormat('en-US', { timeZone: HOST_TZ, weekday: 'long' })
                .formatToParts(cursor)
                .find(p => p.type === 'weekday')!.value === 'Sunday' ? '0' :
            new Intl.DateTimeFormat('en-US', { timeZone: HOST_TZ, weekday: 'narrow' })
                .format(cursor) === 'M' ? '1' :
            // Fallback: use JS day-of-week in Madrid
            String(new Date(cursor.toLocaleString('en-US', { timeZone: HOST_TZ })).getDay())
        );

        if (config.days.includes(Number(madridWeekday))) {
            const dayStartUtc = madridToUtc(dateStr, config.startHour);
            const dayEndUtc = madridToUtc(dateStr, config.endHour);

            let slotStart = new Date(dayStartUtc);
            while (true) {
                const slotEnd = new Date(slotStart.getTime() + config.meetingDuration * 60000);
                if (slotEnd > dayEndUtc) break;
                slots.push({
                    start_time: slotStart.toISOString(),
                    end_time: slotEnd.toISOString(),
                    price: config.price
                });
                slotStart = new Date(slotStart.getTime() + slotBlock * 60000);
            }
        }
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return slots;
}

export const AdminArea: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<AdminTab>('Notícias');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSystemStatusOpen, setIsSystemStatusOpen] = useState(false);
    const [quizStats, setQuizStats] = useState<any>(null);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showRawLead, setShowRawLead] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'started'>('all');
    const [onlyWithResult, setOnlyWithResult] = useState(false);
    const [isBulkGenerating, setIsBulkGenerating] = useState(false);
    const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
    const [rescheduleSlotId, setRescheduleSlotId] = useState<string>('');
    const [bulkConfig, setBulkConfig] = useState({
        startDate: '',
        endDate: '',
        days: [1, 2, 3, 4, 5] as number[], // Mon-Fri by default
        startHour: '09:00',
        endHour: '18:00',
        meetingDuration: 90, // minutes
        breakTime: 15, // minutes
        price: 197
    });

    const filteredData = Array.isArray(data) ? data.filter(item => {
        if (activeTab !== 'Leads') return true;

        // Search Filter
        const query = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || (
            (item.name && item.name.toLowerCase().includes(query)) ||
            (item.email && item.email.toLowerCase().includes(query)) ||
            (item.phone && item.phone.toLowerCase().includes(query))
        );

        if (!matchesSearch) return false;

        // Status Filter
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;

        // Results Filter
        if (onlyWithResult && !item.result) return false;

        return true;
    }) : [];

    const getQuestionText = (q: any, answers: any[]) => {
        if (typeof q.question === 'function') {
            return q.id === 'salary' ? 'Renda Mensal Aproximada' : 'Questão Condicional';
        }
        return q.question;
    };

    const getAnswerText = (questionId: string, answerValue: string) => {
        const question = QUESTIONS.find(q => q.id === questionId);
        if (!question) return answerValue;
        const option = question.options.find(o => o.value === answerValue);
        return option ? option.text : answerValue;
    };

    const translateValue = (id: string, val: string) => {
        if (!val) return 'N/A';
        const question = QUESTIONS.find(q => q.id === id);
        if (!question) return val;
        const option = question.options.find(o => o.value === val);
        return option ? option.text : val;
    };

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
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);

        return (match && match[2].length === 11) ? match[2] : url;
    };

    // Carregar dados conforme a aba
    useEffect(() => {
        loadData();
    }, [activeTab]);

    async function loadData() {
        setLoading(true);
        try {
            let result: any[] = [];
            if (activeTab === 'Notícias') result = await getGuides();
            else if (activeTab === 'Tutoriais') result = await getTutorials();
            else if (activeTab === 'Comunidade') result = await getCommunityPosts();
            else if (activeTab === 'Parceiros') result = await getPartners();
            else if (activeTab === 'Leads') {
                try {
                    const [leads, stats] = await Promise.all([getQuizLeads(), getQuizStats()]);
                    result = leads || [];
                    setQuizStats(stats);
                    console.log('[Admin] Leads loaded:', leads?.length);
                } catch (err) {
                    console.error('[Admin] Error loading Quiz Leads:', err);
                    showToast('Erro ao carregar leads do quiz.', 'error');
                }
            } else if (activeTab === 'Agendamentos') {
                try {
                    const [slots, bookings] = await Promise.all([adminGetAllSlots(), adminGetBookings()]);
                    setData({ slots, bookings });
                    setLoading(false);
                    return; // Retorno antecipado pois a estrutura de dados é diferente
                } catch (err) {
                    console.error('[Admin] Error loading Scheduling data:', err);
                    showToast('Erro ao carregar dados de agendamento.', 'error');
                }
            }
            setData(result);
        } catch (error) {
            console.error('[Admin] Error in loadData:', error);
            showToast('Erro ao carregar dados da aba.', 'error');
        } finally {
            setLoading(false);
        }
    }

    const DetailItem = ({ label, value }: { label: string; value: string }) => (
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{label}</p>
            <p className="text-white text-xs font-bold truncate">{value || 'N/A'}</p>
        </div>
    );

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
                playlist: item.playlist || 'Geral',
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
                        playlist: formData.playlist,
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
                    setFormData({ title: '', category: '', excerpt: '', content: '', thumbnail: '', read_time: '5 min', is_premium: false, instructor: '', duration: '', video_url: '', playlist: '', whatsapp: '', site_url: '', discount_code: '', is_exclusive: false });
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
                    playlist: formData.playlist || 'Geral',
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
            } else if (activeTab === 'Agendamentos') {
                const startTime = new Date(formData.start_time);
                const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hora depois
                const result = await adminCreateSlot({
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    price: formData.price || 0
                });
                success = !!result;
            }

            if (success) {
                showToast('Criado com sucesso!', 'success');
                setIsCreating(false);
                setFormData({ title: '', category: '', excerpt: '', content: '', thumbnail: '', read_time: '5 min', is_premium: false, instructor: '', duration: '', video_url: '', playlist: '', whatsapp: '', site_url: '', discount_code: '', is_exclusive: false });
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
                                    setFormData({ title: '', category: '', excerpt: '', content: '', thumbnail: '', read_time: '5 min', is_premium: false, instructor: '', duration: '', video_url: '', playlist: '', whatsapp: '', site_url: '', discount_code: '', is_exclusive: false });
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
                        { id: 'Agendamentos', icon: <Clock className="w-4 h-4 text-blue-400" /> },
                        { id: 'Notificações', icon: <MessageSquare className="w-4 h-4 text-brand-yellow" /> },
                        // { id: 'Professor', icon: <GraduationCap className="w-4 h-4 text-brand-yellow" /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as AdminTab)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 flex-shrink-0 ${activeTab === tab.id
                                ? 'bg-white text-navy-950 border-white shadow-xl'
                                : 'bg-navy-900/50 text-white/40 border-white/5 hover:bg-white/5'
                                } `}
                        >
                            {tab.icon}
                            {tab.id}
                        </button>
                    ))}
                </div>
            </header>

            <div className={`space-y-4 ${activeTab === 'Professor' ? 'max-w-7xl mx-auto' : ''}`}>
                {activeTab === 'Professor' ? (
                    <SpanishTeacherPortal />
                ) : activeTab === 'Notificações' ? (
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
                        <p className="text-white/40 text-xs text-center">As notificações enviadas não aparecem nesta lista (apenas no banco).</p>
                    </div>
                ) : activeTab === 'Agendamentos' ? (
                    <div className="space-y-8">
                        {/* Slots Management */}
                        <section className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-white">Horários Disponíveis</h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={async () => {
                                            if (confirm('Tem certeza que deseja APAGAR TODOS os horários que ainda NÃO foram reservados? Isso não afetará os agendamentos já pagos/dependentes.')) {
                                                setIsSaving(true);
                                                try {
                                                    await adminDeleteAllUnbookedSlots();
                                                    showToast('Todos os horários disponíveis foram removidos.', 'success');
                                                    loadData();
                                                } catch (e) {
                                                    showToast('Erro ao remover horários.', 'error');
                                                } finally {
                                                    setIsSaving(false);
                                                }
                                            }
                                        }}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        Limpar Disponíveis
                                    </button>
                                    <button 
                                        onClick={() => setIsBulkGenerating(!isBulkGenerating)}
                                        className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
                                    >
                                        {isBulkGenerating ? 'Cancelar Lote' : 'Gerar em Lote'}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsCreating(true);
                                            setFormData({ start_time: '', price: 197 });
                                        }}
                                        className="px-4 py-2 bg-brand-yellow text-navy-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                                    >
                                        Adicionar Horário
                                    </button>
                                </div>
                            </div>

                            {isBulkGenerating && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/5 border border-brand-yellow/30 p-6 rounded-3xl space-y-6"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-5 h-5 text-brand-yellow" />
                                        <h4 className="font-black text-white uppercase tracking-widest text-xs">Configurar Geração em Lote (Horário de Madri)</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-white/40 pl-2">Data Início</label>
                                            <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" 
                                                value={bulkConfig.startDate} onChange={e => setBulkConfig({...bulkConfig, startDate: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-white/40 pl-2">Data Fim</label>
                                            <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" 
                                                value={bulkConfig.endDate} onChange={e => setBulkConfig({...bulkConfig, endDate: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-white/40 pl-2">Hora Início</label>
                                            <input type="time" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" 
                                                value={bulkConfig.startHour} onChange={e => setBulkConfig({...bulkConfig, startHour: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-white/40 pl-2">Hora Fim</label>
                                            <input type="time" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" 
                                                value={bulkConfig.endHour} onChange={e => setBulkConfig({...bulkConfig, endHour: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-white/40 pl-2">Duração (min)</label>
                                            <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" 
                                                value={bulkConfig.meetingDuration} onChange={e => setBulkConfig({...bulkConfig, meetingDuration: Number(e.target.value)})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-white/40 pl-2">Intervalo (min)</label>
                                            <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" 
                                                value={bulkConfig.breakTime} onChange={e => setBulkConfig({...bulkConfig, breakTime: Number(e.target.value)})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-white/40 pl-2">Preço (R$)</label>
                                            <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" 
                                                value={bulkConfig.price} onChange={e => setBulkConfig({...bulkConfig, price: Number(e.target.value)})} />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            {id: 1, l: 'Seg'}, {id: 2, l: 'Ter'}, {id: 3, l: 'Qua'}, 
                                            {id: 4, l: 'Qui'}, {id: 5, l: 'Sex'}, {id: 6, l: 'Sáb'}, {id: 0, l: 'Dom'}
                                        ].map(d => (
                                            <button 
                                                key={d.id}
                                                onClick={() => {
                                                    const days = bulkConfig.days.includes(d.id) 
                                                        ? bulkConfig.days.filter(x => x !== d.id) 
                                                        : [...bulkConfig.days, d.id];
                                                    setBulkConfig({...bulkConfig, days});
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                                                    bulkConfig.days.includes(d.id) ? 'bg-brand-yellow text-navy-950 border-brand-yellow' : 'bg-white/5 text-white/40 border-white/10'
                                                }`}
                                            >
                                                {d.l}
                                            </button>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={async () => {
                                            if (!bulkConfig.startDate || !bulkConfig.endDate) {
                                                showToast('Selecione as datas.', 'warning');
                                                return;
                                            }
                                            setIsSaving(true);
                                            try {
                                                const slots = generateBulkSlots(bulkConfig);
                                                if (slots.length === 0) {
                                                     showToast('Nenhum horário gerado. Verifique as configurações.', 'warning');
                                                     return;
                                                }
                                                if (confirm(`Gerar ${slots.length} horários?`)) {
                                                    await adminCreateBulkSlots(slots);
                                                    showToast(`${slots.length} horários criados!`, 'success');
                                                    setIsBulkGenerating(false);
                                                    loadData();
                                                }
                                            } catch (e) {
                                                showToast('Erro ao gerar horários.', 'error');
                                            } finally {
                                                setIsSaving(false);
                                            }
                                        }}
                                        disabled={isSaving}
                                        className="w-full py-4 bg-brand-yellow text-navy-950 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                        Gerar {generateBulkSlots(bulkConfig).length} Horários
                                    </button>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Array.isArray(data.slots) && data.slots.map((slot: any) => (
                                    <div key={slot.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center group">
                                        <div>
                                            <p className="text-white font-bold">{new Date(slot.start_time).toLocaleString('pt-BR')}</p>
                                            <p className={`${slot.is_booked ? 'text-red-400' : 'text-green-400'} text-[10px] font-black uppercase tracking-widest`}>
                                                {slot.is_booked ? 'Reservado' : 'Disponível'}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                if(confirm('Excluir este horário?')) {
                                                    await adminDeleteSlot(slot.id);
                                                    loadData();
                                                }
                                            }}
                                            className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Recent Bookings */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-black text-white">Agendamentos Realizados</h3>
                            <div className="grid gap-4">
                                {Array.isArray(data.bookings) && data.bookings.map((booking: any) => (
                                    <div key={booking.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col gap-4">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="space-y-1">
                                                <h4 className="text-white font-black text-lg">{booking.name}</h4>
                                                <div className="flex gap-4 text-white/40 text-xs font-bold uppercase tracking-widest">
                                                    <span>{booking.email}</span>
                                                    <span>{booking.whatsapp}</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Horário Marcado:</p>
                                                <p className="text-brand-yellow font-bold text-lg">
                                                    {booking.consultation_slots?.start_time ? new Date(booking.consultation_slots.start_time).toLocaleString('pt-BR') : 'Horário removido'}
                                                </p>
                                                <div className="flex gap-2 items-center mt-2">
                                                    <button 
                                                        onClick={() => setRescheduleBookingId(booking.id)}
                                                        className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-white/10 text-white hover:bg-brand-yellow hover:text-navy-950 transition-all border border-white/20"
                                                    >
                                                        Reagendar
                                                    </button>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                                        booking.payment_status === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    }`}>
                                                        {booking.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {rescheduleBookingId === booking.id && (
                                            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center">
                                                <p className="text-brand-yellow text-xs font-bold">Escolha o novo horário:</p>
                                                <select 
                                                    className="bg-navy-900 border border-white/20 rounded-lg p-2 text-sm flex-1 text-white"
                                                    value={rescheduleSlotId}
                                                    onChange={e => setRescheduleSlotId(e.target.value)}
                                                >
                                                    <option value="">-- Selecione um horário disponível --</option>
                                                    {data.slots?.filter((s: any) => !s.is_booked).map((s: any) => (
                                                        <option key={s.id} value={s.id}>
                                                            {new Date(s.start_time).toLocaleString('pt-BR')}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => setRescheduleBookingId(null)}
                                                        className="px-3 py-2 rounded-lg text-xs font-bold text-white/60 hover:text-white"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button 
                                                        onClick={async () => {
                                                            if (!rescheduleSlotId) {
                                                                showToast('Selecione um horário primeiro', 'warning');
                                                                return;
                                                            }
                                                            if (confirm('O link do Google Meet antigo continuará o mesmo no banco. Você precisará alterar a data manualmente no Google Calendar. Confirmar remarcação sistêmica?')) {
                                                                setIsSaving(true);
                                                                try {
                                                                    const success = await adminRescheduleBooking(booking.id, booking.slot_id, rescheduleSlotId);
                                                                    if (success) {
                                                                        showToast('Agendamento remarcado!', 'success');
                                                                        setRescheduleBookingId(null);
                                                                        setRescheduleSlotId('');
                                                                        loadData();
                                                                    }
                                                                } catch (err) {
                                                                    showToast('Erro ao remarcar', 'error');
                                                                } finally {
                                                                    setIsSaving(false);
                                                                }
                                                            }
                                                        }}
                                                        disabled={isSaving}
                                                        className="px-3 py-2 rounded-lg text-xs font-bold bg-brand-yellow text-navy-950 hover:bg-white transition-all disabled:opacity-50"
                                                    >
                                                        {isSaving ? 'Salvando...' : 'Confirmar'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
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
                                {activeTab === 'Leads' && (
                                    <>
                                        {quizStats && (
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
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
                                        <div className="flex flex-col lg:flex-row gap-4 mb-6">
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="h-4 w-4 text-white/30" />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-brand-yellow sm:text-sm transition-all font-medium"
                                                    placeholder="Buscar lead por nome, email ou telefone..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>

                                            <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
                                                {[
                                                    { id: 'all', label: 'Todos' },
                                                    { id: 'started', label: 'Iniciados' },
                                                    { id: 'completed', label: 'Finalizados' }
                                                ].map(f => (
                                                    <button
                                                        key={f.id}
                                                        onClick={() => setStatusFilter(f.id as any)}
                                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f.id
                                                            ? 'bg-brand-yellow text-navy-950'
                                                            : 'text-white/40 hover:text-white'
                                                            }`}
                                                    >
                                                        {f.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setOnlyWithResult(!onlyWithResult)}
                                                className={`px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${onlyWithResult
                                                    ? 'bg-green-500/10 border-green-500/50 text-green-400'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${onlyWithResult ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-white/20'}`} />
                                                Apenas com Resultado
                                            </button>
                                        </div>
                                    </>
                                )}

                                {filteredData.map(item => (
                                    <div
                                        key={item.id}
                                        className="glass-card p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                                    >
                                        {activeTab === 'Leads' ? (
                                            <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
                                                {/* Status & Result Badges */}
                                                <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-center min-w-[100px]">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl text-center border ${item.status === 'completed'
                                                        ? 'bg-green-400/10 text-green-400 border-green-500/20'
                                                        : 'bg-white/5 text-white/30 border-white/5'
                                                        }`}>
                                                        {item.status === 'completed' ? 'Finalizado' : 'Iniciado'}
                                                    </span>
                                                    {item.result && (
                                                        <span className={`text-sm font-black uppercase tracking-tighter px-3 py-2 rounded-xl text-center border shadow-lg ${item.result === 'A' ? 'bg-green-400 text-navy-950 border-green-400' :
                                                            item.result === 'B' ? 'bg-amber-400 text-navy-950 border-amber-400' :
                                                                'bg-red-500 text-white border-red-500'
                                                            }`}>
                                                            Result: {item.result}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    <h3 className="text-white font-bold text-lg">{item.name || 'Sem nome'}</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-white/50 font-bold uppercase tracking-widest">
                                                        <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3 text-white/30 shrink-0" /> {item.email || '-'}</span>
                                                        <span className="flex items-center gap-1 truncate"><Phone className="w-3 h-3 text-white/30 shrink-0" /> {item.phone || '-'}</span>
                                                        <span className="flex items-center gap-1 truncate col-span-1 sm:col-span-2"><Clock className="w-3 h-3 text-white/30 shrink-0" /> {item.created_at ? new Date(item.created_at).toLocaleString('pt-BR') : '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1 w-full">
                                                <div className="flex items-center gap-2 flex-wrap">
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
                                                <h3 className="text-white font-bold leading-tight line-clamp-2">{item.title || item.user_name || item.name}</h3>
                                                <p className="text-white/40 text-xs line-clamp-1 italic">
                                                    {item.excerpt || item.content || item.description || 'Sem descrição'}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end">
                                            {activeTab === 'Leads' ? (
                                                <>
                                                    <a
                                                        href={`https://wa.me/${(item.phone || '').replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all border border-green-500/20 ${!item.phone && 'opacity-20 pointer-events-none'}`}
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => setSelectedLead(item)}
                                                        className="p-3 bg-brand-yellow/10 text-brand-yellow rounded-xl hover:bg-brand-yellow hover:text-navy-950 transition-all border border-brand-yellow/20"
                                                        title="Ver Respostas Detalhadas"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </>
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

                                {
                                    filteredData.length === 0 && (
                                        <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                                            <p className="text-white/20 font-black uppercase text-xs tracking-widest">{searchQuery ? 'Nenhum lead encontrado para a busca' : 'Nenhum registro encontrado'}</p>
                                        </div>
                                    )
                                }
                            </motion.div >
                        )}
                    </AnimatePresence >
                )}
            </div >

            {/* MODAL GERADOR DE HORÁRIOS EM LOTE (Agendamentos) */}
            <AnimatePresence>
                {isCreating && activeTab === 'Agendamentos' && (
                    <div className="fixed inset-0 z-[1000] bg-navy-950/90 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card bg-[#0a0f1d] rounded-[3rem] p-8 w-full max-w-2xl border border-white/10 shadow-2xl space-y-8 my-auto"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Gerador de Horários</h2>
                                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold mt-1">Geração em Lote Automática</p>
                                </div>
                                <button onClick={() => setIsCreating(false)} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Period */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Período de Geração</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-white/30 pl-2">Data Início</label>
                                        <input type="date" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                            value={bulkConfig.startDate}
                                            onChange={e => setBulkConfig(c => ({ ...c, startDate: e.target.value }))} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-white/30 pl-2">Data Fim</label>
                                        <input type="date" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                            value={bulkConfig.endDate}
                                            onChange={e => setBulkConfig(c => ({ ...c, endDate: e.target.value }))} />
                                    </div>
                                </div>
                            </div>

                            {/* Days of week */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Dias da Semana Disponíveis</label>
                                <div className="flex gap-2 flex-wrap">
                                    {[{ label: 'Dom', val: 0 }, { label: 'Seg', val: 1 }, { label: 'Ter', val: 2 }, { label: 'Qua', val: 3 }, { label: 'Qui', val: 4 }, { label: 'Sex', val: 5 }, { label: 'Sáb', val: 6 }].map(({ label, val }) => {
                                        const active = bulkConfig.days.includes(val);
                                        return (
                                            <button key={val} onClick={() => setBulkConfig(c => ({
                                                ...c,
                                                days: active ? c.days.filter(d => d !== val) : [...c.days, val].sort()
                                            }))}
                                                className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
                                                    active ? 'bg-brand-yellow text-navy-950 border-brand-yellow' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
                                                }`}>
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time window */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Janela de Horários</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-white/30 pl-2">Início do Horário</label>
                                        <input type="time" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                            value={bulkConfig.startHour}
                                            onChange={e => setBulkConfig(c => ({ ...c, startHour: e.target.value }))} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-white/30 pl-2">Fim do Horário</label>
                                        <input type="time" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                            value={bulkConfig.endHour}
                                            onChange={e => setBulkConfig(c => ({ ...c, endHour: e.target.value }))} />
                                    </div>
                                </div>
                            </div>

                            {/* Duration & Break */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Configuração da Reunião</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-white/30 pl-2">Duração (min)</label>
                                        <input type="number" min="15" max="480" step="15" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                            value={bulkConfig.meetingDuration}
                                            onChange={e => setBulkConfig(c => ({ ...c, meetingDuration: Number(e.target.value) }))} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-white/30 pl-2">Intervalo (min)</label>
                                        <input type="number" min="0" max="120" step="5" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                            value={bulkConfig.breakTime}
                                            onChange={e => setBulkConfig(c => ({ ...c, breakTime: Number(e.target.value) }))} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-white/30 pl-2">Preço (R$)</label>
                                        <input type="number" min="0" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                            value={bulkConfig.price}
                                            onChange={e => setBulkConfig(c => ({ ...c, price: Number(e.target.value) }))} />
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            {bulkConfig.startDate && bulkConfig.endDate && (() => {
                                const previewSlots = generateBulkSlots(bulkConfig);
                                return (
                                    <div className="bg-white/5 border border-dashed border-white/10 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Pré-visualização</p>
                                        <p className="text-white font-black text-2xl">{previewSlots.length} <span className="text-brand-yellow">horários</span> serão gerados</p>
                                        <p className="text-white/40 text-xs mt-1">Com reunião de {bulkConfig.meetingDuration} min + {bulkConfig.breakTime} min de intervalo entre reuniões</p>
                                    </div>
                                );
                            })()}

                            <button
                                onClick={async () => {
                                    if (!bulkConfig.startDate || !bulkConfig.endDate) {
                                        showToast('Selecione o período de geração.', 'warning');
                                        return;
                                    }
                                    if (bulkConfig.days.length === 0) {
                                        showToast('Selecione ao menos um dia da semana.', 'warning');
                                        return;
                                    }
                                    setIsBulkGenerating(true);
                                    try {
                                        const slots = generateBulkSlots(bulkConfig);
                                        if (slots.length === 0) {
                                            showToast('Nenhum horário gerado. Verifique as configurações.', 'warning');
                                            return;
                                        }
                                        const result = await adminCreateBulkSlots(slots);
                                        if (result) {
                                            showToast(`${slots.length} horários criados com sucesso!`, 'success');
                                            setIsCreating(false);
                                            loadData();
                                        }
                                    } catch (err) {
                                        showToast('Erro ao gerar horários.', 'error');
                                    } finally {
                                        setIsBulkGenerating(false);
                                    }
                                }}
                                disabled={isBulkGenerating}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
                                    isBulkGenerating ? 'bg-white/20 text-white/40 cursor-not-allowed' : 'bg-brand-yellow text-navy-950 hover:bg-white shadow-brand-yellow/10'
                                }`}
                            >
                                {isBulkGenerating ? (
                                    <><div className="w-5 h-5 border-2 border-navy-950/20 border-t-navy-950 rounded-full animate-spin" /> Gerando...</>
                                ) : (
                                    <><CalendarIcon className="w-5 h-5" /> Gerar Horários em Lote</>
                                )}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DE CRIAÇÃO */}
            <AnimatePresence>
                {
                    isCreating && activeTab !== 'Agendamentos' && (
                        <div className="fixed inset-0 z-[1000] bg-navy-950/80 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="glass-card bg-[#0a0f1d] rounded-[3rem] p-8 w-full max-w-xl border-white/10 shadow-2xl space-y-6 my-auto"
                            >


                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-white tracking-tight">
                                        {editingId ? 'Editar' : 'Adicionar'} {activeTab === 'Notícias' ? 'Notícia/Guia' : activeTab === 'Parceiros' ? 'Parceiro' : activeTab === 'Agendamentos' ? 'Horário (Slot)' : 'Tutorial'}
                                    </h2>
                                    <button onClick={() => { setIsCreating(false); setEditingId(null); }} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {activeTab !== 'Agendamentos' && (
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
                                    )}

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
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Pasta / Módulo (Playlist)</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-brand-yellow transition-all"
                                                    placeholder="Ex: Módulo 1 - Preparação..."
                                                    value={formData.playlist || ''}
                                                    onChange={e => setFormData({ ...formData, playlist: e.target.value })}
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
                    )
                }
            </AnimatePresence >

            {/* MODAL DE DETALHES DO LEAD */}
            <AnimatePresence>
                {
                    selectedLead && (
                        <div className="fixed inset-0 z-[1000] bg-navy-950/80 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="glass-card bg-[#0a0f1d] rounded-[2rem] p-8 w-full max-w-2xl border-white/10 shadow-2xl space-y-6 my-auto"
                            >
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight">Detalhes do Quiz</h2>
                                        <p className="text-white/40 text-sm">{selectedLead.name}</p>
                                    </div>
                                    <button onClick={() => setSelectedLead(null)} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                            <p className="text-[10px] uppercase tracking-widest text-white/40">Status</p>
                                            <p className="text-white font-bold">{selectedLead.status === 'completed' ? 'Finalizado' : 'Incompleto'}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                            <p className="text-[10px] uppercase tracking-widest text-white/40">Resultado</p>
                                            <p className={`font-bold ${selectedLead.result === 'A' ? 'text-green-400' : selectedLead.result === 'B' ? 'text-amber-400' : 'text-red-400'}`}>
                                                {selectedLead.result || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-black text-white uppercase tracking-widest mt-6 mb-2">Respostas</h3>

                                    {(() => {
                                        let answers = selectedLead.answers;
                                        // Fallback para caso o dado venha como string JSON do banco
                                        if (typeof answers === 'string') {
                                            try { answers = JSON.parse(answers); } catch (e) { answers = []; }
                                        }

                                        const hasAnswers = Array.isArray(answers) && answers.length > 0;

                                        return (
                                            <div className="space-y-6">
                                                {/* Seção 1: Respostas Estruturadas (Colunas do Banco) */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <DetailItem label="Renda" value={translateValue('salary', selectedLead.salary)} />
                                                    <DetailItem label="Comprovação" value={translateValue('income_proof', selectedLead.income_proof)} />
                                                    <DetailItem label="Fonte Renda" value={translateValue('income_source', selectedLead.income_source)} />
                                                    <DetailItem label="Trabalho" value={translateValue('remote_work', selectedLead.remote_work)} />
                                                    <DetailItem label="Tempo Exp" value={translateValue('job_tenure', selectedLead.job_tenure)} />
                                                    <DetailItem label="Tempo Emp" value={translateValue('company_age', selectedLead.company_age)} />
                                                    <DetailItem label="Família" value={translateValue('family_config', selectedLead.family_config)} />
                                                    <DetailItem label="Dependentes" value={selectedLead.kids_count} />
                                                    <DetailItem label="Qualificação" value={translateValue('qualification', selectedLead.qualification)} />
                                                    <DetailItem label="Antecedentes" value={translateValue('criminal_record', selectedLead.criminal_record)} />
                                                </div>

                                                <div className="border-t border-white/10 pt-6">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Fluxo de Respostas</h3>
                                                        <button
                                                            onClick={() => setShowRawLead(!showRawLead)}
                                                            className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-brand-yellow transition-colors"
                                                        >
                                                            {showRawLead ? 'Ver Lista' : 'Ver JSON Bruto'}
                                                        </button>
                                                    </div>

                                                    {showRawLead ? (
                                                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 overflow-x-auto">
                                                            <pre className="text-[10px] text-blue-300 font-mono">
                                                                {JSON.stringify(selectedLead, null, 2)}
                                                            </pre>
                                                        </div>
                                                    ) : hasAnswers ? (
                                                        <div className="space-y-3">
                                                            {answers.map((ans: any, idx: number) => {
                                                                const question = QUESTIONS.find(q => q.id === (ans.id || ans.questionId));
                                                                const questionText = question ? getQuestionText(question, answers) : (ans.id || ans.questionId || 'Questão desconhecida');
                                                                const answerText = getAnswerText(question?.id || ans.id || ans.questionId, ans.value);

                                                                return (
                                                                    <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-brand-yellow/30 transition-all">
                                                                        <p className="text-[10px] text-brand-yellow font-black uppercase tracking-widest mb-1 opacity-60">{questionText}</p>
                                                                        <p className="text-white text-sm font-bold">{answerText}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/10 rounded-xl space-y-2">
                                                            <p className="text-white/40 italic text-sm">Nenhum detalhe de fluxo salvo.</p>
                                                            <p className="text-[10px] text-white/20 uppercase font-black">ID: {selectedLead.id}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

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

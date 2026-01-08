import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, Newspaper, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Notification } from '../types';

const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();

        // Polling for new notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);

        // Click outside handler
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (data && !error) {
            const mappedNotifications = data.map(n => ({
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type,
                actionUrl: n.action_url,
                createdAt: n.created_at
            }));

            setNotifications(mappedNotifications);
            checkUnread(mappedNotifications);
        }
    };

    const checkUnread = (currentNotifications: Notification[]) => {
        const lastSeen = localStorage.getItem('nomad_last_notification_seen');
        if (!lastSeen && currentNotifications.length > 0) {
            setHasUnread(true);
            return;
        }

        if (currentNotifications.length > 0) {
            const latest = new Date(currentNotifications[0].createdAt).getTime();
            const seen = new Date(lastSeen!).getTime();
            if (latest > seen) {
                setHasUnread(true);
            }
        }
    };

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen && notifications.length > 0) {
            setHasUnread(false);
            localStorage.setItem('nomad_last_notification_seen', new Date().toISOString());
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'news': return <Newspaper className="w-4 h-4 text-brand-blue" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-brand-yellow" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Notificações"
            >
                <Bell className="w-6 h-6 text-white" />
                {hasUnread && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-navy-950 animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-navy-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right backdrop-blur-xl"
                    >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-navy-950/50">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Notificações</h3>
                            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-white/40">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs">Nenhuma notificação por enquanto.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((notification) => (
                                        <div key={notification.id} className="p-4 hover:bg-white/5 transition-colors">
                                            <div className="flex gap-3 items-start">
                                                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="text-sm font-bold text-white leading-tight">{notification.title}</h4>
                                                        <span className="text-[10px] text-white/30 whitespace-nowrap ml-2">
                                                            {formatDate(notification.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-white/60 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    {notification.actionUrl && (
                                                        <a
                                                            href={notification.actionUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-yellow hover:underline mt-2"
                                                        >
                                                            Saiba mais <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;

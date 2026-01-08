import React from 'react';
import {
    LayoutDashboard,
    ListTodo,
    Newspaper,
    Crown,
    UserCircle,
    Settings,
    LogOut,
    Handshake
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: any) => void;
    isAdmin: boolean;
    profile: UserProfile | null;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isAdmin, profile, onLogout }) => {
    const menuItems = [
        { id: 'Dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'Tasks', label: 'Tarefas', icon: ListTodo },
        { id: 'Guides', label: 'News', icon: Newspaper },
        { id: 'Members', label: 'Hub Elite', icon: Crown },
        { id: 'Partners', label: 'Parceiros', icon: Handshake },
    ];

    if (isAdmin) {
        menuItems.push({ id: 'Admin', label: 'Admin', icon: Settings });
    }

    return (
        <aside className="w-60 fixed left-0 top-0 h-screen bg-navy-950 border-r border-white/5 hidden lg:flex flex-col z-50">
            {/* Logo Area */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 flex items-center justify-center">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-lg font-black tracking-tighter text-white">Nomad<span className="text-brand-yellow">Flow</span></span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1.5">
                {menuItems.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group text-sm ${isActive
                                ? 'bg-brand-yellow text-navy-950 font-bold shadow-lg shadow-brand-yellow/20'
                                : 'text-blue-200/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${isActive ? 'text-navy-950' : 'group-hover:scale-110 transition-transform'}`} />
                            <span className="tracking-wide">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* User Profile Footer */}
            <div className="p-3 border-t border-white/5">
                <button
                    onClick={() => setActiveView('Profile')}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${activeView === 'Profile' ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                        <img
                            src={profile?.avatarUrl || "https://picsum.photos/seed/nomad/100"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{profile?.fullName || 'Nômade'}</p>
                        <p className="text-[10px] text-white/40 truncate">{profile?.email}</p>
                    </div>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

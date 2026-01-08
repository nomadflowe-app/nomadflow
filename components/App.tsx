import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  UserCircle,
  Compass,
  Newspaper,
  Crown,
  Plane
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Guides from './components/Guides';
import MembersArea from './components/MembersArea';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import MobileGuard from './components/MobileGuard';
import AuthModal from './components/AuthModal';
import DatabaseSetup from './components/DatabaseSetup';
import { UserProfile, UserGoal } from './types';
import { supabase, signOutUser, getUserProfile, setOnDatabaseError } from './lib/supabase';

type View = 'Dashboard' | 'Guides' | 'Members' | 'Profile';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('nomad_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [loading, setLoading] = useState(true);

  // SUPABASE AUTH & ERROR LISTENER
  useEffect(() => {
    // Configura listener de erro de banco de dados
    setOnDatabaseError(() => setShowDatabaseSetup(true));

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthenticated(!!session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    // Escutar mudanças de Auth (Login, Logout, Auto-Refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthenticated(!!session);
      if (session) {
        setIsAuthModalOpen(false); // Fecha modal se logar com sucesso
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    // Tenta buscar no Supabase
    const userProfile = await getUserProfile(userId);

    if (userProfile) {
      console.log("Perfil carregado do Supabase:", userProfile);
      setProfile(userProfile);
      localStorage.setItem('nomad_profile', JSON.stringify(userProfile));
    } else {
      console.log("Nenhum perfil encontrado, enviando para Onboarding.");
      // Se não tem perfil no banco, mas tem sessão, talvez seja um novo usuário
      // Mantemos profile como null para triggerar o Onboarding
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOutUser();
    localStorage.removeItem('nomad_profile');
    localStorage.removeItem('nomad_goal');
    setProfile(null);
    setIsAuthenticated(false);
  };

  const handleOnboardingComplete = (newProfile: UserProfile, newGoal: UserGoal) => {
    // Adiciona o email real do usuário autenticado se disponível (redundância segura)
    if (session?.user?.email) {
      newProfile.email = session.user.email;
    }

    setProfile(newProfile);
    localStorage.setItem('nomad_profile', JSON.stringify(newProfile));
    localStorage.setItem('nomad_goal', JSON.stringify(newGoal));
  };

  // Content Renderer Logic
  const renderContent = () => {
    // Se erro de banco detectado, mostra tela de setup (Prioridade Máxima)
    if (showDatabaseSetup) {
      return <DatabaseSetup />;
    }

    if (loading) {
      return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-navy-950 backdrop-blur-3xl">
          <div className="relative">
            <div className="w-24 h-24 border-[6px] border-white/5 border-t-gold-500 rounded-full animate-spin" />
            <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="mt-10 text-white font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Sincronizando com Madrid</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <>
          <LandingPage onOpenAuth={() => setIsAuthModalOpen(true)} />
          <AnimatePresence>
            {isAuthModalOpen && (
              <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => setIsAuthModalOpen(false)} // O listener do supabase vai lidar com o resto
              />
            )}
          </AnimatePresence>
        </>
      );
    }

    if (!profile?.isOnboarded) {
      return <Onboarding onComplete={handleOnboardingComplete} initialEmail={session?.user?.email} />;
    }

    return (
      <div className="min-h-screen">
        <header className="fixed top-0 w-full z-40 px-6 py-4 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-between items-center md:hidden backdrop-blur-lg border-b border-black/5 bg-white/70">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-black tracking-tighter text-navy-950">Nomad<span className="text-white">Flow</span></span>
          </div>
          <button
            onClick={() => setActiveView('Profile')}
            className="w-10 h-10 rounded-xl overflow-hidden border border-black/10 shadow-sm"
          >
            <img src={profile.avatarUrl || "https://picsum.photos/seed/alex/100"} className="w-full h-full object-cover" />
          </button>
        </header>

        <main className="max-w-2xl mx-auto px-6 pt-[calc(7rem+env(safe-area-inset-top))] pb-[calc(8rem+env(safe-area-inset-bottom))]">
          <AnimatePresence mode="wait">
            {activeView === 'Dashboard' && (
              <motion.div key="db" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <Dashboard />
              </motion.div>
            )}
            {activeView === 'Guides' && (
              <motion.div key="gd" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <Guides />
              </motion.div>
            )}
            {activeView === 'Members' && (
              <motion.div key="mb" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <MembersArea />
              </motion.div>
            )}
            {activeView === 'Profile' && (
              <motion.div key="pr" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <Profile onLogout={handleLogout} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 pb-[env(safe-area-inset-bottom)]">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-2 border border-black/10 shadow-2xl flex justify-between items-center">
            <NavButton active={activeView === 'Dashboard'} onClick={() => setActiveView('Dashboard')} icon={<LayoutDashboard className="w-5 h-5" />} label="Home" />
            <NavButton active={activeView === 'Guides'} onClick={() => setActiveView('Guides')} icon={<Newspaper className="w-5 h-5" />} label="News" />
            <NavButton active={activeView === 'Members'} onClick={() => setActiveView('Members')} icon={<Crown className="w-5 h-5" />} label="Hub" />
            <NavButton active={activeView === 'Profile'} onClick={() => setActiveView('Profile')} icon={<UserCircle className="w-5 h-5" />} label="Perfil" />
          </div>
        </nav>
      </div>
    );
  };

  return (
    <MobileGuard>
      {renderContent()}
    </MobileGuard>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-1.5 py-4 transition-all duration-500 rounded-[2rem] ${active
      ? 'bg-white text-navy-950 shadow-xl scale-105'
      : 'text-gold-400 hover:text-realWhite'
      }`}
  >
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
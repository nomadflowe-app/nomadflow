import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCircle,
  Compass,
  BookOpen,
  Crown,
  Plane,
  ListTodo,
  Newspaper,
  Settings
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Guides from './components/Guides';
import MembersArea from './components/MembersArea';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import { AdminArea } from './components/AdminArea';
import { PartnersArea } from './components/PartnersArea';
import MobileGuard from './components/MobileGuard';
import AuthModal from './components/AuthModal';
import DatabaseSetup from './components/DatabaseSetup';
import TermsOfUse from './components/TermsOfUse';
import PrivacyPolicy from './components/PrivacyPolicy';
import ProductWizard from './components/ProductWizard';
import { UserProfile, UserGoal } from './types';
import { supabase, signOutUser, getUserProfile, setOnDatabaseError } from './lib/supabase';
import { ToastProvider } from './context/ToastContext';
import { NavButton } from './components/NavButton';
import { ChecklistProvider } from './context/ChecklistContext';
import Tasks from './components/Tasks';
import Success from './components/Success';

type View = 'Dashboard' | 'Tasks' | 'Guides' | 'Members' | 'Profile' | 'Success';

const MainContent: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false);
  const [showWizard, setShowWizard] = useState(() => {
    // Só mostra se foi finalizado o onboarding recentemente e não vimos o tour ainda
    return localStorage.getItem('nomad_show_wizard') === 'true';
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('nomad_profile');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<View | 'Admin'>('Dashboard');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = localStorage.getItem('nomad_profile');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        return p.isAdmin === true;
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  // SUPABASE AUTH & ERROR LISTENER
  useEffect(() => {
    // Configura listener de erro de banco de dados
    setOnDatabaseError(() => setShowDatabaseSetup(true));

    // Safety Timeout: Força desligamento do loading em 10s caso algo trave
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    // Verificar sessão inicial
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setIsAuthenticated(!!session);
        if (session) {
          fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Erro na sessão inicial:", err);
        setLoading(false);
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

    // Detectar retorno do Stripe (Success)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session_id')) {
      setActiveView('Success');
      window.history.replaceState({}, document.title, "/");
    }

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const userProfile = await getUserProfile(userId).catch(e => {
        console.error("Erro ao buscar perfil:", e);
        return null;
      });

      if (userProfile) {
        userProfile.id = userId;
        setProfile(userProfile);
        setIsAdmin(userProfile.isAdmin === true);
        localStorage.setItem('nomad_profile', JSON.stringify(userProfile));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    localStorage.removeItem('nomad_profile');
    localStorage.removeItem('nomad_goal');
    localStorage.removeItem('nomad_premium');
    setProfile(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const handleOnboardingComplete = (newProfile: UserProfile, newGoal: UserGoal) => {
    if (session?.user?.email) newProfile.email = session.user.email;
    if (session?.user?.id) newProfile.id = session.user.id;
    setProfile(newProfile);
    localStorage.setItem('nomad_profile', JSON.stringify(newProfile));
    localStorage.setItem('nomad_goal', JSON.stringify(newGoal));

    // Ativa o Wizard após o onboarding
    setShowWizard(true);
    localStorage.setItem('nomad_show_wizard', 'true');
  };

  const renderContent = () => {
    if (showDatabaseSetup) return <DatabaseSetup />;

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
                onSuccess={() => setIsAuthModalOpen(false)}
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
      <div className="min-h-screen font-sans bg-navy-950">

        {/* Desktop Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isAdmin={isAdmin}
          profile={profile}
          onLogout={handleLogout}
        />

        {/* Mobile Header */}
        <header className="fixed top-0 w-full z-40 px-6 py-4 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-between items-center md:hidden backdrop-blur-lg border-b border-black/5 bg-white/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter text-navy-950">Nomad<span className="text-white">Flow</span></span>
          </div>
          <button onClick={() => setActiveView('Profile')} className="w-10 h-10 rounded-xl overflow-hidden border border-black/10 shadow-sm">
            <img src={profile.avatarUrl || "https://picsum.photos/seed/alex/100"} className="w-full h-full object-cover" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="lg:pl-60 min-h-screen relative w-full">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-[calc(7rem+env(safe-area-inset-top))] lg:pt-8 pb-[calc(8rem+env(safe-area-inset-bottom))] lg:pb-12">
            <AnimatePresence mode="wait">
              {activeView === 'Dashboard' && <motion.div key="db" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}><Dashboard /></motion.div>}
              {activeView === 'Tasks' && <motion.div key="ts" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}><Tasks /></motion.div>}
              {activeView === 'Guides' && <motion.div key="gd" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}><Guides /></motion.div>}
              {activeView === 'Members' && <motion.div key="mb" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}><MembersArea /></motion.div>}
              {activeView === 'Partners' && <motion.div key="pt" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}><PartnersArea /></motion.div>}
              {activeView === 'Success' && <motion.div key="sc" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}><Success onContinue={() => { setActiveView('Dashboard'); window.location.reload(); }} /></motion.div>}
              {activeView === 'Profile' && <motion.div key="pr" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}><Profile onLogout={handleLogout} onUpdate={setProfile} /></motion.div>}
              {activeView === 'Admin' && isAdmin && <motion.div key="ad" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}><AdminArea /></motion.div>}
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-50 pb-[env(safe-area-inset-bottom)] lg:hidden">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-2 border border-black/10 shadow-2xl flex justify-between items-center">
            <NavButton active={activeView === 'Dashboard'} onClick={() => setActiveView('Dashboard')} icon={<LayoutDashboard className="w-5 h-5" />} label="Home" />
            <NavButton active={activeView === 'Tasks'} onClick={() => setActiveView('Tasks')} icon={<ListTodo className="w-5 h-5" />} label="Tarefas" />
            <NavButton active={activeView === 'Guides'} onClick={() => setActiveView('Guides')} icon={<Newspaper className="w-5 h-5" />} label="News" />
            <NavButton active={activeView === 'Members'} onClick={() => setActiveView('Members')} icon={<Crown className="w-5 h-5" />} label="Hub" />
            {isAdmin ? (
              <NavButton active={activeView === 'Admin'} onClick={() => setActiveView('Admin')} icon={<Settings className="w-5 h-5" />} label="Admin" />
            ) : (
              <NavButton active={activeView === 'Profile'} onClick={() => setActiveView('Profile')} icon={<UserCircle className="w-5 h-5" />} label="Perfil" />
            )}
          </div>
        </nav>

        {/* Welcome Wizard Overlay */}
        <AnimatePresence>
          {showWizard && (
            <ProductWizard onClose={() => {
              setShowWizard(false);
              localStorage.removeItem('nomad_show_wizard');
            }} />
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <ToastProvider>
      <ChecklistProvider>
        <MobileGuard>
          {renderContent()}
        </MobileGuard>
      </ChecklistProvider>
    </ToastProvider>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/termos" element={<TermsOfUse />} />
      <Route path="/privacidade" element={<PrivacyPolicy />} />
      <Route path="/*" element={<MainContent />} />
    </Routes>
  );
};

export default App;

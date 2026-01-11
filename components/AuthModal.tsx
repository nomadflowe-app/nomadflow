
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { signInUser, signUpUser, signInWithGoogle } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !acceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso para continuar.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await signInUser(formData.email, formData.password);
        if (error) throw error;
        onSuccess();
      } else {
        const { error } = await signUpUser(formData.email, formData.password, formData.fullName);
        if (error) throw error;
        // Auto login ou mensagem de sucesso
        onSuccess();
      }
    } catch (err: any) {
      // Tratamento amigável de erro
      if (err.message === 'Invalid login credentials') {
        setError('Email ou senha incorretos.');
      } else if (err.message.includes('User already registered')) {
        setError('Este email já está cadastrado.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!acceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // O redirecionamento acontece automaticamente
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-navy-950/90 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-md bg-navy-900/50 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-yellow/5 to-transparent pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12 space-y-8 relative z-10">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
              {isLogin ? <Lock className="w-6 h-6 text-brand-yellow" /> : <User className="w-6 h-6 text-brand-yellow" />}
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter">
              {isLogin ? 'Bem-vindo de volta.' : 'Crie sua conta.'}
            </h2>
            <p className="text-blue-100/60 font-medium">
              {isLogin ? 'Acesse seu painel e continue sua jornada na Espanha.' : 'Junte-se a 1200+ nômades aprovados.'}
            </p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white hover:bg-gray-50 text-navy-950 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar com Google
          </button>

          <div className="relative flex items-center gap-4 py-2">
            <div className="h-[1px] bg-white/10 flex-1" />
            <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">ou Email</span>
            <div className="h-[1px] bg-white/10 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-1 flex items-center mb-4 transition-colors focus-within:border-brand-yellow/50">
                    <div className="p-3 text-white/40"><User className="w-5 h-5" /></div>
                    <input
                      type="text"
                      name="fullName"
                      required={!isLogin}
                      placeholder="Nome Completo"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="bg-transparent w-full text-white placeholder-white/20 font-bold focus:outline-none py-2 text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-black/20 border border-white/5 rounded-2xl p-1 flex items-center transition-colors focus-within:border-brand-yellow/50">
              <div className="p-3 text-white/40"><Mail className="w-5 h-5" /></div>
              <input
                type="email"
                name="email"
                required
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                className="bg-transparent w-full text-white placeholder-white/20 font-bold focus:outline-none py-2 text-sm"
              />
            </div>

            <div className="bg-black/20 border border-white/5 rounded-2xl p-1 flex items-center transition-colors focus-within:border-brand-yellow/50">
              <div className="p-3 text-white/40"><Lock className="w-5 h-5" /></div>
              <input
                type="password"
                name="password"
                required
                placeholder="Senha segura"
                value={formData.password}
                onChange={handleChange}
                className="bg-transparent w-full text-white placeholder-white/20 font-bold focus:outline-none py-2 text-sm"
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 px-2 py-1"
            >
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-5 h-5 rounded-lg bg-black/40 border border-white/10 checked:bg-brand-yellow checked:border-brand-yellow appearance-none cursor-pointer transition-all"
                />
                {acceptedTerms && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-dark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
              <label htmlFor="terms" className="text-xs text-blue-100/60 font-medium leading-relaxed cursor-pointer select-none">
                Eu li e aceito os <Link to="/termos" target="_blank" className="text-brand-yellow hover:underline">Termos de Uso</Link> e a <Link to="/privacidade" target="_blank" className="text-brand-yellow hover:underline">Política de Privacidade</Link>.
              </label>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/10">
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-yellow text-brand-dark rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_-10px_rgba(255,204,0,0.3)] hover:shadow-[0_0_40px_-10px_rgba(255,204,0,0.5)] hover:bg-white hover:text-navy-950 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar Agora' : 'Criar Conta Grátis'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="group text-xs font-bold text-white/40 hover:text-white transition-colors"
            >
              <span className="group-hover:underline decoration-brand-yellow underline-offset-4">
                {isLogin ? 'Novo por aqui? Crie sua conta.' : 'Já é membro? Faça login.'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;

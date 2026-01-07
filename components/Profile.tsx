
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Phone, Mail, Globe, Save, X, LogOut, MessageCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { syncProfile } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface ProfileProps {
  onLogout: () => void;
  onUpdate: (profile: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ onLogout, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nomad_profile');
    return saved ? JSON.parse(saved) : {
      fullName: 'Alex Ribeiro',
      email: 'alex.nomade@gmail.com',
      phone: '+55 11 99999-9999',
      city: '',
      state: '',
      country: 'Brasil',
      avatarUrl: 'https://picsum.photos/seed/alex/200'
    };
  });

  useEffect(() => {
    localStorage.setItem('nomad_profile', JSON.stringify(profile));
  }, [profile]);

  const handleSave = async () => {
    setIsEditing(false);
    // Sincroniza com o Supabase ao salvar a edição
    await syncProfile(profile);
    onUpdate(profile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A foto deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newAvatarUrl = reader.result as string;
        const updatedProfile = { ...profile, avatarUrl: newAvatarUrl };
        setProfile(updatedProfile);
        // Sincroniza imediatamente ao mudar a foto
        await syncProfile(updatedProfile);
        onUpdate(updatedProfile);
      };
      reader.readAsDataURL(file);
    }
  };

  const initials = profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const labelClass = "text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1 opacity-70";
  const valueClass = "text-sm font-bold text-white";

  return (
    <div className="space-y-6 pb-24">
      <header className="text-center py-8">
        <div className="relative inline-block">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/10 shadow-xl bg-white/5 flex items-center justify-center text-3xl font-bold text-white">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-brand-yellow text-brand-dark p-2 rounded-full cursor-pointer hover:bg-brand-yellow/80 transition-colors shadow-lg">
            <Camera className="w-4 h-4" />
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </label>
        </div>
        <h2 className="mt-4 text-2xl font-black text-white">{profile.fullName}</h2>
        <p className="text-sm text-white/50 font-medium">{profile.email}</p>
      </header>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/10">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="font-black text-white uppercase tracking-widest text-xs">Dados Pessoais</h3>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="text-brand-yellow text-xs font-black uppercase tracking-widest">Editar</button>
          ) : (
            <div className="flex gap-4">
              <button onClick={() => setIsEditing(false)} className="text-red-400"><X className="w-5 h-5" /></button>
              <button onClick={handleSave} className="text-green-400"><Save className="w-5 h-5" /></button>
            </div>
          )}
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow border border-brand-yellow/20"><Mail className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className={labelClass}>E-mail</p>
              {isEditing ? (
                <input name="email" value={profile.email} onChange={handleChange} className="w-full text-white bg-transparent text-sm font-bold focus:outline-none border-b border-white/10 pb-1" />
              ) : (
                <p className={valueClass}>{profile.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow border border-brand-yellow/20"><Phone className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className={labelClass}>Celular</p>
              {isEditing ? (
                <input name="phone" value={profile.phone} onChange={handleChange} className="w-full text-white bg-transparent text-sm font-bold focus:outline-none border-b border-white/10 pb-1" />
              ) : (
                <p className={valueClass}>{profile.phone}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow border border-brand-yellow/20"><MapPin className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className={labelClass}>Cidade / Estado</p>
              {isEditing ? (
                <div className="flex gap-2">
                  <input name="city" value={profile.city} onChange={handleChange} className="flex-1 text-white bg-transparent text-sm font-bold focus:outline-none border-b border-white/10 pb-1" />
                  <input name="state" value={profile.state} onChange={handleChange} className="w-12 text-white bg-transparent text-sm font-bold focus:outline-none border-b border-white/10 pb-1" />
                </div>
              ) : (
                <p className={valueClass}>
                  {profile.city || 'Não informado'}{profile.state ? `, ${profile.state}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow border border-brand-yellow/20"><Globe className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className={labelClass}>País de Residência</p>
              {isEditing ? (
                <input name="country" value={profile.country} onChange={handleChange} className="w-full text-white bg-transparent text-sm font-bold focus:outline-none border-b border-white/10 pb-1" />
              ) : (
                <p className={valueClass}>{profile.country}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-5 flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest text-xs rounded-[2rem] bg-white/5 border border-white/10 active:scale-95 transition-all shadow-xl"
      >
        <LogOut className="w-5 h-5 text-brand-yellow" />
        Sair da Conta
      </button>

      {profile?.tier && profile.tier !== 'free' && (
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-5 flex items-center justify-center gap-3 text-green-400 font-black uppercase tracking-widest text-xs rounded-[2rem] bg-green-500/5 border border-green-500/10 hover:bg-green-500 hover:text-white transition-all shadow-xl mt-4"
        >
          <MessageCircle className="w-5 h-5" />
          Suporte VIP Elite
        </a>
      )}

      <div className="flex justify-center gap-6 pt-8 pb-4 opacity-50">
        <Link to="/termos" className="text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors">Termos de Uso</Link>
        <Link to="/privacidade" className="text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors">Privacidade</Link>
      </div>
    </div>
  );
};

export default Profile;

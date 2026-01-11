
import React from 'react';
import { motion } from 'framer-motion';
import { Database, Copy, Check, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

const SQL_SCRIPT = `
-- 1. Reparo e Criação de Tabelas
DO $$ 
BEGIN
    -- profiles
    create table if not exists public.profiles (
        email text primary key,
        user_id uuid default auth.uid(),
        full_name text,
        updated_at timestamp with time zone default now()
    );

    -- Garantir coluna is_admin
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin boolean DEFAULT false;
    END IF;

    -- Garantir colunas de tier e dados
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='tier') THEN
        ALTER TABLE public.profiles ADD COLUMN tier text DEFAULT 'free';
    END IF;

    -- Garantir constraint UNIQUE no user_id (Necessário para post_likes e outras FKs)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
    END IF;

    -- checklists
    create table if not exists public.checklists (
        email text primary key references public.profiles(email) on delete cascade,
        user_id uuid default auth.uid(),
        items jsonb,
        updated_at timestamp with time zone default now()
    );

    -- guides (notícias)
    create table if not exists public.guides (
        id uuid default gen_random_uuid() primary key,
        title text not null,
        category text,
        excerpt text,
        content text,
        thumbnail text,
        read_time text,
        is_premium boolean default false,
        created_at timestamp with time zone default now()
    );

    -- tutorials
    create table if not exists public.tutorials (
        id uuid default gen_random_uuid() primary key,
        title text not null,
        instructor text,
        duration text,
        thumbnail text,
        youtube_id text,
        created_at timestamp with time zone default now()
    );

    -- Garantir coluna youtube_id caso a tabela já exista com video_url
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutorials' AND column_name='video_url') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutorials' AND column_name='youtube_id') THEN
            ALTER TABLE public.tutorials RENAME COLUMN video_url TO youtube_id;
        END IF;
    END IF;

    -- community_posts
    create table if not exists public.community_posts (
        id uuid default gen_random_uuid() primary key,
        user_id uuid,
        user_name text,
        user_avatar text,
        content text,
        category text,
        likes integer default 0,
        comments integer default 0,
        is_elite boolean default false,
        created_at timestamp with time zone default now()
    );

    -- community_comments
    create table if not exists public.community_comments (
        id uuid default gen_random_uuid() primary key,
        post_id uuid references public.community_posts(id) on delete cascade,
        user_id uuid,
        user_name text,
        user_avatar text,
        content text,
        created_at timestamp with time zone default now()
    );

    -- partners
    create table if not exists public.partners (
        id uuid default gen_random_uuid() primary key,
        name text not null,
        category text not null,
        description text,
        whatsapp text,
        site_url text,
        discount_code text,
        logo_url text,
        is_exclusive boolean default false,
        created_at timestamp with time zone default now()
    );

    -- notifications (NEW)
    create table if not exists public.notifications (
        id uuid default gen_random_uuid() primary key,
        title text not null,
        message text not null,
        type text default 'info',
        action_url text,
        created_at timestamp with time zone default now()
    );

    -- post_likes (NEW)
    create table if not exists public.post_likes (
        id uuid default gen_random_uuid() primary key,
        post_id uuid references public.community_posts(id) on delete cascade,
        user_id uuid references public.profiles(user_id) on delete cascade,
        created_at timestamp with time zone default now(),
        unique(post_id, user_id)
    );
END $$;

-- 2. Ativação de RLS
alter table public.profiles enable row level security;
alter table public.checklists enable row level security;
alter table public.guides enable row level security;
alter table public.tutorials enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.partners enable row level security;
alter table public.post_likes enable row level security;
alter table public.notifications enable row level security;

-- 3. Políticas de Segurança (Limpeza e Recriação)
DO $$ 
BEGIN
    -- Perfis e Checklists
    drop policy if exists "Users can manage own profile" on public.profiles;
    create policy "Users can manage own profile" on public.profiles for all using (auth.uid() = user_id);

    drop policy if exists "Users can manage own checklist" on public.checklists;
    drop policy if exists "Public Access Checklists for ALL" on public.checklists;
    create policy "Users can manage own checklist" on public.checklists for all using (auth.uid() = user_id);

    -- Guias
    drop policy if exists "Everyone can read guides" on public.guides;
    create policy "Everyone can read guides" on public.guides for select using (true);
    
    drop policy if exists "Admins can manage guides" on public.guides;
    create policy "Admins can manage guides" on public.guides for all using (
        exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true)
    ) with check (
        exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true)
    );

    -- Tutoriais
    drop policy if exists "Everyone can read tutorials" on public.tutorials;
    create policy "Everyone can read tutorials" on public.tutorials for select using (true);
    
    drop policy if exists "Admins can manage tutorials" on public.tutorials;
    create policy "Admins can manage tutorials" on public.tutorials for all using (
        exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true)
    ) with check (
        exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true)
    );

    -- Comunidade
    drop policy if exists "Everyone can read posts" on public.community_posts;
    create policy "Everyone can read posts" on public.community_posts for select using (true);

    drop policy if exists "Auth users can create posts" on public.community_posts;
    create policy "Auth users can create posts" on public.community_posts for insert with check (auth.role() = 'authenticated');

    drop policy if exists "Users can update own posts" on public.community_posts;
    create policy "Users can update own posts" on public.community_posts for update using (auth.uid() = user_id);

    drop policy if exists "Users can delete own posts" on public.community_posts;
    create policy "Users can delete own posts" on public.community_posts for delete using (auth.uid() = user_id);

    -- Comentários
    drop policy if exists "Everyone can read comments" on public.community_comments;
    create policy "Everyone can read comments" on public.community_comments for select using (true);

    drop policy if exists "Auth users can create comments" on public.community_comments;
    create policy "Auth users can create comments" on public.community_comments for insert with check (auth.role() = 'authenticated');

    drop policy if exists "Users can delete own comments" on public.community_comments;
    create policy "Users can delete own comments" on public.community_comments for delete using (auth.uid() = user_id);

    -- Parceiros
    drop policy if exists "Everyone can read partners" on public.partners;
    create policy "Everyone can read partners" on public.partners for select using (true);

    drop policy if exists "Admins can manage partners" on public.partners;
    create policy "Admins can manage partners" on public.partners for all using (
        exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true)
    ) with check (
        exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true)
    );

    -- Post Likes (NEW)
    drop policy if exists "Everyone can read likes" on public.post_likes;
    create policy "Everyone can read likes" on public.post_likes for select using (true);

    drop policy if exists "Users can manage own likes" on public.post_likes;
    create policy "Users can manage own likes" on public.post_likes for all using (auth.uid() = user_id);

    -- Notifications
    drop policy if exists "Everyone can read notifications" on public.notifications;
    create policy "Everyone can read notifications" on public.notifications for select using (true);

    drop policy if exists "Admins can manage notifications" on public.notifications;
    create policy "Admins can manage notifications" on public.notifications for all using (
        exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true)
    ) with check (
        exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true)
    );

    -- 🛡️ SEGURANÇA EXTRA: Proteção da coluna is_admin (Trigger)
    CREATE OR REPLACE FUNCTION public.protect_admin_column()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
            IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true) THEN
                NEW.is_admin := OLD.is_admin;
            END IF;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS on_profile_update_protect_admin ON public.profiles;
    CREATE TRIGGER on_profile_update_protect_admin
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_admin_column();

END $$;

-- 4. TORRNAR-SE ADMIN (OPCIONAL/MANUAL)
-- Descomente a linha abaixo e substitua pelo seu email para virar admin via SQL:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'seu-email@gmail.com';
`;

const DatabaseSetup: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-navy-950 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full bg-navy-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        <div className="p-8 md:p-10 border-b border-white/5 bg-navy-950/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Database className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-2">Reparo do Banco de Dados</h1>
              <p className="text-red-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Erro de Sincronização Detectado
              </p>
            </div>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            O aplicativo detectou que algumas tabelas ou permissões de administrador estão faltando no seu Supabase.
            Use o script abaixo para **reparar** o banco sem perder seus dados atuais.
          </p>
        </div>

        <div className="p-8 md:p-10 space-y-6 bg-black/20 overflow-y-auto max-h-[40vh] custom-scrollbar">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Script de Reparo (SQL)</label>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado!' : 'Copiar SQL'}
              </button>
            </div>
            <div className="relative">
              <pre className="w-full p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] text-blue-200 font-mono overflow-auto">
                {SQL_SCRIPT}
              </pre>
            </div>
          </div>
        </div>

        <div className="p-8 bg-brand-yellow/5 border-t border-white/5">
          <div className="flex gap-4 items-start">
            <div className="p-2 bg-brand-yellow/10 rounded-lg text-brand-yellow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold text-sm">Dica de Administrador:</h4>
              <p className="text-white/50 text-xs leading-relaxed">
                Para garantir que você tem permissão de criar tutoriais, após rodar o script,
                execute o comando <code>UPDATE public.profiles SET is_admin = true WHERE email = 'seu-email';</code> no SQL Editor.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-navy-950/50 flex justify-end gap-3">
          <button
            onClick={handleReload}
            className="px-8 py-4 bg-brand-yellow text-brand-dark rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-brand-yellow/10"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DatabaseSetup;

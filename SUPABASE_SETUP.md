# Supabase Setup Guide

This project does not currently have automatic migrations. To make the app work, you need to set up your Supabase project manually using the SQL script below.

## 1. Environment Variables

1.  Copy `.env.example` to `.env`.
2.  Fill in your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase Project Settings > API.

## 2. Database Schema (SQL)

Go to the **SQL Editor** in your Supabase Dashboard and run the following script to create all necessary tables and columns inferred from the codebase.

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  email text unique not null,
  full_name text,
  family_context text default 'solo',
  children_count int default 0,
  work_type text default 'employee',
  years_of_experience int default 0,
  phone text,
  city text,
  state text,
  country text,
  avatar_url text,
  tier text default 'free',
  is_admin boolean default false,
  subscribed_at timestamptz,
  target_amount numeric default 0,
  current_amount numeric default 0,
  monthly_required_income numeric default 0,
  currency text default '€',
  updated_at timestamptz default now()
);

-- 2. CHECKLISTS
create table if not exists public.checklists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  email text unique not null,
  items jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- 3. GUIDES
create table if not exists public.guides (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  image_url text,
  category text,
  content text,
  mins_read int,
  is_premium boolean default false,
  created_at timestamptz default now()
);

-- 4. TUTORIALS
create table if not exists public.tutorials (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  instructor text,
  duration text,
  thumbnail text,
  youtube_id text,
  is_dripped boolean default false,
  created_at timestamptz default now()
);

-- 5. COMMUNITY POSTS
create table if not exists public.community_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  user_name text,
  user_avatar text,
  content text,
  category text,
  is_elite boolean default false,
  likes int default 0,
  comments int default 0,
  created_at timestamptz default now()
);

-- 6. COMMUNITY COMMENTS
create table if not exists public.community_comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.community_posts on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  user_name text,
  user_avatar text,
  content text,
  created_at timestamptz default now()
);

-- 7. POST LIKES
create table if not exists public.post_likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.community_posts on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- 8. PARTNERS
create table if not exists public.partners (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  logo_url text,
  website_url text,
  category text,
  discount_code text,
  created_at timestamptz default now()
);

-- 9. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  message text,
  type text,
  action_url text,
  created_at timestamptz default now()
);

-- 10. QUIZ LEADS
create table if not exists public.quiz_leads (
    id uuid default gen_random_uuid() primary key,
    name text,
    email text,
    phone text,
    status text default 'started',
    result text,
    score integer,
    answers jsonb default '[]'::jsonb,
    user_id uuid,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- RLS Helper
alter table public.profiles enable row level security;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = user_id);

-- QUIZ LEADS Policies
alter table public.quiz_leads enable row level security;
drop policy if exists "Enable insert for all" on public.quiz_leads;
drop policy if exists "Enable read access for all" on public.quiz_leads;
drop policy if exists "Enable update for owners" on public.quiz_leads;

create policy "Enable insert for all" on public.quiz_leads for insert with check (true);
create policy "Enable read access for all" on public.quiz_leads for select using (true);
create policy "Enable update for owners" on public.quiz_leads for update using (true);

-- COLUNAS EXTRAS (CRITICAL FIX)
alter table public.quiz_leads add column if not exists criminal_record text;
alter table public.quiz_leads add column if not exists time_spain text;

-- 3. Security Definer Function (Guaranteed Save)
create or replace function public.complete_quiz_lead_v2(
  p_lead_id uuid,
  p_result text,
  p_score integer,
  p_answers jsonb,
  p_remote_work text,
  p_income_source text,
  p_job_tenure text,
  p_company_age text,
  p_family_config text,
  p_kids_count text,
  p_salary text,
  p_income_proof text,
  p_qualification text,
  p_criminal_record text,
  p_time_spain text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  updated_record jsonb;
begin
  update public.quiz_leads
  set 
    result = p_result,
    score = p_score,
    answers = p_answers,
    status = 'completed',
    updated_at = now(),
    remote_work = p_remote_work,
    income_source = p_income_source,
    job_tenure = p_job_tenure,
    company_age = p_company_age,
    family_config = p_family_config,
    kids_count = p_kids_count,
    salary = p_salary,
    income_proof = p_income_proof,
    qualification = p_qualification,
    criminal_record = p_criminal_record,
    time_spain = p_time_spain
  where id = p_lead_id
  returning to_jsonb(quiz_leads.*) into updated_record;

  return updated_record;
end;
$$;

-- GARANTIR PERMISSÕES DE EXECUÇÃO (CRÍTICO)
GRANT EXECUTE ON FUNCTION public.complete_quiz_lead_v2 TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.quiz_leads TO postgres, anon, authenticated, service_role;

-- Add more RLS policies as needed for other tables (public read, private write usually)
```

## 3. Edge Functions Configuration (Hotmart)

Para o webhook da Hotmart funcionar, configure os segredos:

```bash
npx supabase secrets set HOTMART_WEBHOOK_SECRET=seu_token
npx supabase secrets set HOTMART_PROD_MENSAL=id_produto_mensal
npx supabase secrets set HOTMART_PROD_ANUAL=id_produto_anual
npx supabase secrets set HOTMART_PROD_PRO=id_produto_pro
```

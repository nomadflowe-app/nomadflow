# Supabase Setup Guide

This project does not currently have automatic migrations. To make the app work, you need to set up your Supabase project manually using the SQL script below.

## 1. Environment Variables

1.  Copy `.env.example` to `.env`.
2.  Fill in your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase Project Settings > API.
3.  Fill in `VITE_STRIPE_PUBLIC_KEY` if you are using Stripe.

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

-- RLS Helper
alter table public.profiles enable row level security;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = user_id);

-- Add more RLS policies as needed for other tables (public read, private write usually)
```

## 3. Edge Functions Configuration (Stripe)

If you are using the `create-checkout` function and `stripe-webhook`:

1.  Navigate to your local project root.
2.  Login to Supabase CLI (if installed) or use the Dashboard to set secrets.
3.  Set the following secrets for your functions:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

*Note: You can find these keys in your Stripe Dashboard.*

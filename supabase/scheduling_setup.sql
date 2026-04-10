-- 11. CONSULTATION SLOTS
create table if not exists public.consultation_slots (
  id uuid default uuid_generate_v4() primary key,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_booked boolean default false,
  price numeric default 0,
  created_at timestamptz default now()
);

-- 12. CONSULTATION BOOKINGS
create table if not exists public.consultation_bookings (
  id uuid default uuid_generate_v4() primary key,
  slot_id uuid references public.consultation_slots on delete cascade,
  name text not null,
  email text not null,
  whatsapp text not null,
  payment_status text default 'pending', -- pending, paid, cancelled
  payment_id text, -- external reference from Kiwify/Stripe
  created_at timestamptz default now()
);

-- RLS for Consultation Slots
alter table public.consultation_slots enable row level security;
create policy "Allow public read for available slots" on public.consultation_slots
  for select using (not is_booked);
create policy "Allow admins full access to slots" on public.consultation_slots
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- RLS for Consultation Bookings
alter table public.consultation_bookings enable row level security;
create policy "Allow insert for anyone (booking flow)" on public.consultation_bookings
  for insert with check (true);
create policy "Allow admins full access to bookings" on public.consultation_bookings
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

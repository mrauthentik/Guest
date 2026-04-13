-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  HOREMOW GUEST HOUSE — Supabase Database Schema                 ║
-- ║  Run this SQL in your Supabase SQL Editor                       ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ── Enable UUID ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ══════════════════════════════════════════════════════════════════════════════
-- TABLES
-- ══════════════════════════════════════════════════════════════════════════════

-- ── profiles ──────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  full_name  text not null default '',
  phone      text not null default '',
  role       text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

-- ── rooms ─────────────────────────────────────────────────────────────────────
create table if not exists public.rooms (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  description      text not null default '',
  price_per_night  numeric(12,2) not null check (price_per_night > 0),
  capacity         integer not null default 2 check (capacity > 0),
  is_active        boolean not null default true,
  amenities        text[] default '{}',
  images           text[] default '{}',
  created_at       timestamptz not null default now()
);

-- ── bookings ──────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users on delete cascade,
  room_id           uuid not null references public.rooms on delete restrict,
  check_in_date     date not null,
  check_out_date    date not null,
  total_amount      numeric(12,2) not null,
  status            text not null default 'PENDING_PAYMENT'
                      check (status in (
                        'PENDING_PAYMENT','PAYMENT_UPLOADED','CONFIRMED',
                        'CHECKED_IN','CHECKED_OUT','CANCELLED'
                      )),
  booking_reference text not null unique,
  expires_at        timestamptz not null,
  created_at        timestamptz not null default now(),
  constraint valid_dates check (check_out_date > check_in_date)
);

-- ── payments ──────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id              uuid primary key default uuid_generate_v4(),
  booking_id      uuid not null references public.bookings on delete cascade,
  transaction_ref text not null,
  sender_name     text not null,
  proof_url       text not null default '',
  amount          numeric(12,2) not null,
  status          text not null default 'pending'
                    check (status in ('pending','verified','rejected')),
  created_at      timestamptz not null default now()
);

-- ── complaints ────────────────────────────────────────────────────────────────
create table if not exists public.complaints (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text not null,
  message     text not null,
  status      text not null default 'new'
                check (status in ('new','in_review','resolved')),
  admin_note  text,
  created_at  timestamptz not null default now()
);
-- ══════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════════════════════════
create index if not exists idx_bookings_user_id  on public.bookings(user_id);
create index if not exists idx_bookings_room_id  on public.bookings(room_id);
create index if not exists idx_bookings_status   on public.bookings(status);
create index if not exists idx_payments_booking  on public.payments(booking_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGER: auto-create profile on sign-up
-- ══════════════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone',     ''),
    'user'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.rooms     enable row level security;
alter table public.bookings  enable row level security;
alter table public.payments  enable row level security;

-- ── Helper: check admin role ──────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ──────────────────────────────────────────────────────────────────
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- ── rooms ─────────────────────────────────────────────────────────────────────
create policy "Anyone can view active rooms"
  on public.rooms for select
  using (is_active = true or public.is_admin());

create policy "Admins can manage rooms"
  on public.rooms for all
  using (public.is_admin());

-- ── bookings ──────────────────────────────────────────────────────────────────
create policy "Users can view own bookings"
  on public.bookings for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can create bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own pending bookings"
  on public.bookings for update
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins can manage all bookings"
  on public.bookings for all
  using (public.is_admin());

-- ── payments ──────────────────────────────────────────────────────────────────
create policy "Users can view own payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and (b.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users can insert payments"
  on public.payments for insert
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.user_id = auth.uid()
    )
  );

create policy "Admins can manage all payments"
  on public.payments for all
  using (public.is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- STORAGE: payment-proofs bucket
-- ══════════════════════════════════════════════════════════════════════════════
-- Run this separately if the bucket doesn't exist yet:
-- insert into storage.buckets (id, name, public) values ('payments', 'payments', true);

-- Storage policies (run after creating the bucket):
create policy "Authenticated users can upload proofs"
  on storage.objects for insert
  with check (bucket_id = 'payments' and auth.role() = 'authenticated');

create policy "Anyone can view proofs"
  on storage.objects for select
  using (bucket_id = 'payments');

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED DATA (optional — sample rooms)
-- ══════════════════════════════════════════════════════════════════════════════
insert into public.rooms (name, description, price_per_night, capacity, amenities) values
  (
    'Executive Suite',
    'Our flagship suite offering panoramic views, a king-size bed, and a private lounge area. Perfect for business executives and discerning travellers.',
    85000, 2,
    ARRAY['WiFi', 'AC', 'TV', 'Coffee', 'Bath', 'Parking']
  ),
  (
    'Deluxe Double Room',
    'Spacious and elegantly furnished with two queen beds, ideal for couples or small families seeking premium comfort.',
    55000, 3,
    ARRAY['WiFi', 'AC', 'TV', 'Coffee']
  ),
  (
    'Presidential Suite',
    'The pinnacle of luxury. A full apartment-style suite with separate living room, dining area, and breathtaking city views.',
    150000, 4,
    ARRAY['WiFi', 'AC', 'TV', 'Coffee', 'Bath', 'Parking', 'Gym']
  ),
  (
    'Standard Room',
    'A comfortable and well-appointed room ideal for solo travellers or short business stays. Value without compromise.',
    30000, 1,
    ARRAY['WiFi', 'AC', 'TV']
  ),
  (
    'Family Suite',
    'Thoughtfully designed for families, featuring separate sleeping areas, a sitting room, and all the amenities needed for a memorable stay.',
    95000, 6,
    ARRAY['WiFi', 'AC', 'TV', 'Coffee', 'Parking']
  ),
  (
    'Honeymoon Suite',
    'A romantic retreat with a jacuzzi, rose petal turndown service, and a champagne welcome. Start your forever in style.',
    120000, 2,
    ARRAY['WiFi', 'AC', 'TV', 'Coffee', 'Bath']
  )
on conflict do nothing;

-- ══════════════════════════════════════════════════════════════════════════════
-- ADMIN ACCOUNT SETUP
-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Go to your Supabase dashboard → Authentication → Users
--         Click "Add user" and create:
--           Email    : admin@horemow.com
--           Password : Horemow@Admin2026!
--
-- STEP 2: After creating the user, run the SQL below to grant admin role.
--         Replace the email if you used a different one.

update public.profiles
set role = 'admin',
    full_name = 'Horemow Admin',
    phone     = '+234 800 HOREMOW'
where id = (
  select id from auth.users where email = 'admin@horemow.com' limit 1
);

-- Verify it worked:
-- select id, full_name, role from public.profiles where role = 'admin';

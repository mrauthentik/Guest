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
  id               uuid primary key references auth.users on delete cascade,
  full_name        text not null default '',
  phone            text not null default '',
  role             text not null default 'user' check (role in ('user','admin','superadmin')),
  -- PM § 3.2 — Extended registration fields
  gender           text check (gender in ('male','female')),
  marital_status   text check (marital_status in ('single','married','widowed')),
  age_bracket      text check (age_bracket in ('18-25','26-35','36-45','46-55','56-65','65+')),
  nationality      text,
  residency_status text check (residency_status in ('foreigner','nigerian_resident')),
  health_status    text check (health_status in ('excellent','good','fair','with_disability','medical_support')),
  health_notes     text,
  special_requests text,
  created_at       timestamptz not null default now()
);

-- ── rooms ─────────────────────────────────────────────────────────────────────
-- PM § 4.1 — Foreigner / Nigerian-Resident category
create table if not exists public.rooms (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  description      text not null default '',
  price_per_night  numeric(12,2) not null check (price_per_night > 0),
  capacity         integer not null default 2 check (capacity > 0),
  is_active        boolean not null default true,
  amenities        text[] default '{}',
  images           text[] default '{}',
  category         text not null default 'both'
                     check (category in ('foreigner','nigerian_resident','both')),
  created_at       timestamptz not null default now()
);

-- ── bookings ──────────────────────────────────────────────────────────────────
-- PM § 5.2 — 3-Day Review Window; status expanded
create table if not exists public.bookings (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  room_id           uuid not null references public.rooms on delete restrict,
  check_in_date     date not null,
  check_out_date    date not null,
  total_amount      numeric(12,2) not null,
  status            text not null default 'PENDING_REVIEW'
                      check (status in (
                        'PENDING_REVIEW',
                        'APPROVED',
                        'REJECTED',
                        'PENDING_PAYMENT',
                        'PAYMENT_UPLOADED',
                        'CONFIRMED',
                        'CHECKED_IN',
                        'CHECKED_OUT',
                        'CANCELLED'
                      )),
  booking_reference text not null unique,
  review_expires_at timestamptz not null,  -- 72-hour review window
  expires_at        timestamptz not null,  -- payment deadline (after approval)
  admin_note        text,                  -- admin comment on approve/reject/modify
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

-- ── complaints / contact ──────────────────────────────────────────────────────
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

-- ── testimonials ──────────────────────────────────────────────────────────────
-- PM § 8 — Testimonies page
create table if not exists public.testimonials (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users on delete set null,
  guest_name text not null,
  rating     integer not null default 5 check (rating between 1 and 5),
  message    text not null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- MIGRATION HELPERS (safe to run on existing DB — adds only missing columns)
-- ══════════════════════════════════════════════════════════════════════════════

-- profiles — add extended fields if missing
alter table public.profiles add column if not exists gender           text check (gender in ('male','female','other'));
alter table public.profiles add column if not exists marital_status   text check (marital_status in ('single','married','divorced','widowed'));
alter table public.profiles add column if not exists age_bracket      text check (age_bracket in ('18-25','26-35','36-45','46-55','56-65','65+'));
alter table public.profiles add column if not exists nationality      text;
alter table public.profiles add column if not exists residency_status text check (residency_status in ('foreigner','nigerian_resident'));
alter table public.profiles add column if not exists health_status    text check (health_status in ('excellent','good','fair','with_disability','medical_support'));
alter table public.profiles add column if not exists health_notes     text;
alter table public.profiles add column if not exists special_requests text;

-- role — extend constraint to allow superadmin (run if constraint already exists)
-- alter table public.profiles drop constraint if exists profiles_role_check;
-- alter table public.profiles add constraint profiles_role_check check (role in ('user','admin','superadmin'));

-- rooms — add category column
alter table public.rooms add column if not exists category text not null default 'both'
  check (category in ('foreigner','nigerian_resident','both'));

-- bookings — extend status enum, add review window columns
alter table public.bookings add column if not exists review_expires_at timestamptz;
alter table public.bookings add column if not exists admin_note        text;

-- Update existing status constraint (drop + recreate is the Postgres way)
-- Only run this block if the constraint exists and needs updating:
-- alter table public.bookings drop constraint if exists bookings_status_check;
-- alter table public.bookings add constraint bookings_status_check
--   check (status in (
--     'PENDING_REVIEW','APPROVED','REJECTED',
--     'PENDING_PAYMENT','PAYMENT_UPLOADED','CONFIRMED',
--     'CHECKED_IN','CHECKED_OUT','CANCELLED'
--   ));

-- ══════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════════════════════════
create index if not exists idx_bookings_user_id        on public.bookings(user_id);
create index if not exists idx_bookings_room_id        on public.bookings(room_id);
create index if not exists idx_bookings_status         on public.bookings(status);
create index if not exists idx_bookings_review_expires on public.bookings(review_expires_at);
create index if not exists idx_payments_booking        on public.payments(booking_id);
create index if not exists idx_rooms_category          on public.rooms(category);
create index if not exists idx_testimonials_visible    on public.testimonials(is_visible);

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGER: auto-create profile on sign-up
-- ══════════════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, full_name, phone, role,
    gender, marital_status, age_bracket, nationality,
    residency_status, health_status, health_notes, special_requests
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',        ''),
    coalesce(new.raw_user_meta_data->>'phone',            ''),
    'user',
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'marital_status',
    new.raw_user_meta_data->>'age_bracket',
    new.raw_user_meta_data->>'nationality',
    new.raw_user_meta_data->>'residency_status',
    new.raw_user_meta_data->>'health_status',
    new.raw_user_meta_data->>'health_notes',
    new.raw_user_meta_data->>'special_requests'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ══════════════════════════════════════════════════════════════════════════════
-- AUTO-CONFIRM EDGE FUNCTION HELPER
-- PM § 5.2 — If no action within 72h → auto-confirm booking
-- (Call this via a Supabase scheduled Edge Function or pg_cron)
-- ══════════════════════════════════════════════════════════════════════════════
create or replace function public.auto_confirm_pending_bookings()
returns void
language plpgsql
security definer
as $$
begin
  -- Auto-confirm PENDING_REVIEW bookings whose 72h window has passed
  update public.bookings
  set status = 'CONFIRMED',
      admin_note = coalesce(admin_note, 'Auto-confirmed after 72-hour review window.')
  where status = 'PENDING_REVIEW'
    and review_expires_at < now();
end;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

alter table public.profiles     enable row level security;
alter table public.rooms        enable row level security;
alter table public.bookings     enable row level security;
alter table public.payments     enable row level security;
alter table public.complaints   enable row level security;
alter table public.testimonials enable row level security;

-- ── Helper: check admin role ──────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','superadmin')
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

-- ── testimonials ──────────────────────────────────────────────────────────────
create policy "Anyone can view visible testimonials"
  on public.testimonials for select
  using (is_visible = true or public.is_admin());

create policy "Authenticated users can add testimonials"
  on public.testimonials for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage testimonials"
  on public.testimonials for all
  using (public.is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- STORAGE: payment-proofs bucket
-- ══════════════════════════════════════════════════════════════════════════════
-- insert into storage.buckets (id, name, public) values ('payments', 'payments', true);

create policy "Authenticated users can upload proofs"
  on storage.objects for insert
  with check (bucket_id = 'payments' and auth.role() = 'authenticated');

create policy "Anyone can view proofs"
  on storage.objects for select
  using (bucket_id = 'payments');

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED DATA (optional — sample rooms with categories)
-- ══════════════════════════════════════════════════════════════════════════════
insert into public.rooms (name, description, price_per_night, capacity, amenities, category) values
  (
    'Executive Suite',
    'Our flagship suite offering panoramic views, a king-size bed, and a private lounge area. Perfect for business executives and discerning travellers.',
    85000, 2,
    ARRAY['WiFi', 'AC', 'TV', 'Coffee', 'Bath', 'Parking'],
    'both'
  ),
  (
    'Deluxe Double Room',
    'Spacious and elegantly furnished with two queen beds, ideal for couples or small families seeking premium comfort.',
    55000, 3,
    ARRAY['WiFi', 'AC', 'TV', 'Coffee'],
    'nigerian_resident'
  ),
  (
    'Presidential Suite',
    'The pinnacle of luxury. A full apartment-style suite with separate living room, dining area, and breathtaking views.',
    150000, 4,
    ARRAY['WiFi', 'AC', 'TV', 'Coffee', 'Bath', 'Parking', 'Gym'],
    'foreigner'
  ),
  (
    'Standard Room',
    'A comfortable and well-appointed room ideal for solo travellers or short business stays. Value without compromise.',
    30000, 1,
    ARRAY['WiFi', 'AC', 'TV'],
    'nigerian_resident'
  ),
  (
    'Family Suite',
    'Thoughtfully designed for families, featuring separate sleeping areas, a sitting room, and all essential amenities.',
    95000, 6,
    ARRAY['WiFi', 'AC', 'TV', 'Coffee', 'Parking'],
    'both'
  ),
  (
    'Honeymoon Suite',
    'A romantic retreat with a jacuzzi, rose petal turndown service, and a champagne welcome. Start your forever in style.',
    120000, 2,
    ARRAY['WiFi', 'AC', 'TV', 'Coffee', 'Bath'],
    'foreigner'
  )
on conflict do nothing;

-- ══════════════════════════════════════════════════════════════════════════════
-- ADMIN ACCOUNT SETUP
-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Supabase → Authentication → Users → Add user
--           Email    : admin@horemow.com
--           Password : Horemow@Admin2026!
--
-- STEP 2: Grant role
update public.profiles
set role = 'admin',
    full_name = 'Horemow Admin',
    phone     = '+234 800 HOREMOW'
where id = (
  select id from auth.users where email = 'admin@horemow.com' limit 1
);

-- Verify: select id, full_name, role from public.profiles where role = 'admin';

-- ==========================================
-- RLS (Row Level Security) POLICIES
-- ==========================================

-- Enable RLS on complaints and testimonials
alter table public.complaints enable row level security;

-- Complaints: Everyone can insert, only admins can read/update/delete
create policy "Allow public to insert complaints"
  on public.complaints for insert
  to public
  with check (true);

-- Assuming admin interface uses service_role key or we can create an admin read policy:
create policy "Allow full access to admins on complaints"
  on public.complaints for all
  using (
    auth.uid() in (select id from public.profiles where role = 'admin' or role = 'superadmin')
  );

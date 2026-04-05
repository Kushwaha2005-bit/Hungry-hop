-- ============================================================
--  HungryHop — Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── USERS ──────────────────────────────────────────────────
create table if not exists users (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text unique not null,
  phone       text,
  password    text not null,
  role        text default 'customer' check (role in ('customer', 'admin', 'restaurant')),
  status      text default 'active' check (status in ('active', 'inactive', 'vip', 'banned')),
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── ADDRESSES ──────────────────────────────────────────────
create table if not exists addresses (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references users(id) on delete cascade,
  label           text default 'Home' check (label in ('Home','Work','Other','Family','Friend')),
  line1           text not null,
  line2           text,
  city            text not null,
  pincode         text not null,
  lat             double precision,
  lng             double precision,
  delivery_notes  text,
  is_default      boolean default false,
  created_at      timestamptz default now()
);

-- ─── RESTAURANTS ────────────────────────────────────────────
create table if not exists restaurants (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  cuisine       text,
  description   text,
  logo          text,
  img_url       text,
  rating        numeric(2,1) default 4.5,
  review_count  int default 0,
  delivery_time text default '30-45 min',
  delivery_fee  int default 30,
  min_order     int default 199,
  distance      text,
  city          text,
  is_open       boolean default true,
  tags          text[],
  offer         text,
  created_at    timestamptz default now()
);

-- ─── CATEGORIES ─────────────────────────────────────────────
create table if not exists categories (
  id      serial primary key,
  name    text unique not null,
  emoji   text,
  count   int default 0
);

-- ─── FOOD ITEMS ─────────────────────────────────────────────
create table if not exists foods (
  id             serial primary key,
  name           text not null,
  category       text references categories(name),
  restaurant_id  uuid references restaurants(id) on delete cascade,
  price          int not null,
  old_price      int,
  rating         numeric(2,1) default 4.5,
  badge          text,
  badge_class    text,
  description    text,
  img_url        text,
  tags           text[],
  is_available   boolean default true,
  created_at     timestamptz default now()
);

-- ─── ORDERS ─────────────────────────────────────────────────
create table if not exists orders (
  id              text primary key,
  user_id         uuid references users(id),
  address_id      uuid references addresses(id),
  restaurant_id   uuid references restaurants(id),
  items           jsonb not null,
  subtotal        int not null,
  delivery_fee    int default 40,
  promo_discount  int default 0,
  promo_code      text,
  total           int not null,
  status          text default 'confirmed' check (status in ('confirmed','preparing','out-for-delivery','delivered','cancelled')),
  payment_method  text default 'online' check (payment_method in ('online','cod')),
  eta             text,
  rider_lat       double precision,
  rider_lng       double precision,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── ORDER STATUS HISTORY ───────────────────────────────────
create table if not exists order_status_history (
  id          serial primary key,
  order_id    text references orders(id) on delete cascade,
  status      text not null,
  note        text,
  created_at  timestamptz default now()
);

-- ─── FAVORITES ──────────────────────────────────────────────
create table if not exists favorites (
  id       serial primary key,
  user_id  uuid references users(id) on delete cascade,
  food_id  int references foods(id) on delete cascade,
  unique(user_id, food_id)
);

-- ─── PROMO CODES ────────────────────────────────────────────
create table if not exists promo_codes (
  id          serial primary key,
  code        text unique not null,
  discount    numeric(4,2) not null,
  type        text default 'percent' check (type in ('percent','fixed')),
  max_uses    int default 100,
  used_count  int default 0,
  is_active   boolean default true,
  expires_at  timestamptz,
  created_at  timestamptz default now()
);

-- ─── REVIEWS ────────────────────────────────────────────────
create table if not exists reviews (
  id             serial primary key,
  user_id        uuid references users(id),
  food_id        int references foods(id),
  restaurant_id  uuid references restaurants(id),
  order_id       text references orders(id),
  stars          int check (stars between 1 and 5),
  text           text,
  created_at     timestamptz default now()
);

-- ─── TRIGGERS: auto update updated_at ───────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger users_updated_at before update on users
  for each row execute function update_updated_at();
create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
alter table users       enable row level security;
alter table addresses   enable row level security;
alter table orders      enable row level security;
alter table favorites   enable row level security;

-- Users can only read/update their own data
create policy "users_own" on users for all using (id::text = current_setting('app.user_id', true));
create policy "addresses_own" on addresses for all using (user_id::text = current_setting('app.user_id', true));
create policy "orders_own" on orders for all using (user_id::text = current_setting('app.user_id', true));
create policy "favorites_own" on favorites for all using (user_id::text = current_setting('app.user_id', true));

-- ─── SEED: Categories ───────────────────────────────────────
insert into categories (name, emoji, count) values
  ('Pizza', '🍕', 45), ('Burgers', '🍔', 62), ('Noodles', '🍜', 38),
  ('Salads', '🥗', 29), ('Sushi', '🍣', 24), ('Tacos', '🌮', 31),
  ('Desserts', '🍦', 53), ('Drinks', '🥤', 47)
on conflict (name) do nothing;

-- ─── SEED: Promo Codes ──────────────────────────────────────
insert into promo_codes (code, discount, type) values
  ('HOP20', 0.20, 'percent'),
  ('SAVE10', 0.10, 'percent'),
  ('FEAST20', 0.20, 'percent')
on conflict (code) do nothing;

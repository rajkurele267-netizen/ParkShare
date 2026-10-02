-- =====================================================================
-- ParkShare database schema
-- Run this ONCE in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- It is safe to run again if something fails halfway (it is idempotent).
-- =====================================================================

create extension if not exists btree_gist;   -- needed to prevent overlapping bookings

-- ---------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  email       text not null,
  role        text not null default 'driver' check (role in ('driver', 'owner')),
  created_at  timestamptz not null default now()
);

create table if not exists public.parking_spaces (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  title           text not null check (char_length(title) between 3 and 100),
  description     text check (char_length(description) <= 2000),
  rules           text check (char_length(rules) <= 1000),
  address         text not null check (char_length(address) between 5 and 300),
  area            text not null check (char_length(area) between 2 and 100),
  city            text not null check (char_length(city) between 2 and 100),
  latitude        numeric(9,6) check (latitude between -90 and 90),
  longitude       numeric(9,6) check (longitude between -180 and 180),
  price_per_hour  numeric(8,2) not null check (price_per_hour > 0 and price_per_hour <= 10000),
  vehicle_type    text not null default 'car' check (vehicle_type in ('car', 'bike', 'suv', 'any')),
  available_from  time not null default '06:00',
  available_to    time not null default '22:00',
  image_url       text,
  is_available    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (available_from < available_to)
);

create index if not exists idx_spaces_owner      on public.parking_spaces (owner_id);
create index if not exists idx_spaces_city_area  on public.parking_spaces (lower(city), lower(area));
create index if not exists idx_spaces_available  on public.parking_spaces (is_available, created_at desc);
create index if not exists idx_spaces_price      on public.parking_spaces (price_per_hour);

create table if not exists public.bookings (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  parking_space_id  uuid not null references public.parking_spaces(id) on delete restrict,
  start_time        timestamptz not null,
  end_time          timestamptz not null,
  total_hours       numeric(6,2) not null check (total_hours > 0),
  total_amount      numeric(10,2) not null check (total_amount >= 0),
  status            text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  -- No payment provider yet. Stays 'payment_pending' until Razorpay/Stripe is integrated.
  payment_status    text not null default 'payment_pending' check (payment_status in ('payment_pending', 'payment_completed')),
  created_at        timestamptz not null default now(),
  check (end_time > start_time),
  -- Database-level guarantee: no two active bookings can overlap on the same space.
  constraint no_overlapping_bookings
    exclude using gist (parking_space_id with =, tstzrange(start_time, end_time) with &&)
    where (status <> 'cancelled')
);

create index if not exists idx_bookings_user   on public.bookings (user_id, start_time desc);
create index if not exists idx_bookings_space  on public.bookings (parking_space_id, start_time);

-- ---------------------------------------------------------------------
-- 2. TRIGGERS
-- ---------------------------------------------------------------------

-- Create a profile automatically whenever someone signs up.
-- Role comes from the sign-up form but is sanitised: anything except 'owner' becomes 'driver'.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'full_name', ''), 100),
    new.email,
    case when new.raw_user_meta_data->>'role' = 'owner' then 'owner' else 'driver' end
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_spaces_updated_at on public.parking_spaces;
create trigger trg_spaces_updated_at
  before update on public.parking_spaces
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. HELPER FUNCTIONS (security definer so RLS policies don't recurse)
-- ---------------------------------------------------------------------

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

create or replace function public.owns_space(p_space_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.parking_spaces where id = p_space_id and owner_id = auth.uid());
$$;

create or replace function public.has_booked(p_space_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.bookings where parking_space_id = p_space_id and user_id = auth.uid());
$$;

create or replace function public.is_customer_of_owner(p_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.bookings b
    join public.parking_spaces s on s.id = b.parking_space_id
    where b.user_id = p_user_id and s.owner_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.profiles        enable row level security;
alter table public.parking_spaces  enable row level security;
alter table public.bookings        enable row level security;

-- profiles: you see yourself; owners also see the people who booked their spaces.
drop policy if exists profiles_select_own       on public.profiles;
drop policy if exists profiles_select_customers on public.profiles;
drop policy if exists profiles_update_own       on public.profiles;
create policy profiles_select_own       on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_select_customers on public.profiles for select to authenticated using (public.is_customer_of_owner(id));
create policy profiles_update_own       on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Users may only ever change their name. Role, email and id can never be changed from the browser.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant  update (full_name)     on public.profiles to authenticated;

-- parking_spaces: public can read available spaces; owners manage only their own.
drop policy if exists spaces_select on public.parking_spaces;
drop policy if exists spaces_insert on public.parking_spaces;
drop policy if exists spaces_update on public.parking_spaces;
drop policy if exists spaces_delete on public.parking_spaces;
create policy spaces_select on public.parking_spaces for select to anon, authenticated
  using (is_available = true or owner_id = auth.uid() or public.has_booked(id));
create policy spaces_insert on public.parking_spaces for insert to authenticated
  with check (owner_id = auth.uid() and public.is_owner());
create policy spaces_update on public.parking_spaces for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_owner());
create policy spaces_delete on public.parking_spaces for delete to authenticated
  using (owner_id = auth.uid());

-- bookings: you see your own; owners see bookings on their spaces.
-- There is NO insert/update/delete policy: bookings are created and cancelled only
-- through the functions below, which validate everything on the server.
drop policy if exists bookings_select on public.bookings;
create policy bookings_select on public.bookings for select to authenticated
  using (user_id = auth.uid() or public.owns_space(parking_space_id));
revoke insert, update, delete on public.bookings from anon, authenticated;

-- ---------------------------------------------------------------------
-- 5. SAFE PUBLIC VIEWS / FUNCTIONS
-- ---------------------------------------------------------------------

-- Owner display name for spaces that are currently listed (no email, no other data).
create or replace view public.owner_public as
  select p.id, p.full_name
  from public.profiles p
  where p.role = 'owner'
    and exists (select 1 from public.parking_spaces s where s.owner_id = p.id and s.is_available);
grant select on public.owner_public to anon, authenticated;

-- Busy time slots for a space (no customer data), so the UI can warn about conflicts.
create or replace function public.busy_slots(p_space_id uuid)
returns table (start_time timestamptz, end_time timestamptz)
language sql stable security definer set search_path = public as $$
  select b.start_time, b.end_time
  from public.bookings b
  where b.parking_space_id = p_space_id and b.status = 'confirmed' and b.end_time > now()
  order by b.start_time;
$$;

-- ---------------------------------------------------------------------
-- 6. BOOKING FUNCTIONS (all validation + pricing happens here, on the server)
-- ---------------------------------------------------------------------

-- Times are interpreted in India Standard Time for the availability window.
create or replace function public.create_booking(p_space_id uuid, p_start timestamptz, p_end timestamptz)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_space   public.parking_spaces;
  v_hours   numeric;
  v_start_l timestamp;
  v_end_l   timestamp;
  v_booking public.bookings;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;

  select * into v_space from public.parking_spaces where id = p_space_id;
  if not found or not v_space.is_available then raise exception 'SPACE_UNAVAILABLE'; end if;
  if v_space.owner_id = auth.uid()          then raise exception 'OWN_SPACE'; end if;
  if p_end <= p_start                       then raise exception 'INVALID_TIME_RANGE'; end if;
  if p_start <= now()                       then raise exception 'START_IN_PAST'; end if;

  v_start_l := p_start at time zone 'Asia/Kolkata';
  v_end_l   := p_end   at time zone 'Asia/Kolkata';
  if v_start_l::date <> v_end_l::date then raise exception 'MUST_BE_SAME_DAY'; end if;
  if v_start_l::time < v_space.available_from or v_end_l::time > v_space.available_to then
    raise exception 'OUTSIDE_AVAILABILITY';
  end if;

  v_hours := round(extract(epoch from (p_end - p_start)) / 3600.0, 2);

  insert into public.bookings (user_id, parking_space_id, start_time, end_time, total_hours, total_amount)
  values (auth.uid(), p_space_id, p_start, p_end, v_hours, round(v_hours * v_space.price_per_hour, 2))
  returning * into v_booking;

  return v_booking;
exception
  when exclusion_violation then raise exception 'SLOT_TAKEN';
end $$;

-- Cancellation rule: you can cancel your own confirmed booking up to 2 hours before it starts.
create or replace function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_booking public.bookings;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;

  select * into v_booking from public.bookings where id = p_booking_id and user_id = auth.uid();
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
  if v_booking.status <> 'confirmed' then raise exception 'NOT_CANCELLABLE'; end if;
  if v_booking.start_time < now() + interval '2 hours' then raise exception 'TOO_LATE_TO_CANCEL'; end if;

  update public.bookings set status = 'cancelled' where id = p_booking_id returning * into v_booking;
  return v_booking;
end $$;

revoke all on function public.create_booking(uuid, timestamptz, timestamptz) from public, anon;
revoke all on function public.cancel_booking(uuid)                           from public, anon;
grant execute on function public.create_booking(uuid, timestamptz, timestamptz) to authenticated;
grant execute on function public.cancel_booking(uuid)                           to authenticated;
grant execute on function public.busy_slots(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 7. IMAGE STORAGE (bucket: parking-images)
-- Public read. Only owners can upload, and only into a folder named after their own user id.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('parking-images', 'parking-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists parking_images_insert on storage.objects;
drop policy if exists parking_images_select on storage.objects;
drop policy if exists parking_images_update on storage.objects;
drop policy if exists parking_images_delete on storage.objects;

create policy parking_images_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'parking-images' and (storage.foldername(name))[1] = auth.uid()::text and public.is_owner());
create policy parking_images_select on storage.objects for select to authenticated
  using (bucket_id = 'parking-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy parking_images_update on storage.objects for update to authenticated
  using (bucket_id = 'parking-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy parking_images_delete on storage.objects for delete to authenticated
  using (bucket_id = 'parking-images' and (storage.foldername(name))[1] = auth.uid()::text);

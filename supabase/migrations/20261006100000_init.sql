-- Fundi: core schema.
--
-- Security model
--   * Anyone (anon) can read active listings, their services and published reviews.
--   * A signed-in user can own at most one listing and edit only that listing.
--   * A signed-in user can leave one review per listing, never on their own listing.
--   * verified / rating / status columns can only be changed by admins (via RPC)
--     or by triggers, never directly by users. This is enforced with column-level
--     grants on top of row-level security.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.province as enum (
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
);

create type public.price_unit as enum ('fixed', 'from', 'per_hour', 'call_out', 'per_m2');

create type public.review_tag as enum ('on_time', 'tidy', 'fair_price', 'communication', 'quality', 'friendly');

create type public.listing_status as enum ('active', 'hidden');

create type public.review_status as enum ('published', 'hidden');

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user, created automatically)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 60),
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

create table public.categories (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  name text not null,
  description text not null default '',
  position int not null default 0
);

-- ---------------------------------------------------------------------------
-- Providers (listings)
-- ---------------------------------------------------------------------------

create table public.providers (
  id uuid primary key default gen_random_uuid(),
  -- Null for listings onboarded by the Fundi team that nobody has claimed yet.
  owner_id uuid default auth.uid() references auth.users (id) on delete set null,
  name text not null check (char_length(trim(name)) between 2 and 80),
  business_name text check (char_length(business_name) <= 80),
  bio text not null check (char_length(trim(bio)) between 20 and 1000),
  phone text not null check (phone ~ '^\+27[1-9][0-9]{8}$'),
  whatsapp text check (whatsapp ~ '^\+27[1-9][0-9]{8}$'),
  province public.province not null,
  city text not null check (char_length(trim(city)) between 2 and 60),
  suburbs text[] not null default '{}' check (cardinality(suburbs) <= 30),
  years_experience int not null default 0 check (years_experience between 0 and 70),
  available_24h boolean not null default false,
  photo_url text,
  verified boolean not null default false,
  status public.listing_status not null default 'active',
  rating_avg numeric(3, 2) not null default 0,
  rating_count int not null default 0,
  popia_consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index providers_one_per_owner on public.providers (owner_id) where owner_id is not null;
create index providers_city_idx on public.providers (province, city);

create table public.provider_categories (
  provider_id uuid not null references public.providers (id) on delete cascade,
  category_id text not null references public.categories (id),
  position int not null default 0,
  primary key (provider_id, category_id)
);

create index provider_categories_category_idx on public.provider_categories (category_id);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  category_id text not null references public.categories (id),
  name text not null check (char_length(trim(name)) between 2 and 80),
  price int not null check (price between 0 and 10000000),
  unit public.price_unit not null default 'fixed',
  position int not null default 0
);

create index services_provider_idx on public.services (provider_id);
create index services_category_name_idx on public.services (category_id, name);

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger providers_touch before update on public.providers
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  author_name text not null check (char_length(trim(author_name)) between 1 and 60),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(trim(comment)) between 10 and 2000),
  tags public.review_tag[] not null default '{}',
  photos text[] not null default '{}' check (cardinality(photos) <= 3),
  service_name text check (char_length(service_name) <= 80),
  price_paid int check (price_paid between 0 and 10000000),
  status public.review_status not null default 'published',
  created_at timestamptz not null default now(),
  -- One review per customer per fundi; they can edit it instead.
  unique (provider_id, author_id)
);

create index reviews_provider_idx on public.reviews (provider_id, created_at desc);

-- Fundis can't review themselves.
create function public.prevent_self_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.providers where id = new.provider_id and owner_id = new.author_id) then
    raise exception 'You can''t review your own listing' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger reviews_no_self_review before insert or update of provider_id, author_id on public.reviews
  for each row execute function public.prevent_self_review();

-- Keep providers.rating_avg / rating_count in sync with published reviews.
create function public.refresh_provider_rating(p_provider uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.providers p
  set rating_avg = coalesce(s.avg, 0),
      rating_count = coalesce(s.n, 0)
  from (
    select round(avg(rating)::numeric, 2) as avg, count(*)::int as n
    from public.reviews
    where provider_id = p_provider and status = 'published'
  ) s
  where p.id = p_provider;
$$;

create function public.reviews_after_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.refresh_provider_rating(old.provider_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.refresh_provider_rating(new.provider_id);
  end if;
  return null;
end;
$$;

create trigger reviews_rating_sync after insert or update or delete on public.reviews
  for each row execute function public.reviews_after_change();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.providers enable row level security;
alter table public.provider_categories enable row level security;
alter table public.services enable row level security;
alter table public.reviews enable row level security;

-- Profiles: you see and edit only your own.
create policy "Read own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "Update own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Categories: public read.
create policy "Anyone can read categories" on public.categories for select using (true);

-- Providers.
create policy "Anyone can read active listings" on public.providers for select
  using (status = 'active' or owner_id = auth.uid() or public.is_admin());
create policy "Users create their own listing" on public.providers for insert to authenticated
  with check (owner_id = auth.uid());
create policy "Owners update their listing" on public.providers for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners delete their listing" on public.providers for delete to authenticated
  using (owner_id = auth.uid());

create function public.owns_provider(p_provider uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.providers where id = p_provider and owner_id = auth.uid());
$$;

create function public.provider_visible(p_provider uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.providers
    where id = p_provider and (status = 'active' or owner_id = auth.uid() or public.is_admin())
  );
$$;

-- Provider categories and services follow their listing.
create policy "Read categories of visible listings" on public.provider_categories for select
  using (public.provider_visible(provider_id));
create policy "Owners manage their categories" on public.provider_categories for all to authenticated
  using (public.owns_provider(provider_id)) with check (public.owns_provider(provider_id));

create policy "Read services of visible listings" on public.services for select
  using (public.provider_visible(provider_id));
create policy "Owners manage their services" on public.services for all to authenticated
  using (public.owns_provider(provider_id)) with check (public.owns_provider(provider_id));

-- Reviews.
create policy "Read published reviews" on public.reviews for select
  using (status = 'published' or author_id = auth.uid() or public.is_admin());
create policy "Signed-in users write reviews" on public.reviews for insert to authenticated
  with check (author_id = auth.uid() and public.provider_visible(provider_id));
create policy "Authors edit their review" on public.reviews for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "Authors delete their review" on public.reviews for delete to authenticated
  using (author_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Grants (column-level, so users can't set protected columns)
-- ---------------------------------------------------------------------------

revoke all on public.profiles, public.categories, public.providers, public.provider_categories,
  public.services, public.reviews from anon, authenticated;

grant select on public.categories to anon, authenticated;

grant select (id, display_name, role, created_at) on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

grant select on public.providers to anon, authenticated;
grant insert (name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience,
  available_24h, photo_url) on public.providers to authenticated;
grant update (name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience,
  available_24h, photo_url) on public.providers to authenticated;
grant delete on public.providers to authenticated;

grant select on public.provider_categories, public.services to anon, authenticated;
grant insert, update, delete on public.provider_categories, public.services to authenticated;

grant select on public.reviews to anon, authenticated;
grant insert (provider_id, author_name, rating, comment, tags, photos, service_name, price_paid)
  on public.reviews to authenticated;
grant update (author_name, rating, comment, tags, photos, service_name, price_paid)
  on public.reviews to authenticated;
grant delete on public.reviews to authenticated;

-- ---------------------------------------------------------------------------
-- Read model for the app: one row per listing with everything a card needs.
-- security_invoker keeps the caller's row-level security in force.
-- ---------------------------------------------------------------------------

create view public.provider_listings with (security_invoker = true) as
select
  p.id,
  p.name,
  p.business_name,
  p.bio,
  p.phone,
  p.whatsapp,
  p.province,
  p.city,
  p.suburbs,
  p.years_experience,
  p.available_24h,
  p.photo_url,
  p.verified,
  p.status,
  p.rating_avg,
  p.rating_count,
  p.created_at,
  (p.owner_id is not null and p.owner_id = auth.uid()) as is_mine,
  coalesce(
    (select array_agg(pc.category_id order by pc.position, pc.category_id)
     from public.provider_categories pc where pc.provider_id = p.id),
    '{}'
  ) as category_ids,
  coalesce(
    (select jsonb_agg(
       jsonb_build_object('id', s.id, 'categoryId', s.category_id, 'name', s.name, 'price', s.price, 'unit', s.unit)
       order by s.position, s.name)
     from public.services s where s.provider_id = p.id),
    '[]'::jsonb
  ) as services,
  coalesce(
    (select jsonb_object_agg(t.tag, t.n)
     from (
       select unnest(r.tags) as tag, count(*) as n
       from public.reviews r
       where r.provider_id = p.id and r.status = 'published'
       group by 1
     ) t),
    '{}'::jsonb
  ) as tag_counts
from public.providers p;

grant select on public.provider_listings to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RPC: create or update the caller's listing in one transaction.
-- Runs with the caller's rights, so all policies and grants above apply.
-- ---------------------------------------------------------------------------

create function public.upsert_my_listing(listing jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_uid uuid := auth.uid();
  v_cat jsonb;
  v_svc jsonb;
  v_pos int := 0;
begin
  if v_uid is null then
    raise exception 'Sign in to save your listing' using errcode = 'insufficient_privilege';
  end if;
  if jsonb_array_length(coalesce(listing -> 'categoryIds', '[]')) = 0 then
    raise exception 'Choose at least one service category' using errcode = 'check_violation';
  end if;
  if jsonb_array_length(coalesce(listing -> 'services', '[]')) = 0 then
    raise exception 'Add at least one service with a price' using errcode = 'check_violation';
  end if;

  select id into v_id from public.providers where owner_id = v_uid;

  if v_id is null then
    insert into public.providers (name, business_name, bio, phone, whatsapp, province, city, suburbs,
      years_experience, available_24h, photo_url)
    values (
      listing ->> 'name',
      nullif(listing ->> 'businessName', ''),
      listing ->> 'bio',
      listing ->> 'phone',
      nullif(listing ->> 'whatsapp', ''),
      (listing ->> 'province')::public.province,
      listing ->> 'city',
      coalesce(array(select jsonb_array_elements_text(listing -> 'suburbs')), '{}'),
      coalesce((listing ->> 'yearsExperience')::int, 0),
      coalesce((listing ->> 'available24h')::boolean, false),
      nullif(listing ->> 'photoUrl', '')
    )
    returning id into v_id;
  else
    update public.providers set
      name = listing ->> 'name',
      business_name = nullif(listing ->> 'businessName', ''),
      bio = listing ->> 'bio',
      phone = listing ->> 'phone',
      whatsapp = nullif(listing ->> 'whatsapp', ''),
      province = (listing ->> 'province')::public.province,
      city = listing ->> 'city',
      suburbs = coalesce(array(select jsonb_array_elements_text(listing -> 'suburbs')), '{}'),
      years_experience = coalesce((listing ->> 'yearsExperience')::int, 0),
      available_24h = coalesce((listing ->> 'available24h')::boolean, false),
      photo_url = nullif(listing ->> 'photoUrl', '')
    where id = v_id;
  end if;

  delete from public.provider_categories where provider_id = v_id;
  for v_cat in select * from jsonb_array_elements(listing -> 'categoryIds') loop
    insert into public.provider_categories (provider_id, category_id, position)
    values (v_id, v_cat #>> '{}', v_pos);
    v_pos := v_pos + 1;
  end loop;

  delete from public.services where provider_id = v_id;
  v_pos := 0;
  for v_svc in select * from jsonb_array_elements(listing -> 'services') loop
    insert into public.services (provider_id, category_id, name, price, unit, position)
    values (
      v_id,
      v_svc ->> 'categoryId',
      trim(v_svc ->> 'name'),
      (v_svc ->> 'price')::int,
      (v_svc ->> 'unit')::public.price_unit,
      v_pos
    );
    v_pos := v_pos + 1;
  end loop;

  return v_id;
end;
$$;

revoke all on function public.upsert_my_listing(jsonb) from public, anon;
grant execute on function public.upsert_my_listing(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: admin moderation (verify a listing, hide a listing or review).
-- ---------------------------------------------------------------------------

create function public.admin_set_verified(p_provider uuid, p_verified boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = 'insufficient_privilege';
  end if;
  update public.providers set verified = p_verified where id = p_provider;
end;
$$;

create function public.admin_set_listing_status(p_provider uuid, p_status public.listing_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = 'insufficient_privilege';
  end if;
  update public.providers set status = p_status where id = p_provider;
end;
$$;

create function public.admin_set_review_status(p_review uuid, p_status public.review_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = 'insufficient_privilege';
  end if;
  update public.reviews set status = p_status where id = p_review;
end;
$$;

revoke all on function public.admin_set_verified(uuid, boolean) from public, anon;
revoke all on function public.admin_set_listing_status(uuid, public.listing_status) from public, anon;
revoke all on function public.admin_set_review_status(uuid, public.review_status) from public, anon;
grant execute on function public.admin_set_verified(uuid, boolean) to authenticated;
grant execute on function public.admin_set_listing_status(uuid, public.listing_status) to authenticated;
grant execute on function public.admin_set_review_status(uuid, public.review_status) to authenticated;

-- Internal helpers are not part of the API.
revoke all on function public.refresh_provider_rating(uuid) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

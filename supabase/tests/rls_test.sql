-- Security and behaviour tests for the Fundi schema.
-- Run after the stub, migrations and seed (see supabase/tests/run.sh).
-- Every check raises an exception on failure, so psql exits non-zero.

\set ON_ERROR_STOP 1
\set QUIET 1

create schema tests;
grant usage on schema tests to anon, authenticated;

-- Pass/fail log
create table tests.results (n serial, name text, ok boolean);
grant insert, select on tests.results to anon, authenticated;
grant usage on sequence tests.results_n_seq to anon, authenticated;

create function tests.ok(cond boolean, name text) returns void language plpgsql as $$
begin
  insert into tests.results (name, ok) values (name, coalesce(cond, false));
  if not coalesce(cond, false) then
    raise exception 'FAIL: %', name;
  end if;
end $$;

-- Runs q and passes only if it fails with the given SQLSTATE.
create function tests.fails(q text, code text, name text) returns void language plpgsql as $$
begin
  begin
    execute q;
  exception when others then
    if sqlstate = code then
      insert into tests.results (name, ok) values (name, true);
      return;
    end if;
    raise exception 'FAIL: % (expected %, got % %)', name, code, sqlstate, sqlerrm;
  end;
  raise exception 'FAIL: % (expected error %, but it succeeded)', name, code;
end $$;

create function tests.as_user(uid uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, false);
$$;
create function tests.as_anon() returns void language sql as $$
  select set_config('request.jwt.claims', '{"role":"anon"}', false);
$$;

grant execute on all functions in schema tests to anon, authenticated;

-- Test users (as Supabase Auth would create them).
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'alice@example.com'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'bongani@example.com'),
  ('cccccccc-0000-4000-8000-000000000003', 'admin@example.com');
update public.profiles set role = 'admin' where id = 'cccccccc-0000-4000-8000-000000000003';

select tests.ok((select count(*) from public.profiles) = 3, 'profile auto-created for each new user');

-- ---------------------------------------------------------------------------
-- Anonymous visitors
-- ---------------------------------------------------------------------------
set role anon;
select tests.as_anon();

select tests.ok((select count(*) from public.provider_listings) = 10, 'anon sees the 10 demo listings');
select tests.ok((select count(*) from public.categories) = 18, 'anon sees 18 categories');
select tests.ok(
  (select jsonb_array_length(services) from public.provider_listings where id = '00000000-0000-4000-8000-000000000001') = 4,
  'listing view bundles services');
select tests.ok(
  (select category_ids from public.provider_listings where id = '00000000-0000-4000-8000-000000000002') = array['electrician', 'solar'],
  'listing view keeps category order');
select tests.ok(not (select bool_or(is_mine) from public.provider_listings), 'anon owns nothing');
select tests.fails($$insert into public.providers (name, bio, phone, province, city) values ('Eve', 'I am trying to sneak in a listing', '+27820000099', 'Gauteng', 'Pretoria')$$,
  '42501', 'anon cannot create a listing');
select tests.fails($$select * from public.profiles$$, '42501', 'anon cannot read profiles');
select tests.fails($$select public.upsert_my_listing('{}'::jsonb)$$, '42501', 'anon cannot call upsert_my_listing');
select tests.fails($$insert into public.reviews (provider_id, author_name, rating, comment) values ('00000000-0000-4000-8000-000000000001', 'Anon', 5, 'Anonymous review attempt')$$,
  '42501', 'anon cannot write reviews');
select tests.fails($$select public.admin_set_verified('00000000-0000-4000-8000-000000000001', false)$$, '42501', 'anon cannot call admin RPC');

-- ---------------------------------------------------------------------------
-- Alice creates and edits her listing
-- ---------------------------------------------------------------------------
reset role;
set role authenticated;
select tests.as_user('aaaaaaaa-0000-4000-8000-000000000001');

select tests.ok((select role from public.profiles where id = auth.uid()) = 'customer', 'new users are customers');
select tests.ok((select count(*) from public.profiles) = 1, 'users only see their own profile');

create temp table alice as
select public.upsert_my_listing($json${
  "name": "Alice Mokoena",
  "businessName": "Alice Electrical",
  "bio": "Registered electrician, COCs and DB boards in Pretoria East.",
  "phone": "+27825550001",
  "whatsapp": "+27825550001",
  "province": "Gauteng",
  "city": "Pretoria",
  "suburbs": ["Lynnwood", "Menlyn"],
  "yearsExperience": 7,
  "available24h": true,
  "categoryIds": ["electrician", "solar"],
  "services": [
    {"categoryId": "electrician", "name": "Call-out fee", "price": 400, "unit": "call_out"},
    {"categoryId": "electrician", "name": "Certificate of Compliance (COC)", "price": 1900, "unit": "from"}
  ]
}$json$::jsonb) as id;

select tests.ok((select is_mine from public.provider_listings where id = (select id from alice)), 'new listing shows as mine');
select tests.ok((select verified from public.providers where id = (select id from alice)) = false, 'new listings start unverified');
select tests.ok((select count(*) from public.services where provider_id = (select id from alice)) = 2, 'services saved');

select tests.ok(
  public.upsert_my_listing($json${
    "name": "Alice Mokoena", "bio": "Registered electrician, COCs and DB boards in Pretoria East.",
    "phone": "+27825550001", "province": "Gauteng", "city": "Pretoria", "suburbs": [],
    "categoryIds": ["electrician"],
    "services": [{"categoryId": "electrician", "name": "Call-out fee", "price": 350, "unit": "call_out"}]
  }$json$::jsonb) = (select id from alice),
  'saving again updates the same listing (one per user)');
select tests.ok((select count(*) from public.services where provider_id = (select id from alice)) = 1, 'edit replaces services');
select tests.ok((select category_ids from public.provider_listings where id = (select id from alice)) = array['electrician'], 'edit replaces categories');
select tests.ok((select business_name from public.providers where id = (select id from alice)) is null, 'cleared business name is saved as empty');

select tests.fails($$select public.upsert_my_listing('{"name":"A","bio":"x","phone":"1","province":"Gauteng","city":"P","categoryIds":[],"services":[]}'::jsonb)$$,
  '23514', 'listing needs at least one category');
select tests.fails(
  $$select public.upsert_my_listing('{"name":"Alice","bio":"Registered electrician in Pretoria","phone":"0825550001","province":"Gauteng","city":"Pretoria","categoryIds":["electrician"],"services":[{"categoryId":"electrician","name":"Labour","price":300,"unit":"per_hour"}]}'::jsonb)$$,
  '23514', 'phone must be in +27 format');
select tests.fails(
  $$update public.providers set verified = true where owner_id = auth.uid()$$,
  '42501', 'owner cannot verify themselves');
select tests.fails(
  $$update public.providers set rating_avg = 5, rating_count = 99 where owner_id = auth.uid()$$,
  '42501', 'owner cannot fake their rating');
select tests.fails(
  $$update public.providers set owner_id = 'bbbbbbbb-0000-4000-8000-000000000002' where owner_id = auth.uid()$$,
  '42501', 'owner cannot hand listing to someone else');

update public.providers set name = 'Hijacked' where id = '00000000-0000-4000-8000-000000000001';
select tests.fails($$insert into public.services (provider_id, category_id, name, price) values ('00000000-0000-4000-8000-000000000001', 'plumber', 'Free plumbing', 0)$$,
  '42501', 'cannot add services to someone else''s listing');
select tests.fails($$update public.profiles set role = 'admin' where id = auth.uid()$$, '42501', 'users cannot make themselves admin');
update public.profiles set display_name = 'Alice M.' where id = auth.uid();
select tests.fails(
  $$insert into public.reviews (provider_id, author_name, rating, comment) select id, 'Alice', 5, 'I am the best electrician ever!' from alice$$,
  '23514', 'fundis cannot review their own listing');

reset role;
select tests.ok((select name from public.providers where id = '00000000-0000-4000-8000-000000000001') = 'Sipho Ndlovu', 'others'' listings cannot be edited');
select tests.ok((select display_name from public.profiles where id = 'aaaaaaaa-0000-4000-8000-000000000001') = 'Alice M.', 'users can set their display name');

-- ---------------------------------------------------------------------------
-- Bongani reviews Alice
-- ---------------------------------------------------------------------------
set role authenticated;
select tests.as_user('bbbbbbbb-0000-4000-8000-000000000002');

insert into public.reviews (provider_id, author_name, rating, comment, tags, service_name, price_paid)
select id, 'Bongani Z.', 4, 'Quick COC for our house sale, neat work.', array['on_time', 'tidy']::public.review_tag[], 'Certificate of Compliance (COC)', 1900
from alice;

select tests.ok((select rating_avg = 4 and rating_count = 1 from public.provider_listings where id = (select id from alice)), 'rating updates after a review');
select tests.ok((select tag_counts from public.provider_listings where id = (select id from alice)) = '{"on_time": 1, "tidy": 1}'::jsonb, 'tag counts in listing view');
select tests.fails(
  $$insert into public.reviews (provider_id, author_name, rating, comment) select id, 'Bongani again', 5, 'Second review to pump the score' from alice$$,
  '23505', 'one review per customer per fundi');
select tests.fails(
  $$insert into public.reviews (provider_id, author_id, author_name, rating, comment) select id, 'cccccccc-0000-4000-8000-000000000003', 'Fake', 5, 'Review posted as somebody else' from alice$$,
  '42501', 'cannot post a review as someone else');
select tests.fails(
  $$insert into public.reviews (provider_id, author_name, rating, comment, status) values ('00000000-0000-4000-8000-000000000003', 'B', 1, 'Trying to set status myself', 'hidden')$$,
  '42501', 'cannot choose review status');
select tests.fails(
  $$insert into public.reviews (provider_id, author_name, rating, comment) values ('00000000-0000-4000-8000-000000000003', 'B', 6, 'Six stars is not a thing')$$,
  '23514', 'rating must be 1-5');

update public.reviews set rating = 2 where author_id = auth.uid();
select tests.ok((select rating_avg from public.provider_listings where id = (select id from alice)) = 2, 'editing a review updates the rating');

-- Storage: own folder only.
insert into storage.objects (bucket_id, name) values ('photos', 'bbbbbbbb-0000-4000-8000-000000000002/job.jpg');
select tests.fails(
  $$insert into storage.objects (bucket_id, name) values ('photos', 'aaaaaaaa-0000-4000-8000-000000000001/sneaky.jpg')$$,
  '42501', 'cannot upload into someone else''s photo folder');
select tests.fails($$select public.admin_set_verified((select id from alice), true)$$, '42501', 'non-admins cannot verify');

-- ---------------------------------------------------------------------------
-- Admin moderation
-- ---------------------------------------------------------------------------
select tests.as_user('cccccccc-0000-4000-8000-000000000003');
select public.admin_set_verified((select id from alice), true);
select tests.ok((select verified from public.provider_listings where id = (select id from alice)), 'admin can verify a listing');
select public.admin_set_review_status((select r.id from public.reviews r join alice a on r.provider_id = a.id), 'hidden');
select tests.ok((select rating_count = 0 and rating_avg = 0 from public.provider_listings where id = (select id from alice)), 'hidden reviews drop out of the rating');
select public.admin_set_listing_status((select id from alice), 'hidden');

set role anon;
select tests.as_anon();
select tests.ok((select count(*) from public.provider_listings) = 10, 'hidden listing disappears for visitors');
select tests.ok((select count(*) from public.reviews) = 0, 'hidden review disappears for visitors');

reset role;
set role authenticated;
select tests.as_user('aaaaaaaa-0000-4000-8000-000000000001');
select tests.ok((select count(*) from public.provider_listings where is_mine) = 1, 'owner still sees their hidden listing');

select tests.as_user('bbbbbbbb-0000-4000-8000-000000000002');
select tests.ok((select count(*) from public.reviews where author_id = auth.uid()) = 1, 'author still sees their hidden review');
delete from public.reviews where author_id = auth.uid();
reset role;
select tests.ok((select count(*) from public.reviews) = 0, 'authors can delete their review');

\set QUIET 0
select count(*) filter (where ok) as passed, count(*) filter (where not ok) as failed from tests.results;

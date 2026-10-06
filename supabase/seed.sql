-- DEMO DATA ONLY: sample listings so you can try the app before real fundis sign up.
-- The names and phone numbers are made up. Remove them before launch with:
--   delete from public.providers where id::text like '00000000-0000-4000-8000-%';
-- No reviews are seeded: reviews must come from real signed-in customers.

insert into public.providers (id, owner_id, name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience, available_24h, verified)
values ('00000000-0000-4000-8000-000000000001', null, 'Sipho Ndlovu', 'Ndlovu Plumbing', 'Qualified plumber with 12 years experience. Geyser specialist, PIRB registered. Fast response across the East Rand.', '+27820000001', '+27820000001', 'Gauteng', 'Johannesburg', array['Bedfordview', 'Edenvale', 'Germiston']::text[], 12, true, true)
on conflict (id) do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000001', 'plumber', 0) on conflict do nothing;
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000001', 'plumber', 'Call-out fee', 450, 'call_out', 0 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000001' and name = 'Call-out fee');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000001', 'plumber', 'Geyser replacement (150L)', 7800, 'from', 1 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000001' and name = 'Geyser replacement (150L)');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000001', 'plumber', 'Blocked drain', 650, 'from', 2 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000001' and name = 'Blocked drain');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000001', 'plumber', 'Labour', 380, 'per_hour', 3 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000001' and name = 'Labour');

insert into public.providers (id, owner_id, name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience, available_24h, verified)
values ('00000000-0000-4000-8000-000000000002', null, 'Johan van der Merwe', 'JVM Electrical', 'Registered electrical contractor. COCs for home sales, DB board upgrades and fault finding.', '+27830000002', '+27830000002', 'Gauteng', 'Pretoria', array['Centurion', 'Menlyn', 'Garsfontein']::text[], 18, false, true)
on conflict (id) do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000002', 'electrician', 0) on conflict do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000002', 'solar', 1) on conflict do nothing;
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000002', 'electrician', 'Call-out fee', 500, 'call_out', 0 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000002' and name = 'Call-out fee');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000002', 'electrician', 'Certificate of Compliance (COC)', 2200, 'from', 1 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000002' and name = 'Certificate of Compliance (COC)');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000002', 'electrician', 'DB board upgrade', 4500, 'from', 2 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000002' and name = 'DB board upgrade');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000002', 'solar', '5kW inverter install (labour)', 6500, 'fixed', 3 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000002' and name = '5kW inverter install (labour)');

insert into public.providers (id, owner_id, name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience, available_24h, verified)
values ('00000000-0000-4000-8000-000000000003', null, 'Ayesha Patel', 'Sparkle Clean Co.', 'Reliable, vetted cleaning teams for homes and offices. Move-in/move-out deep cleans are our speciality.', '+27840000003', '+27840000003', 'KwaZulu-Natal', 'Durban', array['Umhlanga', 'Westville', 'Durban North']::text[], 7, false, true)
on conflict (id) do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000003', 'cleaner', 0) on conflict do nothing;
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000003', 'cleaner', 'Standard home clean (3 bed)', 650, 'fixed', 0 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000003' and name = 'Standard home clean (3 bed)');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000003', 'cleaner', 'Deep clean / move-out', 1800, 'from', 1 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000003' and name = 'Deep clean / move-out');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000003', 'cleaner', 'Carpet cleaning', 45, 'per_m2', 2 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000003' and name = 'Carpet cleaning');

insert into public.providers (id, owner_id, name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience, available_24h, verified)
values ('00000000-0000-4000-8000-000000000004', null, 'Thabo Mokoena', null, 'Handyman for all those small jobs: shelves, TV mounting, furniture assembly, minor plumbing and painting.', '+27710000004', '+27710000004', 'Gauteng', 'Johannesburg', array['Soweto', 'Randburg', 'Roodepoort']::text[], 5, false, false)
on conflict (id) do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000004', 'handyman', 0) on conflict do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000004', 'painter', 1) on conflict do nothing;
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000004', 'handyman', 'Labour', 250, 'per_hour', 0 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000004' and name = 'Labour');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000004', 'handyman', 'TV wall mount', 450, 'fixed', 1 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000004' and name = 'TV wall mount');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000004', 'painter', 'Interior painting', 65, 'per_m2', 2 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000004' and name = 'Interior painting');

insert into public.providers (id, owner_id, name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience, available_24h, verified)
values ('00000000-0000-4000-8000-000000000005', null, 'Riaan Botha', 'Cape Solar Solutions', 'Beat load-shedding for good. Full solar, inverter and lithium battery installs with SSEG registration.', '+27820000005', '+27820000005', 'Western Cape', 'Cape Town', array['Durbanville', 'Bellville', 'Brackenfell']::text[], 9, false, true)
on conflict (id) do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000005', 'solar', 0) on conflict do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000005', 'electrician', 1) on conflict do nothing;
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000005', 'solar', 'Site assessment', 0, 'fixed', 0 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000005' and name = 'Site assessment');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000005', 'solar', '5kW hybrid system (supply & install)', 68000, 'from', 1 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000005' and name = '5kW hybrid system (supply & install)');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000005', 'solar', '5kW inverter install (labour)', 5800, 'fixed', 2 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000005' and name = '5kW inverter install (labour)');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000005', 'electrician', 'Call-out fee', 550, 'call_out', 3 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000005' and name = 'Call-out fee');

insert into public.providers (id, owner_id, name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience, available_24h, verified)
values ('00000000-0000-4000-8000-000000000006', null, 'Lerato Dlamini', 'GreenThumb Gardens', 'Weekly garden maintenance, lawn care and garden refuse removal. Own equipment and transport.', '+27720000006', null, 'Western Cape', 'Cape Town', array['Claremont', 'Rondebosch', 'Constantia']::text[], 6, false, false)
on conflict (id) do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000006', 'gardener', 0) on conflict do nothing;
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000006', 'gardener', 'Weekly garden service', 380, 'fixed', 0 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000006' and name = 'Weekly garden service');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000006', 'gardener', 'Refuse removal (bakkie load)', 550, 'fixed', 1 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000006' and name = 'Refuse removal (bakkie load)');

insert into public.providers (id, owner_id, name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience, available_24h, verified)
values ('00000000-0000-4000-8000-000000000007', null, 'Kevin Naidoo', 'Rapid Response Plumbing', '24/7 emergency plumbing across Durban. Burst pipes, geysers and leak detection.', '+27830000007', '+27830000007', 'KwaZulu-Natal', 'Durban', array['Chatsworth', 'Pinetown', 'Umhlanga']::text[], 10, true, true)
on conflict (id) do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000007', 'plumber', 0) on conflict do nothing;
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000007', 'plumber', 'Call-out fee', 395, 'call_out', 0 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000007' and name = 'Call-out fee');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000007', 'plumber', 'Geyser replacement (150L)', 7200, 'from', 1 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000007' and name = 'Geyser replacement (150L)');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000007', 'plumber', 'Leak detection', 950, 'from', 2 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000007' and name = 'Leak detection');

insert into public.providers (id, owner_id, name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience, available_24h, verified)
values ('00000000-0000-4000-8000-000000000008', null, 'Pieter Smit', 'SecureGate Motors', 'Centurion, ET and Gemini gate motor specialists. Same-day repairs and battery replacements.', '+27840000008', '+27840000008', 'Gauteng', 'Pretoria', array['Moreleta Park', 'Faerie Glen', 'Lynnwood']::text[], 14, true, true)
on conflict (id) do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000008', 'gate-motor', 0) on conflict do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000008', 'locksmith', 1) on conflict do nothing;
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000008', 'gate-motor', 'Call-out fee', 420, 'call_out', 0 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000008' and name = 'Call-out fee');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000008', 'gate-motor', 'Gate motor battery replacement', 650, 'fixed', 1 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000008' and name = 'Gate motor battery replacement');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000008', 'gate-motor', 'New sliding gate motor installed', 6900, 'from', 2 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000008' and name = 'New sliding gate motor installed');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000008', 'locksmith', 'Lockout', 600, 'from', 3 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000008' and name = 'Lockout');

insert into public.providers (id, owner_id, name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience, available_24h, verified)
values ('00000000-0000-4000-8000-000000000009', null, 'Nomvula Khumalo', null, 'Electrician in Gqeberha. Small domestic jobs, plugs, lights, geyser elements and COCs.', '+27720000009', '+27720000009', 'Eastern Cape', 'Gqeberha', array['Summerstrand', 'Walmer', 'Newton Park']::text[], 8, false, true)
on conflict (id) do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000009', 'electrician', 0) on conflict do nothing;
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000009', 'electrician', 'Call-out fee', 380, 'call_out', 0 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000009' and name = 'Call-out fee');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000009', 'electrician', 'Certificate of Compliance (COC)', 1800, 'from', 1 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000009' and name = 'Certificate of Compliance (COC)');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000009', 'electrician', 'Labour', 350, 'per_hour', 2 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000009' and name = 'Labour');

insert into public.providers (id, owner_id, name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience, available_24h, verified)
values ('00000000-0000-4000-8000-000000000010', null, 'Bongani Zulu', 'BZ Pest Control', 'SAPCA-registered pest control. Termites, rodents, bed bugs and cockroaches. Pet-safe options.', '+27830000010', null, 'Gauteng', 'Johannesburg', array['Sandton', 'Fourways', 'Midrand']::text[], 11, false, false)
on conflict (id) do nothing;
insert into public.provider_categories (provider_id, category_id, position) values ('00000000-0000-4000-8000-000000000010', 'pest-control', 0) on conflict do nothing;
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000010', 'pest-control', 'Cockroach treatment (house)', 750, 'from', 0 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000010' and name = 'Cockroach treatment (house)');
insert into public.services (provider_id, category_id, name, price, unit, position) select '00000000-0000-4000-8000-000000000010', 'pest-control', 'Termite treatment', 2500, 'from', 1 where not exists (select 1 from public.services where provider_id = '00000000-0000-4000-8000-000000000010' and name = 'Termite treatment');


-- Service categories. Keep in sync with web/src/data/categories.ts.
insert into public.categories (id, name, description, position) values
  ('plumber', 'Plumber', 'Leaks, geysers, blocked drains, bathrooms', 0),
  ('electrician', 'Electrician', 'Wiring, DB boards, COCs, fault finding', 1),
  ('solar', 'Solar & Inverters', 'Panels, inverters, batteries, backup power', 2),
  ('handyman', 'Handyman', 'Odd jobs, repairs, assembly, mounting', 3),
  ('painter', 'Painter', 'Interior, exterior, waterproofing', 4),
  ('builder', 'Builder', 'Extensions, renovations, paving, walls', 5),
  ('gate-motor', 'Gate Motors & Garage Doors', 'Installs, repairs, remotes, batteries', 6),
  ('locksmith', 'Locksmith', 'Lockouts, new locks, safes, security gates', 7),
  ('gardener', 'Garden Services', 'Lawns, trimming, refuse removal, landscaping', 8),
  ('cleaner', 'Cleaning', 'Home cleaning, carpets, move-in/out', 9),
  ('pest-control', 'Pest Control', 'Termites, rodents, cockroaches, fumigation', 10),
  ('pool', 'Pool Services', 'Cleaning, pumps, repairs, green pools', 11),
  ('aircon', 'Aircon & Refrigeration', 'Installs, servicing, regassing', 12),
  ('roofer', 'Roofing', 'Leaks, tiles, gutters, waterproofing', 13),
  ('appliance', 'Appliance Repair', 'Fridges, washing machines, stoves', 14),
  ('dstv', 'DSTV & TV Installers', 'Dish installs, aligning, TV mounting', 15),
  ('movers', 'Movers', 'Home & office moves, bakkie hire', 16),
  ('carpenter', 'Carpenter', 'Cupboards, doors, decking, kitchens', 17)
on conflict (id) do update set name = excluded.name, description = excluded.description, position = excluded.position;

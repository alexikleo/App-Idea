// Generates supabase/seed.sql (demo listings) from web/src/data/mockProviders.ts.
// Run: node --experimental-strip-types scripts/generate-seed.mts
import { writeFileSync } from 'node:fs'
import { MOCK_PROVIDERS } from '../web/src/data/mockProviders.ts'

const q = (v: string | undefined | null) => (v == null || v === '' ? 'null' : `'${v.replace(/'/g, "''")}'`)
const arr = (xs: string[]) => `array[${xs.map(q).join(', ')}]::text[]`

// Stable UUIDs so the seed can be re-run and cleaned up.
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

let sql = `-- DEMO DATA ONLY: sample listings so you can try the app before real fundis sign up.
-- The names and phone numbers are made up. Remove them before launch with:
--   delete from public.providers where id::text like '00000000-0000-4000-8000-%';
-- No reviews are seeded: reviews must come from real signed-in customers.

`
MOCK_PROVIDERS.forEach((p, i) => {
  const id = uuid(i + 1)
  sql += `insert into public.providers (id, owner_id, name, business_name, bio, phone, whatsapp, province, city, suburbs, years_experience, available_24h, verified)
values ('${id}', null, ${q(p.name)}, ${q(p.businessName)}, ${q(p.bio)}, ${q(p.phone)}, ${q(p.whatsapp)}, ${q(p.location.province)}, ${q(p.location.city)}, ${arr(p.location.suburbs)}, ${p.yearsExperience}, ${p.available24h}, ${p.verified})
on conflict (id) do nothing;
`
  p.categoryIds.forEach((c, pos) => {
    sql += `insert into public.provider_categories (provider_id, category_id, position) values ('${id}', ${q(c)}, ${pos}) on conflict do nothing;\n`
  })
  p.services.forEach((s, pos) => {
    sql += `insert into public.services (provider_id, category_id, name, price, unit, position) select '${id}', ${q(s.categoryId)}, ${q(s.name)}, ${s.price}, ${q(s.unit)}, ${pos} where not exists (select 1 from public.services where provider_id = '${id}' and name = ${q(s.name)});\n`
  })
  sql += '\n'
})
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql)
console.log(`Wrote ${MOCK_PROVIDERS.length} demo listings to supabase/seed.sql`)

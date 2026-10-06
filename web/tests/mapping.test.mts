// Checks the app's database mapping against real rows captured from Postgres
// (supabase/tests/fixtures/listings.json, produced by the migration tests).
// Run: npm run test:unit
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { rowToProvider, rowToReview, toListingPayload, topTagsFrom } from '../src/lib/data/mapping.ts'

const fixture = JSON.parse(readFileSync(new URL('../../supabase/tests/fixtures/listings.json', import.meta.url), 'utf8'))

test('listing row maps to a provider', () => {
  const p = rowToProvider(fixture.listings[0])
  assert.equal(p.businessName, 'Ndlovu Plumbing')
  assert.equal(p.phone, '+27820000001')
  assert.deepEqual(p.location, { province: 'Gauteng', city: 'Johannesburg', suburbs: ['Bedfordview', 'Edenvale', 'Germiston'] })
  assert.deepEqual(p.categoryIds, ['plumber'])
  assert.equal(p.services.length, 4)
  assert.deepEqual(Object.keys(p.services[0]).sort(), ['categoryId', 'id', 'name', 'price', 'unit'])
  assert.equal(typeof p.services[0].price, 'number')
  assert.equal(p.ratingAvg, 5)
  assert.equal(p.ratingCount, 1)
  assert.deepEqual([...p.topTags].sort(), ['on_time', 'quality'])
  assert.equal(p.isMine, false)
  assert.match(p.joinedAt, /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(p.photoUrl, undefined)
})

test('listing without reviews or WhatsApp', () => {
  const p = rowToProvider(fixture.listings[1])
  assert.equal(p.ratingCount, 0)
  assert.deepEqual(p.topTags, [])
  assert.deepEqual(p.categoryIds, ['electrician', 'solar'])
})

test('review row maps and knows who wrote it', () => {
  const row = fixture.reviews[0]
  const r = rowToReview(row, row.author_id)
  assert.equal(r.authorName, 'Megan R.')
  assert.equal(r.rating, 5)
  assert.deepEqual(r.tags, ['on_time', 'quality'])
  assert.equal(r.photos?.length, 1)
  assert.equal(r.pricePaid, 7900)
  assert.equal(r.isMine, true)
  assert.equal(rowToReview(row, 'someone-else').isMine, false)
  assert.equal(rowToReview(row).isMine, false)
})

test('numeric ratings arriving as strings still work', () => {
  const p = rowToProvider({ ...fixture.listings[0], rating_avg: '4.50' })
  assert.equal(p.ratingAvg, 4.5)
})

test('top tags need 2+ mentions once a fundi has several reviews', () => {
  assert.deepEqual(topTagsFrom({ tidy: 1, on_time: 3, quality: 2 }, 5), ['on_time', 'quality'])
  assert.deepEqual(topTagsFrom({ tidy: 1 }, 1), ['tidy'])
})

test('listing payload matches what upsert_my_listing reads', () => {
  const payload = toListingPayload({
    name: 'Alice',
    bio: 'Registered electrician in Pretoria East.',
    phone: '+27825550001',
    categoryIds: ['electrician'],
    services: [{ categoryId: 'electrician', name: 'Call-out fee', price: 400, unit: 'call_out' }],
    location: { province: 'Gauteng', city: 'Pretoria', suburbs: ['Lynnwood'] },
    yearsExperience: 7,
    available24h: true,
  })
  // Keys the SQL function reads with listing ->> '...'
  for (const key of ['name', 'businessName', 'bio', 'phone', 'whatsapp', 'province', 'city', 'suburbs', 'yearsExperience', 'available24h', 'photoUrl', 'categoryIds', 'services'])
    assert.ok(key in payload, `payload has ${key}`)
  assert.equal(payload.businessName, '')
  assert.deepEqual(payload.services[0], { categoryId: 'electrician', name: 'Call-out fee', price: 400, unit: 'call_out' })
})

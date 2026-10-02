// Data access layer. Every UI read/write goes through these async functions so
// the in-memory mock can later be replaced by real API/Supabase calls (Phase 2
// in /PLAN.md) without touching components.

import { MOCK_PROVIDERS, MOCK_REVIEWS } from '../data/mockProviders'
import type { Province, Provider, ProviderSearch, Review, ReviewTag, ServiceOffering } from '../types'

const STORAGE_KEY = 'fundi:local-data:v1'

type SeedProvider = Omit<Provider, 'ratingAvg' | 'ratingCount' | 'topTags'>

interface LocalData {
  providers: SeedProvider[]
  reviews: Review[]
}

function loadLocal(): LocalData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as LocalData
  } catch {
    // Storage unavailable or corrupt: fall back to empty.
  }
  return { providers: [], reviews: [] }
}

function saveLocal(data: LocalData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    // Storage full or unavailable; data just won't persist across reloads.
    return false
  }
}

const local = loadLocal()

function allReviews(): Review[] {
  return [...MOCK_REVIEWS, ...local.reviews]
}

function allProviders(): Provider[] {
  const reviews = allReviews()
  return [...MOCK_PROVIDERS, ...local.providers].map((p) => {
    const mine = reviews.filter((r) => r.providerId === p.id)
    const ratingCount = mine.length
    const ratingAvg = ratingCount ? mine.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0
    const tagCounts = new Map<ReviewTag, number>()
    for (const tag of mine.flatMap((r) => r.tags ?? [])) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    const topTags = [...tagCounts.entries()]
      .filter(([, n]) => n >= 2 || ratingCount <= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag)
    return { ...p, ratingAvg, ratingCount, topTags }
  })
}

/** Simulate network latency so loading states are exercised. */
const delay = <T,>(value: T, ms = 150) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))

/** Lowest non-zero price a provider charges, optionally within one category. */
export function startingPrice(provider: Provider, categoryId?: string): ServiceOffering | undefined {
  return provider.services
    .filter((s) => s.price > 0 && (!categoryId || s.categoryId === categoryId))
    .sort((a, b) => a.price - b.price)[0]
}

export async function listProviders(search: ProviderSearch = {}): Promise<Provider[]> {
  const q = search.query?.trim().toLowerCase()
  let results = allProviders().filter((p) => {
    if (search.categoryId && !p.categoryIds.includes(search.categoryId)) return false
    if (search.province && p.location.province !== search.province) return false
    if (search.city && p.location.city !== search.city) return false
    if (search.minRating && p.ratingAvg < search.minRating) return false
    if (search.maxPrice) {
      const start = startingPrice(p, search.categoryId)
      if (!start || start.price > search.maxPrice) return false
    }
    if (q) {
      const haystack = [
        p.name,
        p.businessName,
        p.bio,
        p.location.city,
        ...p.location.suburbs,
        ...p.services.map((s) => s.name),
        ...p.categoryIds,
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  const price = (p: Provider) => startingPrice(p, search.categoryId)?.price ?? Infinity
  switch (search.sort ?? 'rating') {
    case 'rating':
      results = results.sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount)
      break
    case 'reviews':
      results = results.sort((a, b) => b.ratingCount - a.ratingCount)
      break
    case 'price_low':
      results = results.sort((a, b) => price(a) - price(b))
      break
    case 'price_high':
      results = results.sort((a, b) => price(b) - price(a))
      break
  }
  return delay(results)
}

export async function getProvider(id: string): Promise<Provider | undefined> {
  return delay(allProviders().find((p) => p.id === id))
}

export async function listReviews(providerId: string): Promise<Review[]> {
  return delay(
    allReviews()
      .filter((r) => r.providerId === providerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )
}

export async function addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  const created: Review = {
    ...review,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString().slice(0, 10),
  }
  local.reviews.push(created)
  if (!saveLocal(local)) {
    // Photos can exceed the browser storage quota; keep the review, drop the photos.
    created.photos = undefined
    saveLocal(local)
  }
  return delay(created)
}

export type NewProvider = Omit<SeedProvider, 'id' | 'verified' | 'joinedAt'>

export async function createProvider(input: NewProvider): Promise<Provider> {
  const seed = {
    ...input,
    id: crypto.randomUUID(),
    verified: false,
    joinedAt: new Date().toISOString().slice(0, 10),
  }
  local.providers.push(seed)
  saveLocal(local)
  return delay({ ...seed, ratingAvg: 0, ratingCount: 0, topTags: [] })
}

export interface PriceStat {
  serviceName: string
  min: number
  avg: number
  max: number
  count: number
}

/**
 * Market price stats per service name within a category. This is what keeps
 * pricing competitive: customers and providers can see where a price sits.
 */
export async function getPriceStats(categoryId: string): Promise<PriceStat[]> {
  return delay(priceStatsSync(categoryId))
}

export function priceStatsSync(categoryId: string): PriceStat[] {
  const groups = new Map<string, number[]>()
  for (const p of allProviders()) {
    for (const s of p.services) {
      if (s.categoryId !== categoryId || s.price <= 0) continue
      const key = s.name.trim()
      groups.set(key, [...(groups.get(key) ?? []), s.price])
    }
  }
  return [...groups.entries()]
    .map(([serviceName, prices]) => ({
      serviceName,
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      count: prices.length,
    }))
    .sort((a, b) => b.count - a.count || a.serviceName.localeCompare(b.serviceName))
}

export async function listCities(): Promise<string[]> {
  return delay([...new Set(allProviders().map((p) => p.location.city))].sort(), 0)
}

export async function getProvidersByIds(ids: string[]): Promise<Provider[]> {
  const all = allProviders()
  return delay(ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Provider => !!p))
}

/** 24/7 providers for an emergency, best rated first. */
export async function listEmergencyProviders(categoryId: string, province?: Province): Promise<Provider[]> {
  return delay(
    allProviders()
      .filter((p) => p.available24h && p.categoryIds.includes(categoryId))
      .filter((p) => !province || p.location.province === province)
      .sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount),
  )
}

export type QuoteVerdict = 'below_market' | 'good' | 'fair' | 'high' | 'very_high'

export interface QuoteCheck {
  stat: PriceStat
  amount: number
  /** Fraction above (+) or below (-) the average. */
  diff: number
  verdict: QuoteVerdict
  /** Rated providers listing this service for less than the quote. */
  cheaper: { provider: Provider; service: ServiceOffering }[]
}

export async function checkQuote(categoryId: string, serviceName: string, amount: number): Promise<QuoteCheck | undefined> {
  const stat = priceStatsSync(categoryId).find((s) => s.serviceName === serviceName)
  if (!stat || amount <= 0) return delay(undefined)
  const diff = (amount - stat.avg) / stat.avg
  const verdict: QuoteVerdict =
    amount < stat.min * 0.85 ? 'below_market' : diff <= -0.08 ? 'good' : diff <= 0.1 ? 'fair' : diff <= 0.3 ? 'high' : 'very_high'
  const cheaper = allProviders()
    .flatMap((provider) =>
      provider.services
        .filter((s) => s.categoryId === categoryId && s.name === serviceName && s.price > 0 && s.price < amount)
        .map((service) => ({ provider, service })),
    )
    .sort((a, b) => a.service.price - b.service.price || b.provider.ratingAvg - a.provider.ratingAvg)
  return delay({ stat, amount, diff, verdict, cheaper }, 350)
}

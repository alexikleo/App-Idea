// Data access for the UI. Pages call these functions; where the data lives is
// decided by the data source: Supabase when configured, demo data otherwise.

import type { Badge, ListingInput, NewReview, Province, Provider, ProviderSearch, Review, ServiceOffering } from '../types'
import { demoSource } from './data/demoSource'
import type { RatedProvider } from './data/mapping'
import type { DataSource } from './data/source'
import { createSupabaseSource } from './data/supabaseSource'
import { supabase } from './supabase'

export { FriendlyError } from './data/source'

const source: DataSource = supabase ? createSupabaseSource(supabase) : demoSource
export const dataMode = source.kind

// ---------------------------------------------------------------------------
// Cache: listings are loaded once and shared until something changes.
// ---------------------------------------------------------------------------

const CACHE_MS = 60_000
let cache: { at: number; promise: Promise<Provider[]> } | null = null

/** Call after writes or sign-in/out so the next read is fresh. */
export function invalidateCache() {
  cache = null
}

async function allProviders(): Promise<Provider[]> {
  if (!cache || Date.now() - cache.at > CACHE_MS) {
    const promise = source.loadProviders().then((rated) => rated.map((p) => ({ ...p, badges: earnBadges(p, rated) })))
    cache = { at: Date.now(), promise }
    promise.catch(() => (cache = null))
  }
  return cache.promise
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

const TOP_RATED_MIN_REVIEWS = 2
const TOP_RATED_MIN_AVG = 4.5

/**
 * Badges are earned, never bought:
 * - Top rated: best-rated provider for a service in their city (min 2 reviews, 4.5+).
 * - Best value: prices on average 5%+ below market on services others also list.
 * - Experienced: 10+ years in the trade.
 */
function earnBadges(p: RatedProvider, all: RatedProvider[]): Badge[] {
  const badges: Badge[] = []

  if (p.ratingCount >= TOP_RATED_MIN_REVIEWS && p.ratingAvg >= TOP_RATED_MIN_AVG) {
    const categoryId = p.categoryIds.find((cat) =>
      all
        .filter((o) => o.id !== p.id && o.location.city === p.location.city && o.categoryIds.includes(cat))
        .every((o) => o.ratingAvg < p.ratingAvg || (o.ratingAvg === p.ratingAvg && o.ratingCount < p.ratingCount)),
    )
    if (categoryId) badges.push({ kind: 'top_rated', categoryId, city: p.location.city })
  }

  const diffs = p.services.flatMap((s) => {
    const others = all
      .filter((o) => o.id !== p.id)
      .flatMap((o) => o.services)
      .filter((o) => o.categoryId === s.categoryId && o.name === s.name && o.price > 0)
    if (!others.length || s.price <= 0) return []
    const avg = [...others, s].reduce((sum, o) => sum + o.price, 0) / (others.length + 1)
    return [(s.price - avg) / avg]
  })
  if (diffs.length) {
    const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length
    if (mean <= -0.05) badges.push({ kind: 'best_value', percentBelow: Math.round(-mean * 100) })
  }

  if (p.yearsExperience >= 10) badges.push({ kind: 'experienced', years: p.yearsExperience })
  return badges
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

/** Lowest non-zero price a provider charges, optionally within one category. */
export function startingPrice(provider: Provider, categoryId?: string): ServiceOffering | undefined {
  return provider.services
    .filter((s) => s.price > 0 && (!categoryId || s.categoryId === categoryId))
    .sort((a, b) => a.price - b.price)[0]
}

export async function listProviders(search: ProviderSearch = {}): Promise<Provider[]> {
  const q = search.query?.trim().toLowerCase()
  let results = (await allProviders()).filter((p) => {
    if (search.categoryId && !p.categoryIds.includes(search.categoryId)) return false
    if (search.province && p.location.province !== search.province) return false
    if (search.city && p.location.city !== search.city) return false
    if (search.minRating && p.ratingAvg < search.minRating) return false
    if (search.maxPrice) {
      const start = startingPrice(p, search.categoryId)
      if (!start || start.price > search.maxPrice) return false
    }
    if (q) {
      const haystack = [p.name, p.businessName, p.bio, p.location.city, ...p.location.suburbs, ...p.services.map((s) => s.name), ...p.categoryIds]
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
  return results
}

export async function getProvider(id: string): Promise<Provider | undefined> {
  return (await allProviders()).find((p) => p.id === id)
}

export async function getProvidersByIds(ids: string[]): Promise<Provider[]> {
  const all = await allProviders()
  return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Provider => !!p)
}

/** The signed-in user's own listing, if they have one. */
export async function getMyListing(): Promise<Provider | undefined> {
  return (await allProviders()).find((p) => p.isMine)
}

export async function saveMyListing(input: ListingInput): Promise<string> {
  const id = await source.saveMyListing(input)
  invalidateCache()
  return id
}

export async function uploadPhoto(dataUrl: string): Promise<string> {
  return source.uploadPhoto(dataUrl)
}

/** 24/7 providers for an emergency, best rated first. */
export async function listEmergencyProviders(categoryId: string, province?: Province): Promise<Provider[]> {
  return (await allProviders())
    .filter((p) => p.available24h && p.categoryIds.includes(categoryId))
    .filter((p) => !province || p.location.province === province)
    .sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount)
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function listReviews(providerId: string): Promise<Review[]> {
  return source.loadReviews(providerId)
}

export async function addReview(input: NewReview): Promise<void> {
  await source.addReview(input)
  invalidateCache()
}

// ---------------------------------------------------------------------------
// Prices
// ---------------------------------------------------------------------------

export interface PriceStat {
  serviceName: string
  min: number
  avg: number
  max: number
  count: number
}

function statsFor(all: Provider[], categoryId: string): PriceStat[] {
  const groups = new Map<string, number[]>()
  for (const p of all) {
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

/**
 * Market price stats per service name within a category. This is what keeps
 * pricing competitive: customers and providers can see where a price sits.
 */
export async function getPriceStats(categoryId: string): Promise<PriceStat[]> {
  return statsFor(await allProviders(), categoryId)
}

/** Price stats for every category, keyed by category id (categories with no prices are left out). */
export async function getAllPriceStats(): Promise<Record<string, PriceStat[]>> {
  const all = await allProviders()
  const ids = [...new Set(all.flatMap((p) => p.services.map((s) => s.categoryId)))]
  return Object.fromEntries(ids.map((id) => [id, statsFor(all, id)]).filter(([, stats]) => stats.length))
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
  const all = await allProviders()
  const stat = statsFor(all, categoryId).find((s) => s.serviceName === serviceName)
  if (!stat || amount <= 0) return undefined
  const diff = (amount - stat.avg) / stat.avg
  const verdict: QuoteVerdict =
    amount < stat.min * 0.85 ? 'below_market' : diff <= -0.08 ? 'good' : diff <= 0.1 ? 'fair' : diff <= 0.3 ? 'high' : 'very_high'
  const cheaper = all
    .flatMap((provider) =>
      provider.services
        .filter((s) => s.categoryId === categoryId && s.name === serviceName && s.price > 0 && s.price < amount)
        .map((service) => ({ provider, service })),
    )
    .sort((a, b) => a.service.price - b.service.price || b.provider.ratingAvg - a.provider.ratingAvg)
  return { stat, amount, diff, verdict, cheaper }
}

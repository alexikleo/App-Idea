// Demo data source: sample listings plus anything added in this browser.

import { MOCK_PROVIDERS, MOCK_REVIEWS, type SeedProvider } from '../../data/mockProviders'
import type { ListingInput, NewReview, Review, ReviewTag } from '../../types'
import { readDemoUser } from '../demoAuth'
import { topTagsFrom, type RatedProvider } from './mapping'
import { type DataSource, FriendlyError } from './source'

const STORAGE_KEY = 'fundi:local-data:v1'

type LocalProvider = SeedProvider & { ownerId?: string }
type LocalReview = Review & { authorId?: string }

interface LocalData {
  providers: LocalProvider[]
  reviews: LocalReview[]
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

/** Simulate network latency so loading states are exercised. */
const delay = <T,>(value: T, ms = 150) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))

const allReviews = (): LocalReview[] => [...MOCK_REVIEWS, ...local.reviews]
const allSeeds = (): LocalProvider[] => [...MOCK_PROVIDERS, ...local.providers]

export const demoSource: DataSource = {
  kind: 'demo',

  async loadProviders() {
    const reviews = allReviews()
    const uid = readDemoUser()?.id
    const rated = allSeeds().map((p): RatedProvider => {
      const mine = reviews.filter((r) => r.providerId === p.id)
      const ratingCount = mine.length
      const ratingAvg = ratingCount ? mine.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0
      const tagCounts: Partial<Record<ReviewTag, number>> = {}
      for (const tag of mine.flatMap((r) => r.tags ?? [])) tagCounts[tag] = (tagCounts[tag] ?? 0) + 1
      const { ownerId, ...rest } = p
      return { ...rest, ratingAvg, ratingCount, topTags: topTagsFrom(tagCounts, ratingCount), isMine: !!uid && ownerId === uid }
    })
    return delay(rated)
  },

  async loadReviews(providerId) {
    const uid = readDemoUser()?.id
    return delay(
      allReviews()
        .filter((r) => r.providerId === providerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(({ authorId, ...r }) => ({ ...r, isMine: !!uid && authorId === uid })),
    )
  },

  async addReview(input: NewReview) {
    const user = readDemoUser()
    if (!user) throw new FriendlyError('Sign in to write a review.')
    if (local.providers.some((p) => p.id === input.providerId && p.ownerId === user.id))
      throw new FriendlyError('You can’t review your own listing.')
    if (local.reviews.some((r) => r.providerId === input.providerId && r.authorId === user.id))
      throw new FriendlyError('You’ve already reviewed this fundi.')
    const created: LocalReview = {
      ...input,
      id: crypto.randomUUID(),
      authorId: user.id,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    local.reviews.push(created)
    if (!saveLocal(local)) {
      // Photos can exceed the browser storage quota; keep the review, drop the photos.
      created.photos = undefined
      saveLocal(local)
    }
    await delay(null)
  },

  async saveMyListing(input: ListingInput) {
    const user = readDemoUser()
    if (!user) throw new FriendlyError('Sign in to save your listing.')
    const services = input.services.map((s) => ({ ...s, id: crypto.randomUUID() }))
    const existing = local.providers.find((p) => p.ownerId === user.id)
    if (existing) {
      Object.assign(existing, { ...input, services })
    } else {
      local.providers.push({
        ...input,
        services,
        id: crypto.randomUUID(),
        ownerId: user.id,
        verified: false,
        joinedAt: new Date().toISOString().slice(0, 10),
      })
    }
    saveLocal(local)
    return delay(local.providers.find((p) => p.ownerId === user.id)!.id)
  },

  async uploadPhoto(dataUrl: string) {
    return dataUrl
  },
}

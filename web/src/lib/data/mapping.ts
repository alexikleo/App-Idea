// Converts between database rows (snake_case, from the provider_listings view
// and reviews table) and the app's types. Pure functions, unit-tested against
// real Postgres output in supabase/tests/fixtures.

import type { ListingInput, PriceUnit, Province, Provider, Review, ReviewTag, ServiceOffering } from '../../types'

export type RatedProvider = Omit<Provider, 'badges'>

export interface ListingRow {
  id: string
  name: string
  business_name: string | null
  bio: string
  phone: string
  whatsapp: string | null
  province: Province
  city: string
  suburbs: string[]
  years_experience: number
  available_24h: boolean
  photo_url: string | null
  verified: boolean
  rating_avg: number | string
  rating_count: number
  created_at: string
  is_mine: boolean
  category_ids: string[]
  services: { id: string; categoryId: string; name: string; price: number; unit: PriceUnit }[]
  tag_counts: Partial<Record<ReviewTag, number>>
}

export interface ReviewRow {
  id: string
  provider_id: string
  author_id: string
  author_name: string
  rating: number
  comment: string
  tags: ReviewTag[]
  photos: string[]
  service_name: string | null
  price_paid: number | null
  created_at: string
}

/** Most common tags first; a tag needs 2+ mentions unless the fundi has very few reviews. */
export function topTagsFrom(tagCounts: Partial<Record<ReviewTag, number>>, ratingCount: number): ReviewTag[] {
  return (Object.entries(tagCounts) as [ReviewTag, number][])
    .filter(([, n]) => n >= 2 || ratingCount <= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag)
}

export function rowToProvider(row: ListingRow): RatedProvider {
  const ratingCount = row.rating_count
  return {
    id: row.id,
    name: row.name,
    businessName: row.business_name ?? undefined,
    bio: row.bio,
    phone: row.phone,
    whatsapp: row.whatsapp ?? undefined,
    categoryIds: row.category_ids,
    services: row.services.map((s): ServiceOffering => ({ ...s, price: Number(s.price) })),
    location: { province: row.province, city: row.city, suburbs: row.suburbs },
    yearsExperience: row.years_experience,
    verified: row.verified,
    available24h: row.available_24h,
    joinedAt: row.created_at.slice(0, 10),
    photoUrl: row.photo_url ?? undefined,
    isMine: row.is_mine,
    ratingAvg: Number(row.rating_avg),
    ratingCount,
    topTags: topTagsFrom(row.tag_counts, ratingCount),
  }
}

export function rowToReview(row: ReviewRow, currentUserId?: string): Review {
  return {
    id: row.id,
    providerId: row.provider_id,
    authorName: row.author_name,
    rating: row.rating as Review['rating'],
    comment: row.comment,
    tags: row.tags.length ? row.tags : undefined,
    photos: row.photos.length ? row.photos : undefined,
    serviceName: row.service_name ?? undefined,
    pricePaid: row.price_paid ?? undefined,
    createdAt: row.created_at.slice(0, 10),
    isMine: !!currentUserId && row.author_id === currentUserId,
  }
}

/** JSON payload for the upsert_my_listing RPC. */
export function toListingPayload(input: ListingInput) {
  return {
    name: input.name,
    businessName: input.businessName ?? '',
    bio: input.bio,
    phone: input.phone,
    whatsapp: input.whatsapp ?? '',
    province: input.location.province,
    city: input.location.city,
    suburbs: input.location.suburbs,
    yearsExperience: input.yearsExperience,
    available24h: input.available24h,
    photoUrl: input.photoUrl ?? '',
    categoryIds: input.categoryIds,
    services: input.services.map((s) => ({ categoryId: s.categoryId, name: s.name, price: s.price, unit: s.unit })),
  }
}

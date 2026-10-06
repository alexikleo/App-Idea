// Core domain types. These mirror the planned database tables (see /PLAN.md)
// so the mock data layer can be swapped for a real backend without UI changes.

export type Province =
  | 'Eastern Cape'
  | 'Free State'
  | 'Gauteng'
  | 'KwaZulu-Natal'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'North West'
  | 'Northern Cape'
  | 'Western Cape'

export interface Category {
  id: string
  name: string
  description: string
}

/** How a service is priced. Call-out fees are very common in SA trades. */
export type PriceUnit = 'fixed' | 'per_hour' | 'call_out' | 'per_m2' | 'from'

export interface ServiceOffering {
  id: string
  categoryId: string
  name: string
  /** Price in whole Rands (ZAR). */
  price: number
  unit: PriceUnit
}

export interface Location {
  province: Province
  city: string
  suburbs: string[]
}

export interface Provider {
  id: string
  name: string
  businessName?: string
  bio: string
  /** E.164 format, e.g. +27821234567 */
  phone: string
  whatsapp?: string
  categoryIds: string[]
  services: ServiceOffering[]
  location: Location
  yearsExperience: number
  verified: boolean
  available24h: boolean
  joinedAt: string
  /** Profile photo (public URL). */
  photoUrl?: string
  /** True when the signed-in user owns this listing. */
  isMine: boolean
  /** Denormalised from reviews for fast listing/sorting. */
  ratingAvg: number
  ratingCount: number
  /** Most common review tags, most frequent first. */
  topTags: ReviewTag[]
  /** Earned from ratings, prices and experience; recomputed on every read. */
  badges: Badge[]
}

export type Badge =
  | { kind: 'top_rated'; categoryId: string; city: string }
  | { kind: 'best_value'; percentBelow: number }
  | { kind: 'experienced'; years: number }

export interface Review {
  id: string
  providerId: string
  authorName: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string
  serviceName?: string
  pricePaid?: number
  tags?: ReviewTag[]
  /** Data URLs in the prototype; storage URLs once a backend exists. */
  photos?: string[]
  createdAt: string
  /** True when the signed-in user wrote this review. */
  isMine?: boolean
}

export type ReviewTag = 'on_time' | 'tidy' | 'fair_price' | 'communication' | 'quality' | 'friendly'

export type SortOption = 'rating' | 'price_low' | 'price_high' | 'reviews'

export interface ProviderSearch {
  query?: string
  categoryId?: string
  province?: Province
  city?: string
  minRating?: number
  maxPrice?: number
  sort?: SortOption
}

/** What a provider fills in to create or edit their listing. */
export interface ListingInput {
  name: string
  businessName?: string
  bio: string
  phone: string
  whatsapp?: string
  categoryIds: string[]
  services: Omit<ServiceOffering, 'id'>[]
  location: Location
  yearsExperience: number
  available24h: boolean
  photoUrl?: string
}

export interface NewReview {
  providerId: string
  authorName: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string
  tags?: ReviewTag[]
  /** Data URLs straight from the photo picker; uploaded by the data layer. */
  photos?: string[]
  serviceName?: string
  pricePaid?: number
}

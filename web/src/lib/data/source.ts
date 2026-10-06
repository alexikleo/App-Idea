import type { ListingInput, NewReview, Review } from '../../types'
import type { RatedProvider } from './mapping'

/**
 * Where listings and reviews come from. The demo source keeps everything in
 * this browser; the Supabase source talks to the real database.
 */
export interface DataSource {
  kind: 'demo' | 'supabase'
  loadProviders(): Promise<RatedProvider[]>
  loadReviews(providerId: string): Promise<Review[]>
  addReview(input: NewReview): Promise<void>
  /** Creates or updates the signed-in user's listing; returns its id. */
  saveMyListing(input: ListingInput): Promise<string>
  /** Uploads a photo (data URL) and returns its public URL. */
  uploadPhoto(dataUrl: string): Promise<string>
}

/** An error whose message is safe and helpful to show to the user. */
export class FriendlyError extends Error {}

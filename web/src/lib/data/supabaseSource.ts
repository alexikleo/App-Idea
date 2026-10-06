// Supabase data source: reads the provider_listings view, writes via RLS-protected
// tables and the upsert_my_listing RPC (see supabase/migrations).

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ListingInput, NewReview } from '../../types'
import { type ListingRow, type ReviewRow, rowToProvider, rowToReview, toListingPayload } from './mapping'
import { type DataSource, FriendlyError } from './source'

interface PgError {
  code?: string
  message?: string
}

/** Turns database errors into messages people can act on. */
export function friendly(error: PgError | null, fallback: string): never {
  const code = error?.code
  const msg = error?.message ?? ''
  if (code === '23505' && msg.includes('reviews')) throw new FriendlyError('You’ve already reviewed this fundi.')
  if (code === '23514' && msg.includes('own listing')) throw new FriendlyError('You can’t review your own listing.')
  if (code === '23514' && msg.includes('phone')) throw new FriendlyError('Use a valid SA number, e.g. 082 123 4567.')
  if (code === '23514' && /categor|service/i.test(msg)) throw new FriendlyError(msg)
  if (code === '42501' || code === 'PGRST301') throw new FriendlyError('Please sign in again to do that.')
  console.error(error)
  throw new FriendlyError(fallback)
}

async function currentUserId(client: SupabaseClient): Promise<string | undefined> {
  const { data } = await client.auth.getSession()
  return data.session?.user.id
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',')
  const mime = meta.match(/data:(.*?);/)?.[1] ?? 'image/jpeg'
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  return new Blob([bytes], { type: mime })
}

export function createSupabaseSource(client: SupabaseClient): DataSource {
  async function uploadPhoto(dataUrl: string): Promise<string> {
    if (!dataUrl.startsWith('data:')) return dataUrl
    const uid = await currentUserId(client)
    if (!uid) throw new FriendlyError('Sign in to upload photos.')
    const path = `${uid}/${crypto.randomUUID()}.jpg`
    const { error } = await client.storage.from('photos').upload(path, dataUrlToBlob(dataUrl), {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
    })
    if (error) throw new FriendlyError('That photo couldn’t be uploaded. Try a smaller one.')
    return client.storage.from('photos').getPublicUrl(path).data.publicUrl
  }

  return {
    kind: 'supabase',

    async loadProviders() {
      const { data, error } = await client.from('provider_listings').select('*')
      if (error) friendly(error, 'We couldn’t load fundis. Check your connection and try again.')
      return (data as ListingRow[]).map(rowToProvider)
    },

    async loadReviews(providerId) {
      const [{ data, error }, uid] = await Promise.all([
        client
          .from('reviews')
          .select('id, provider_id, author_id, author_name, rating, comment, tags, photos, service_name, price_paid, created_at')
          .eq('provider_id', providerId)
          .eq('status', 'published')
          .order('created_at', { ascending: false }),
        currentUserId(client),
      ])
      if (error) friendly(error, 'We couldn’t load reviews.')
      return (data as ReviewRow[]).map((r) => rowToReview(r, uid))
    },

    async addReview(input: NewReview) {
      const photos = await Promise.all((input.photos ?? []).map(uploadPhoto))
      const { error } = await client.from('reviews').insert({
        provider_id: input.providerId,
        author_name: input.authorName,
        rating: input.rating,
        comment: input.comment,
        tags: input.tags ?? [],
        photos,
        service_name: input.serviceName ?? null,
        price_paid: input.pricePaid ?? null,
      })
      if (error) friendly(error, 'Your review couldn’t be posted. Try again.')
    },

    async saveMyListing(input: ListingInput) {
      const photoUrl = input.photoUrl ? await uploadPhoto(input.photoUrl) : undefined
      const { data, error } = await client.rpc('upsert_my_listing', { listing: toListingPayload({ ...input, photoUrl }) })
      if (error) friendly(error, 'Your listing couldn’t be saved. Try again.')
      return data as string
    },

    uploadPhoto,
  }
}

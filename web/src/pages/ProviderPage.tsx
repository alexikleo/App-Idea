import { ArrowLeft, BadgeCheck, Calendar, Camera, Clock, Lightbulb, MapPin, QrCode, Star, Store, UserX, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Badges from '../components/Badges'
import CategoryIcon from '../components/CategoryIcon'
import ContactButtons from '../components/ContactButtons'
import SaveButton from '../components/SaveButton'
import ShareButton from '../components/ShareButton'
import ShortlistButton from '../components/ShortlistButton'
import StrengthMeter from '../components/StrengthMeter'
import { StarInput, StarRating, Stars } from '../components/StarRating'
import { EmptyState, Loading } from '../components/States'
import { REVIEW_TAGS, getCategory } from '../data/categories'
import { addReview, getProvider, listReviews, priceStatsSync } from '../lib/api'
import { formatDate, formatPrice, formatRand } from '../lib/format'
import { resizeImage } from '../lib/images'
import { recordView, useMyFundis } from '../lib/myFundis'
import { listingStrength } from '../lib/strength'
import { useAsync } from '../lib/useAsync'
import type { Provider, Review, ReviewTag, ServiceOffering } from '../types'

const tagLabel = (t: ReviewTag) => REVIEW_TAGS.find((r) => r.id === t)?.label ?? t

/** Compares a price to the market average for the same service name. */
function PriceBadge({ service }: { service: ServiceOffering }) {
  const stat = priceStatsSync(service.categoryId).find((s) => s.serviceName === service.name)
  if (!stat || stat.count < 2 || service.price <= 0) return null
  const diff = (service.price - stat.avg) / stat.avg
  if (Math.abs(diff) < 0.05) return <span className="chip">Market average</span>
  return diff < 0 ? (
    <span className="chip bg-brand-100 text-brand-700">{Math.round(-diff * 100)}% below avg</span>
  ) : (
    <span className="chip bg-marigold-100 text-marigold-700">{Math.round(diff * 100)}% above avg</span>
  )
}

function RatingSummary({ provider, reviews }: { provider: Provider; reviews: Review[] }) {
  const counts = [5, 4, 3, 2, 1].map((n) => reviews.filter((r) => r.rating === n).length)
  const tagCounts = REVIEW_TAGS.map((t) => ({ ...t, n: reviews.filter((r) => r.tags?.includes(t.id)).length }))
    .filter((t) => t.n > 0)
    .sort((a, b) => b.n - a.n)

  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
      <div className="text-center sm:pr-6">
        <p className="font-display text-5xl font-extrabold tabular-nums">{provider.ratingAvg.toFixed(1)}</p>
        <Stars value={provider.ratingAvg} />
        <p className="mt-1 text-sm text-muted">
          {provider.ratingCount} review{provider.ratingCount === 1 ? '' : 's'}
        </p>
      </div>
      <div className="space-y-1.5">
        {counts.map((n, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 tabular-nums text-muted">{5 - i}</span>
            <Star className="size-3.5 fill-marigold-400 text-marigold-400" aria-hidden />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full bg-marigold-400 transition-all duration-700"
                style={{ width: `${reviews.length ? (n / reviews.length) * 100 : 0}%` }}
              />
            </div>
            <span className="w-5 text-right tabular-nums text-muted">{n}</span>
          </div>
        ))}
      </div>
      {tagCounts.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {tagCounts.map((t) => (
            <span key={t.id} className="chip bg-brand-50 text-brand-700">
              {t.label} <span className="font-bold">×{t.n}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProviderPage() {
  const { id = '' } = useParams()
  const provider = useAsync(() => getProvider(id), [id])
  const reviews = useAsync(() => listReviews(id), [id])
  const [photo, setPhoto] = useState<string | null>(null)
  const { isMyListing } = useMyFundis()

  useEffect(() => {
    if (provider.data) recordView(provider.data.id)
  }, [provider.data])

  if (provider.loading && !provider.data) return <Loading />
  if (!provider.data)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState icon={UserX} title="We couldn’t find that fundi">
          <Link to="/services" className="font-semibold text-brand-600 underline">
            Back to search
          </Link>
        </EmptyState>
      </div>
    )

  const p = provider.data
  const reload = () => {
    provider.reload()
    reviews.reload()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-5 md:pb-8">
      <div className="fixed inset-x-0 bottom-[calc(4.1rem+env(safe-area-inset-bottom))] z-20 border-t border-line bg-surface/95 p-3 backdrop-blur-md md:hidden">
        <ContactButtons provider={p} compact />
      </div>

      <Link to="/services" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Back to results
      </Link>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          <section className="card p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <Avatar id={p.id} name={p.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                  {p.businessName ?? p.name}
                  {p.verified && <BadgeCheck className="ml-1.5 inline size-6 fill-brand-600 align-[-3px] text-white" aria-label="Verified" />}
                </h1>
                {p.businessName && <p className="text-muted">{p.name}</p>}
                <div className="mt-1.5">
                  <StarRating value={p.ratingAvg} count={p.ratingCount} size="md" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.verified ? (
                <span className="chip bg-brand-100 text-brand-700">
                  <BadgeCheck className="size-3.5" aria-hidden /> Verified
                </span>
              ) : (
                <span className="chip">Not yet verified</span>
              )}
              {p.available24h && (
                <span className="chip bg-marigold-100 text-marigold-700">
                  <Clock className="size-3.5" aria-hidden /> 24/7 emergencies
                </span>
              )}
              {p.yearsExperience > 0 && <span className="chip">{p.yearsExperience} yrs experience</span>}
              <span className="chip">
                <Calendar className="size-3.5" aria-hidden /> On Fundi since {formatDate(p.joinedAt)}
              </span>
            </div>
            {p.badges.length > 0 && (
              <div className="mt-3">
                <Badges badges={p.badges.filter((b) => b.kind !== 'experienced')} />
              </div>
            )}
            {p.topTags.length > 0 && (
              <p className="mt-4 text-sm">
                <span className="font-semibold">Customers say: </span>
                <span className="text-muted">{p.topTags.map(tagLabel).join(' · ')}</span>
              </p>
            )}
            <p className="mt-3 max-w-prose leading-relaxed">{p.bio}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <SaveButton providerId={p.id} withLabel />
              <ShortlistButton providerId={p.id} size="md" />
              <ShareButton provider={p} />
            </div>
          </section>

          {isMyListing(p.id) && (
            <section className="card space-y-4 border-brand-500 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Store className="size-5 text-brand-600" aria-hidden />
                <h2 className="text-xl font-bold">Your listing</h2>
              </div>
              <StrengthMeter
                result={listingStrength({ ...p, suburbs: p.location.suburbs })}
              />
              <div className="flex flex-wrap gap-2">
                <Link to={`/providers/${p.id}/card`} className="btn-primary">
                  <QrCode className="size-4" aria-hidden /> Get your QR card
                </Link>
              </div>
              <p className="text-xs text-faint">Editing your listing arrives with accounts (Phase 2).</p>
            </section>
          )}

          <section className="card p-5 sm:p-6">
            <h2 className="text-xl font-bold">Services &amp; prices</h2>
            <p className="text-sm text-muted">Compared with other fundis on Fundi offering the same service.</p>
            <ul className="mt-3 divide-y divide-line">
              {p.services.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-sunken text-muted">
                      <CategoryIcon id={s.categoryId} className="size-4" />
                    </span>
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-xs text-muted">{getCategory(s.categoryId)?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriceBadge service={s} />
                    <span className="font-display text-lg font-bold tabular-nums">{formatPrice(s.price, s.unit)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-xl font-bold">Reviews</h2>
            {reviews.loading && !reviews.data ? (
              <div className="skeleton mt-4 h-32 w-full" />
            ) : !reviews.data?.length ? (
              <p className="mt-2 text-sm text-muted">No reviews yet. Used this fundi? Be the first to review them.</p>
            ) : (
              <>
                <div className="mt-4 rounded-2xl bg-canvas p-4">
                  <RatingSummary provider={p} reviews={reviews.data} />
                </div>
                <ul className="mt-5 divide-y divide-line">
                  {reviews.data.map((r) => (
                    <li key={r.id} className="py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="grid size-8 place-items-center rounded-full bg-sunken text-xs font-bold text-muted">
                            {r.authorName[0]}
                          </span>
                          <span className="font-semibold">{r.authorName}</span>
                        </div>
                        <span className="text-xs text-faint">{formatDate(r.createdAt)}</span>
                      </div>
                      <div className="mt-2">
                        <Stars value={r.rating} className="size-3.5" />
                      </div>
                      <p className="mt-1 leading-relaxed">{r.comment}</p>
                      {r.photos && r.photos.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {r.photos.map((src, i) => (
                            <button key={i} type="button" onClick={() => setPhoto(src)} className="overflow-hidden rounded-xl">
                              <img src={src} alt={`Photo ${i + 1} from ${r.authorName}`} className="size-20 object-cover transition hover:scale-105" />
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {r.tags?.map((t) => (
                          <span key={t} className="chip">
                            {tagLabel(t)}
                          </span>
                        ))}
                        {(r.serviceName || r.pricePaid) && (
                          <span className="text-xs text-muted">
                            {r.serviceName}
                            {r.serviceName && r.pricePaid ? ' · ' : ''}
                            {r.pricePaid ? `Paid ${formatRand(r.pricePaid)}` : ''}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <ReviewForm provider={p} onSubmitted={reload} />
          </section>
        </div>

        <aside className="card hidden h-fit space-y-4 p-5 lg:sticky lg:top-24 lg:block">
          <h2 className="text-lg font-bold">Contact {p.name.split(' ')[0]}</h2>
          <ContactButtons provider={p} />
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-1.5 font-semibold">
              <MapPin className="size-4 text-brand-600" aria-hidden /> {p.location.city}, {p.location.province}
            </p>
            {p.location.suburbs.length > 0 && <p className="text-muted">Serves {p.location.suburbs.join(', ')}</p>}
          </div>
          <p className="flex gap-2 rounded-xl bg-marigold-100 p-3 text-xs text-marigold-700">
            <Lightbulb className="size-4 shrink-0" aria-hidden />
            Always confirm the call-out fee and get a written quote before work starts.
          </p>
          {!isMyListing(p.id) && (
            <Link to={`/providers/${p.id}/card`} className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink">
              <QrCode className="size-3.5" aria-hidden /> Is this your business? Get your QR card
            </Link>
          )}
        </aside>

        <div className="card space-y-1 p-4 text-sm lg:hidden">
          <p className="flex items-center gap-1.5 font-semibold">
            <MapPin className="size-4 text-brand-600" aria-hidden /> {p.location.city}, {p.location.province}
          </p>
          {p.location.suburbs.length > 0 && <p className="text-muted">Serves {p.location.suburbs.join(', ')}</p>}
          {!isMyListing(p.id) && (
            <Link to={`/providers/${p.id}/card`} className="flex items-center gap-1.5 pt-2 text-xs font-medium text-muted">
              <QrCode className="size-3.5" aria-hidden /> Is this your business? Get your QR card
            </Link>
          )}
        </div>
      </div>

      {photo && (
        <div
          className="fixed inset-0 z-50 grid animate-rise place-items-center bg-black/80 p-4"
          onClick={() => setPhoto(null)}
          role="dialog"
          aria-label="Review photo"
        >
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white" aria-label="Close photo">
            <X className="size-6" />
          </button>
          <img src={photo} alt="" className="max-h-[85vh] max-w-full rounded-2xl" />
        </div>
      )}
    </div>
  )
}

function ReviewForm({ provider, onSubmitted }: { provider: Provider; onSubmitted: () => void }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0)
  const [authorName, setAuthorName] = useState('')
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState<ReviewTag[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [serviceName, setServiceName] = useState('')
  const [pricePaid, setPricePaid] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="btn-outline mt-5 w-full border-brand-600 text-brand-700">
        <Star className="size-4" aria-hidden /> Write a review
      </button>
    )

  async function addPhotos(files: FileList | null) {
    if (!files) return
    try {
      const resized = await Promise.all([...files].slice(0, 3 - photos.length).map((f) => resizeImage(f)))
      setPhotos((p) => [...p, ...resized].slice(0, 3))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <form
      className="mt-5 animate-rise space-y-4 rounded-2xl bg-canvas p-4 sm:p-5"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!rating) return setError('Tap the stars to choose a rating.')
        if (!authorName.trim() || comment.trim().length < 10)
          return setError('Add your name and a comment of at least 10 characters.')
        setSaving(true)
        await addReview({
          providerId: provider.id,
          rating,
          authorName: authorName.trim(),
          comment: comment.trim(),
          tags: tags.length ? tags : undefined,
          photos: photos.length ? photos : undefined,
          serviceName: serviceName || undefined,
          pricePaid: pricePaid ? Number(pricePaid) : undefined,
        })
        setSaving(false)
        setOpen(false)
        setRating(0)
        setComment('')
        setTags([])
        setPhotos([])
        setError('')
        onSubmitted()
      }}
    >
      <h3 className="text-lg font-bold">How was {provider.businessName ?? provider.name}?</h3>
      <StarInput value={rating} onChange={setRating} />
      <div className="space-y-1.5">
        <span className="label">What stood out? (optional)</span>
        <div className="flex flex-wrap gap-2">
          {REVIEW_TAGS.map((t) => {
            const on = tags.includes(t.id)
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => setTags((all) => (on ? all.filter((x) => x !== t.id) : [...all, t.id]))}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  on ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-surface hover:border-brand-500'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>
      <input id="review-name" className="field" placeholder="Your name (e.g. Thandi M.)" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
      <textarea
        id="review-comment"
        className="field"
        rows={3}
        placeholder="How was the work, timing and communication?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <select id="review-service" className="field" value={serviceName} onChange={(e) => setServiceName(e.target.value)}>
          <option value="">Service used (optional)</option>
          {provider.services.map((s) => (
            <option key={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          id="review-paid"
          className="field"
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Amount paid in R (optional)"
          value={pricePaid}
          onChange={(e) => setPricePaid(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {photos.map((src, i) => (
          <div key={i} className="relative">
            <img src={src} alt={`Upload ${i + 1}`} className="size-16 rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
              className="absolute -right-1.5 -top-1.5 rounded-full bg-ink p-0.5 text-canvas"
              aria-label="Remove photo"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {photos.length < 3 && (
          <label className="flex size-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-faint text-xs text-muted hover:border-brand-500 hover:text-brand-600">
            <Camera className="size-5" aria-hidden />
            Photo
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
          </label>
        )}
        <span className="text-xs text-faint">Add up to 3 photos of the finished job</span>
      </div>
      {error && <p className="rounded-xl bg-alert-50 p-3 text-sm text-alert-600">{error}</p>}
      <div className="flex gap-2">
        <button disabled={saving} className="btn-primary">
          {saving ? 'Posting…' : 'Post review'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  )
}

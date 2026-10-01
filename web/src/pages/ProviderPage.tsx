import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ContactButtons from '../components/ContactButtons'
import { StarInput, StarRating } from '../components/StarRating'
import { EmptyState, Loading } from '../components/States'
import { getCategory } from '../data/categories'
import { addReview, getProvider, listReviews, priceStatsSync } from '../lib/api'
import { formatDate, formatPrice, formatRand } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import type { Provider, ServiceOffering } from '../types'

/** Compares a price to the market average for the same service name. */
function PriceBadge({ service }: { service: ServiceOffering }) {
  const stat = priceStatsSync(service.categoryId).find((s) => s.serviceName === service.name)
  if (!stat || stat.count < 2 || service.price <= 0) return null
  const diff = (service.price - stat.avg) / stat.avg
  if (Math.abs(diff) < 0.05)
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Market average</span>
  return diff < 0 ? (
    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
      {Math.round(-diff * 100)}% below avg
    </span>
  ) : (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
      {Math.round(diff * 100)}% above avg
    </span>
  )
}

export default function ProviderPage() {
  const { id = '' } = useParams()
  const provider = useAsync(() => getProvider(id), [id])
  const reviews = useAsync(() => listReviews(id), [id])

  if (provider.loading && !provider.data) return <Loading />
  if (!provider.data)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState title="Provider not found">
          <Link to="/services" className="text-brand-700 underline">
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
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 lg:pb-6">
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white p-3 lg:hidden">
        <ContactButtons provider={p} compact />
      </div>
      <Link to="/services" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to results
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
                {p.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{p.businessName ?? p.name}</h1>
                {p.businessName && <p className="text-slate-500">{p.name}</p>}
                <div className="mt-1">
                  <StarRating value={p.ratingAvg} count={p.ratingCount} size="md" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {p.verified ? (
                <span className="rounded-full bg-brand-100 px-3 py-1 font-medium text-brand-700">✔ Verified</span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Not yet verified</span>
              )}
              {p.available24h && (
                <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">24/7 emergencies</span>
              )}
              {p.yearsExperience > 0 && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{p.yearsExperience} yrs experience</span>
              )}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">On Fundi since {formatDate(p.joinedAt)}</span>
            </div>
            <p className="mt-4 text-slate-700">{p.bio}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold">Services & prices</h2>
            <p className="text-sm text-slate-500">Compared against other providers on Fundi offering the same service.</p>
            <ul className="mt-4 divide-y divide-slate-100">
              {p.services.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-slate-500">{getCategory(s.categoryId)?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriceBadge service={s} />
                    <span className="font-bold">{formatPrice(s.price, s.unit)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold">Reviews</h2>
            {reviews.loading && !reviews.data ? (
              <Loading />
            ) : !reviews.data?.length ? (
              <p className="mt-2 text-sm text-slate-500">No reviews yet. Be the first!</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reviews.data.map((r) => (
                  <li key={r.id} className="border-b border-slate-100 pb-4 last:border-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StarRating value={r.rating} />
                      <span className="text-xs text-slate-500">
                        {r.authorName} · {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-700">{r.comment}</p>
                    {(r.serviceName || r.pricePaid) && (
                      <p className="mt-1 text-xs text-slate-500">
                        {r.serviceName}
                        {r.serviceName && r.pricePaid ? ' · ' : ''}
                        {r.pricePaid ? `Paid ${formatRand(r.pricePaid)}` : ''}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <ReviewForm provider={p} onSubmitted={reload} />
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-20">
          <h2 className="font-bold">Contact {p.name.split(' ')[0]}</h2>
          <ContactButtons provider={p} />
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-800">
              📍 {p.location.city}, {p.location.province}
            </p>
            {p.location.suburbs.length > 0 && <p className="mt-1">Serves: {p.location.suburbs.join(', ')}</p>}
          </div>
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Tip: always confirm the call-out fee and get a written quote before work starts.
          </p>
        </aside>
      </div>
    </div>
  )
}

function ReviewForm({ provider, onSubmitted }: { provider: Provider; onSubmitted: () => void }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0)
  const [authorName, setAuthorName] = useState('')
  const [comment, setComment] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [pricePaid, setPricePaid] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-6 w-full rounded-lg border border-brand-600 py-2 font-semibold text-brand-700 hover:bg-brand-50"
      >
        ★ Write a review
      </button>
    )

  const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500'

  return (
    <form
      className="mt-6 space-y-3 rounded-xl bg-slate-50 p-4"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!rating) return setError('Please choose a star rating.')
        if (!authorName.trim() || comment.trim().length < 10)
          return setError('Please add your name and a comment of at least 10 characters.')
        setSaving(true)
        await addReview({
          providerId: provider.id,
          rating,
          authorName: authorName.trim(),
          comment: comment.trim(),
          serviceName: serviceName || undefined,
          pricePaid: pricePaid ? Number(pricePaid) : undefined,
        })
        setSaving(false)
        setOpen(false)
        setRating(0)
        setComment('')
        setError('')
        onSubmitted()
      }}
    >
      <h3 className="font-semibold">Rate {provider.businessName ?? provider.name}</h3>
      <StarInput value={rating} onChange={setRating} />
      <input className={input} placeholder="Your name (e.g. Thandi M.)" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
      <textarea className={input} rows={3} placeholder="How was the work, timing and communication?" value={comment} onChange={(e) => setComment(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <select className={input} value={serviceName} onChange={(e) => setServiceName(e.target.value)}>
          <option value="">Service used (optional)</option>
          {provider.services.map((s) => (
            <option key={s.id}>{s.name}</option>
          ))}
        </select>
        <input className={input} type="number" min={0} placeholder="Amount paid in R (optional)" value={pricePaid} onChange={(e) => setPricePaid(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {saving ? 'Posting…' : 'Post review'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-200">
          Cancel
        </button>
      </div>
    </form>
  )
}

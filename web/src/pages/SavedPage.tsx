import { ChevronRight, Heart, MessageSquareQuote, Trash2 } from 'lucide-react'
import CategoryIcon from '../components/CategoryIcon'
import { getCategory } from '../data/categories'
import { formatDate } from '../lib/format'
import { Link } from 'react-router-dom'
import ProviderCard from '../components/ProviderCard'
import { CardSkeletons, EmptyState } from '../components/States'
import { getProvidersByIds } from '../lib/api'
import { useMyFundis } from '../lib/myFundis'
import { useAsync } from '../lib/useAsync'

export default function SavedPage() {
  const { saved, recent, clearRecent, requests, deleteRequest } = useMyFundis()
  const savedKey = saved.join(',')
  const recentKey = recent.filter((id) => !saved.includes(id)).join(',')
  const savedProviders = useAsync(() => getProvidersByIds(savedKey ? savedKey.split(',') : []), [savedKey])
  const recentProviders = useAsync(() => getProvidersByIds(recentKey ? recentKey.split(',') : []), [recentKey])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-3xl font-extrabold">My Fundis</h1>
      <p className="text-muted">Your trusted fundis, saved on this device for next time.</p>

      <section className="mt-6">
        <h2 className="text-xl font-bold">Saved</h2>
        <div className="mt-3">
          {savedProviders.loading && !savedProviders.data ? (
            <CardSkeletons count={2} />
          ) : !savedProviders.data?.length ? (
            <EmptyState icon={Heart} title="No saved fundis yet">
              Tap the heart on any fundi to keep them here.{' '}
              <Link to="/services" className="font-semibold text-brand-600 underline">
                Find a fundi
              </Link>
            </EmptyState>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedProviders.data.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {requests.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Quote requests</h2>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {requests.map((r) => {
              const done = r.sentTo.length === r.providerIds.length
              return (
                <li key={r.id} className="card flex items-center gap-3 p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <CategoryIcon id={r.categoryId} className="size-5" />
                  </span>
                  <Link to={`/request?id=${r.id}`} className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {getCategory(r.categoryId)?.name} in {r.suburb}
                    </p>
                    <p className="truncate text-sm text-muted">{r.description}</p>
                    <p className={`text-xs font-medium ${done ? 'text-brand-700' : 'text-marigold-700'}`}>
                      {done ? `Sent to all ${r.providerIds.length}` : `${r.sentTo.length} of ${r.providerIds.length} sent`} ·{' '}
                      {formatDate(r.createdAt)}
                    </p>
                  </Link>
                  <button
                    onClick={() => deleteRequest(r.id)}
                    className="rounded-lg p-2 text-faint hover:bg-sunken hover:text-ink"
                    aria-label="Delete request"
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <ChevronRight className="size-5 text-faint" aria-hidden />
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {requests.length === 0 && (
        <Link to="/request" className="card mt-10 flex items-center gap-3 p-4 transition hover:border-brand-500">
          <MessageSquareQuote className="size-6 text-marigold-500" aria-hidden />
          <span className="flex-1">
            <span className="block font-semibold">Get quotes from up to 3 fundis</span>
            <span className="text-sm text-muted">Describe the job once and send it to each on WhatsApp.</span>
          </span>
          <ChevronRight className="size-5 text-faint" aria-hidden />
        </Link>
      )}

      {recentProviders.data && recentProviders.data.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold">Recently viewed</h2>
            <button onClick={clearRecent} className="text-sm font-medium text-muted hover:text-ink">
              Clear
            </button>
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentProviders.data.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

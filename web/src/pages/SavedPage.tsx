import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProviderCard from '../components/ProviderCard'
import { CardSkeletons, EmptyState } from '../components/States'
import { getProvidersByIds } from '../lib/api'
import { useMyFundis } from '../lib/myFundis'
import { useAsync } from '../lib/useAsync'

export default function SavedPage() {
  const { saved, recent, clearRecent } = useMyFundis()
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

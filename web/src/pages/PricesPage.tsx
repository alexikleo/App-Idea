import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, Loading } from '../components/States'
import { CATEGORIES, getCategory } from '../data/categories'
import { getPriceStats } from '../lib/api'
import { formatRand } from '../lib/format'
import { useAsync } from '../lib/useAsync'

export default function PricesPage() {
  const [params, setParams] = useSearchParams()
  const categoryId = params.get('category') ?? 'plumber'
  const category = getCategory(categoryId)
  const { data: stats, loading } = useAsync(() => getPriceStats(categoryId), [categoryId])

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-bold">📊 What should it cost?</h1>
      <p className="mt-1 text-slate-600">
        Typical prices listed by providers on Fundi. Use this to check a quote is fair before you agree to it.
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setParams({ category: c.id }, { replace: true })}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${
              c.id === categoryId
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-brand-500'
            }`}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{category?.name ?? 'Unknown'} prices</h2>
          <Link to={`/services?category=${categoryId}&sort=price_low`} className="text-sm font-medium text-brand-700 hover:underline">
            Find cheapest {category?.name.toLowerCase()} →
          </Link>
        </div>
        {loading ? (
          <Loading />
        ) : !stats?.length ? (
          <div className="mt-4">
            <EmptyState title="Not enough price data yet">Prices appear here once providers list them.</EmptyState>
          </div>
        ) : (
          <ul className="mt-4 space-y-5">
            {stats.map((s) => {
              const span = s.max - s.min || 1
              const avgPos = ((s.avg - s.min) / span) * 100
              return (
                <li key={s.serviceName}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium">{s.serviceName}</p>
                    <p className="text-sm text-slate-500">
                      avg <span className="font-bold text-slate-900">{formatRand(s.avg)}</span> · {s.count} provider
                      {s.count === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="relative mt-2 h-2 rounded-full bg-gradient-to-r from-brand-500 via-accent-400 to-red-400">
                    {s.count > 1 && (
                      <span
                        className="absolute -top-1 h-4 w-1 rounded bg-slate-900"
                        style={{ left: `calc(${avgPos}% - 2px)` }}
                        title="Average"
                      />
                    )}
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>{formatRand(s.min)}</span>
                    <span>{formatRand(s.max)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

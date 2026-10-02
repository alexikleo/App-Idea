import { ArrowRight, BarChart3, Calculator } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import CategoryIcon from '../components/CategoryIcon'
import { EmptyState } from '../components/States'
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
      <h1 className="text-3xl font-extrabold">What should it cost?</h1>
      <p className="mt-1 max-w-prose text-muted">
        Typical prices listed by fundis on Fundi. Use this to check a quote before you agree to it.
      </p>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setParams({ category: c.id }, { replace: true })}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              c.id === categoryId ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-surface hover:border-brand-500'
            }`}
          >
            <CategoryIcon id={c.id} className="size-4" />
            {c.name}
          </button>
        ))}
      </div>

      <section className="card mt-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">{category?.name ?? 'Unknown'} prices</h2>
          <Link
            to={`/services?category=${categoryId}&sort=price_low`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
          >
            Cheapest {category?.name.toLowerCase()} first <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        {loading ? (
          <div className="mt-5 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : !stats?.length ? (
          <div className="mt-4">
            <EmptyState icon={BarChart3} title="Not enough price data yet">
              Prices appear here once fundis in this category list them.
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-5 space-y-6">
            {stats.map((s) => {
              const span = s.max - s.min || 1
              const avgPos = ((s.avg - s.min) / span) * 100
              return (
                <li key={s.serviceName}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold">{s.serviceName}</p>
                    <p className="text-sm text-muted">
                      avg <span className="font-display text-lg font-bold tabular-nums text-ink">{formatRand(s.avg)}</span> ·{' '}
                      {s.count} fundi{s.count === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="relative mt-2 h-2.5 rounded-full bg-gradient-to-r from-brand-500 via-marigold-400 to-alert-500">
                    {s.count > 1 && (
                      <span
                        className="absolute -top-1 h-4.5 w-1.5 rounded-full bg-ink ring-2 ring-surface"
                        style={{ left: `calc(${avgPos}% - 3px)` }}
                        title="Average"
                      />
                    )}
                  </div>
                  <div className="mt-1 flex justify-between text-xs tabular-nums text-muted">
                    <span>{formatRand(s.min)}</span>
                    <span>{formatRand(s.max)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Link
        to={`/check?category=${categoryId}`}
        className="card mt-4 flex items-center gap-3 p-4 transition hover:border-brand-500"
      >
        <Calculator className="size-6 text-marigold-500" aria-hidden />
        <span className="flex-1 font-semibold">Got a quote? Check if it’s fair</span>
        <ArrowRight className="size-5 text-faint" aria-hidden />
      </Link>
    </div>
  )
}

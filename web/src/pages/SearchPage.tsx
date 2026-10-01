import { Link, useSearchParams } from 'react-router-dom'
import ProviderCard from '../components/ProviderCard'
import { EmptyState, Loading } from '../components/States'
import { CATEGORIES, PROVINCES, getCategory } from '../data/categories'
import { listProviders } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import type { Province, SortOption } from '../types'

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const categoryId = params.get('category') ?? ''
  const province = (params.get('province') ?? '') as Province | ''
  const minRating = Number(params.get('minRating') ?? 0)
  const maxPrice = Number(params.get('maxPrice') ?? 0)
  const sort = (params.get('sort') ?? 'rating') as SortOption

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const { data: providers, loading } = useAsync(
    () =>
      listProviders({
        query: query || undefined,
        categoryId: categoryId || undefined,
        province: province || undefined,
        minRating: minRating || undefined,
        maxPrice: maxPrice || undefined,
        sort,
      }),
    [query, categoryId, province, minRating, maxPrice, sort],
  )

  const category = getCategory(categoryId)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">
            {category ? `${category.icon} ${category.name}s` : query ? `Results for “${query}”` : 'All services'}
          </h1>
          {category && <p className="text-sm text-slate-500">{category.description}</p>}
        </div>
        {category && (
          <Link to={`/prices?category=${category.id}`} className="text-sm font-medium text-brand-700 hover:underline">
            📊 See typical {category.name.toLowerCase()} prices
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-20">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
            <input
              defaultValue={query}
              key={query}
              onKeyDown={(e) => e.key === 'Enter' && update('q', e.currentTarget.value)}
              onBlur={(e) => update('q', e.currentTarget.value)}
              placeholder="Name, suburb, service…"
              className={selectClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Service</span>
            <select value={categoryId} onChange={(e) => update('category', e.target.value)} className={selectClass}>
              <option value="">All services</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Province</span>
            <select value={province} onChange={(e) => update('province', e.target.value)} className={selectClass}>
              <option value="">All of SA</option>
              {PROVINCES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Minimum rating</span>
            <select value={minRating || ''} onChange={(e) => update('minRating', e.target.value)} className={selectClass}>
              <option value="">Any</option>
              <option value="3">3★ and up</option>
              <option value="4">4★ and up</option>
              <option value="4.5">4.5★ and up</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Max starting price (R)</span>
            <input
              type="number"
              min={0}
              step={50}
              defaultValue={maxPrice || ''}
              onBlur={(e) => update('maxPrice', e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && update('maxPrice', e.currentTarget.value)}
              placeholder="e.g. 500"
              className={selectClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort by</span>
            <select value={sort} onChange={(e) => update('sort', e.target.value)} className={selectClass}>
              <option value="rating">Highest rated</option>
              <option value="reviews">Most reviews</option>
              <option value="price_low">Price: low to high</option>
              <option value="price_high">Price: high to low</option>
            </select>
          </label>
          <button
            onClick={() => setParams(new URLSearchParams(), { replace: true })}
            className="w-full rounded-lg border border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Clear filters
          </button>
        </aside>

        <section>
          {loading ? (
            <Loading label="Finding providers…" />
          ) : !providers?.length ? (
            <EmptyState title="No providers match yet">
              Try widening your filters, or{' '}
              <Link to="/join" className="font-medium text-brand-700 underline">
                list your business
              </Link>{' '}
              if you offer this service.
            </EmptyState>
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-500">
                {providers.length} provider{providers.length === 1 ? '' : 's'}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {providers.map((p) => (
                  <ProviderCard key={p.id} provider={p} categoryId={categoryId || undefined} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

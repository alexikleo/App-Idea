import { BarChart3, SearchX, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CategoryIcon from '../components/CategoryIcon'
import ProviderCard from '../components/ProviderCard'
import { CardSkeletons, EmptyState } from '../components/States'
import { CATEGORIES, PROVINCES, getCategory } from '../data/categories'
import { listProviders } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import type { Province, SortOption } from '../types'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const query = params.get('q') ?? ''
  const categoryId = params.get('category') ?? ''
  const province = (params.get('province') ?? '') as Province | ''
  const minRating = Number(params.get('minRating') ?? 0)
  const maxPrice = Number(params.get('maxPrice') ?? 0)
  const sort = (params.get('sort') ?? 'rating') as SortOption
  const activeFilters = [province, minRating, maxPrice].filter(Boolean).length

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {category && (
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-600 text-white">
              <CategoryIcon id={category.id} className="size-6" />
            </span>
          )}
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {category ? category.name : query ? `“${query}”` : 'All services'}
            </h1>
            {category && <p className="text-sm text-muted">{category.description}</p>}
          </div>
        </div>
        {category && (
          <Link to={`/prices?category=${category.id}`} className="btn-outline py-2 text-sm">
            <BarChart3 className="size-4" aria-hidden /> Typical prices
          </Link>
        )}
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        <button
          onClick={() => update('category', '')}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
            !categoryId ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-surface hover:border-brand-500'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => update('category', c.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              c.id === categoryId ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-surface hover:border-brand-500'
            }`}
          >
            <CategoryIcon id={c.id} className="size-4" />
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <div className="flex items-center justify-between lg:hidden">
          <button onClick={() => setShowFilters((s) => !s)} className="btn-outline py-2 text-sm">
            <SlidersHorizontal className="size-4" aria-hidden /> Filters
            {activeFilters > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{activeFilters}</span>}
          </button>
          <select
            value={sort}
            onChange={(e) => update('sort', e.target.value)}
            className="field w-auto py-2"
            aria-label="Sort by"
          >
            <option value="rating">Highest rated</option>
            <option value="reviews">Most reviews</option>
            <option value="price_low">Cheapest first</option>
            <option value="price_high">Priciest first</option>
          </select>
        </div>

        <aside className={`card h-fit space-y-4 p-4 lg:sticky lg:top-24 lg:block ${showFilters ? 'block' : 'hidden'}`}>
          <label className="block space-y-1.5">
            <span className="label">Search</span>
            <input
              defaultValue={query}
              key={query}
              onKeyDown={(e) => e.key === 'Enter' && update('q', e.currentTarget.value)}
              onBlur={(e) => update('q', e.currentTarget.value)}
              placeholder="Name, suburb, service…"
              className="field"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="label">Province</span>
            <select value={province} onChange={(e) => update('province', e.target.value)} className="field">
              <option value="">All of SA</option>
              {PROVINCES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <div className="space-y-1.5">
            <span className="label">Minimum rating</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 3, 4, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() => update('minRating', r ? String(r) : '')}
                  className={`rounded-lg border py-1.5 text-sm font-medium transition ${
                    minRating === r ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line hover:border-brand-500'
                  }`}
                >
                  {r ? `${r}★+` : 'Any'}
                </button>
              ))}
            </div>
          </div>
          <label className="block space-y-1.5">
            <span className="label">Max starting price (R)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={50}
              defaultValue={maxPrice || ''}
              onBlur={(e) => update('maxPrice', e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && update('maxPrice', e.currentTarget.value)}
              placeholder="e.g. 500"
              className="field"
            />
          </label>
          <label className="hidden space-y-1.5 lg:block">
            <span className="label">Sort by</span>
            <select value={sort} onChange={(e) => update('sort', e.target.value)} className="field">
              <option value="rating">Highest rated</option>
              <option value="reviews">Most reviews</option>
              <option value="price_low">Price: low to high</option>
              <option value="price_high">Price: high to low</option>
            </select>
          </label>
          <button onClick={() => setParams(new URLSearchParams(), { replace: true })} className="btn-ghost w-full text-sm">
            <X className="size-4" aria-hidden /> Clear all
          </button>
        </aside>

        <section className="min-w-0">
          {loading ? (
            <CardSkeletons />
          ) : !providers?.length ? (
            <EmptyState icon={SearchX} title="No fundis match yet">
              Try widening your filters, or{' '}
              <Link to="/join" className="font-semibold text-brand-600 underline">
                list your business
              </Link>{' '}
              if you offer this service.
            </EmptyState>
          ) : (
            <>
              <p className="mb-3 text-sm text-muted">
                {providers.length} fundi{providers.length === 1 ? '' : 's'} found
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

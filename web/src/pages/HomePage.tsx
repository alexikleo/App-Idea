import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProviderCard from '../components/ProviderCard'
import { Loading } from '../components/States'
import { CATEGORIES } from '../data/categories'
import { listProviders } from '../lib/api'
import { useAsync } from '../lib/useAsync'

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { data: topRated, loading } = useAsync(() => listProviders({ sort: 'rating' }), [])

  return (
    <>
      <section className="bg-gradient-to-br from-brand-700 to-brand-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
            Find a trusted fundi near you.
          </h1>
          <p className="mt-3 max-w-xl text-brand-50 sm:text-lg">
            Plumbers, electricians, solar installers and more across South Africa. Compare real prices and ratings,
            then call or WhatsApp directly.
          </p>
          <form
            className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/services${query ? `?q=${encodeURIComponent(query)}` : ''}`)
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you need? e.g. geyser, COC, gate motor"
              className="flex-1 rounded-xl border-0 bg-white px-4 py-3 text-slate-900 shadow-lg outline-none ring-accent-400 focus:ring-2"
            />
            <button className="rounded-xl bg-accent-500 px-6 py-3 font-semibold text-slate-900 shadow-lg hover:bg-accent-400">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-xl font-bold">Browse by service</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to={`/services?category=${c.id}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="text-sm font-medium leading-tight">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">Top rated</h2>
          <Link to="/services" className="text-sm font-medium text-brand-700 hover:underline">
            See all →
          </Link>
        </div>
        {loading ? (
          <Loading />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topRated?.slice(0, 6).map((p) => <ProviderCard key={p.id} provider={p} />)}
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3">
          {[
            ['💰', 'Transparent prices', 'Providers list their rates up front, so you can compare before you call.'],
            ['⭐', 'Honest ratings', 'Reviews from real customers, including what they actually paid.'],
            ['📱', 'Contact directly', 'Call or WhatsApp the provider. No middleman, no booking fees.'],
          ].map(([icon, title, text]) => (
            <div key={title}>
              <p className="text-3xl">{icon}</p>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

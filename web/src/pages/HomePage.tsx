import { ArrowRight, Calculator, ChevronRight, MessageCircle, Search, ShieldCheck, Siren, Tags } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CategoryIcon from '../components/CategoryIcon'
import ProviderCard from '../components/ProviderCard'
import { CardSkeletons } from '../components/States'
import { CATEGORIES } from '../data/categories'
import { getProvidersByIds, listProviders } from '../lib/api'
import { useMyFundis } from '../lib/myFundis'
import { useAsync } from '../lib/useAsync'

const POPULAR = ['Geyser', 'COC', 'Gate motor', 'Inverter', 'Blocked drain']

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { data: topRated, loading } = useAsync(() => listProviders({ sort: 'rating' }), [])
  const { recent } = useMyFundis()
  const recentKey = recent.slice(0, 4).join(',')
  const { data: recentProviders } = useAsync(() => getProvidersByIds(recentKey ? recentKey.split(',') : []), [recentKey])

  const search = (q: string) => navigate(`/services${q ? `?q=${encodeURIComponent(q)}` : ''}`)

  return (
    <>
      <section className="relative overflow-hidden bg-brand-700 text-white">
        <svg className="pointer-events-none absolute -right-24 -top-10 h-[130%] opacity-[0.07]" viewBox="0 0 64 64" aria-hidden>
          <path d="M14 31 32 16l18 15" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 48V36h16" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 sm:pb-16 sm:pt-16">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-brand-100">
            <span className="size-2 rounded-full bg-marigold-400" /> Plumbers, sparkies, solar &amp; more, across SA
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Find a fundi you can <span className="text-marigold-400">trust</span>, at a price that’s fair.
          </h1>
          <form
            className="mt-7 flex max-w-xl items-center gap-2 rounded-2xl bg-surface p-1.5 shadow-xl shadow-brand-900/30"
            onSubmit={(e) => {
              e.preventDefault()
              search(query)
            }}
          >
            <Search className="ml-2.5 size-5 shrink-0 text-faint" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you need fixed?"
              aria-label="Search services"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-ink outline-none placeholder:text-faint"
            />
            <button className="btn-accent">Search</button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {POPULAR.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => search(p)}
                className="rounded-full border border-white/20 px-3 py-1 text-brand-100 transition hover:bg-white/10"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-px grid max-w-6xl gap-3 px-4 pt-6 sm:grid-cols-2">
        <Link
          to="/check"
          className="card group flex items-center gap-4 p-4 transition hover:border-brand-500 hover:shadow-lg hover:shadow-brand-900/5"
        >
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-marigold-100 text-marigold-700">
            <Calculator className="size-6" aria-hidden />
          </div>
          <div className="flex-1">
            <p className="font-display text-lg font-bold">Is my quote fair?</p>
            <p className="text-sm text-muted">Check any quote against real local prices in seconds.</p>
          </div>
          <ChevronRight className="size-5 text-faint transition group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <Link
          to="/emergency"
          className="card group flex items-center gap-4 border-alert-500/30 bg-alert-50 p-4 transition hover:border-alert-500"
        >
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-alert-500 text-white">
            <Siren className="size-6" aria-hidden />
          </div>
          <div className="flex-1">
            <p className="font-display text-lg font-bold">Need help right now?</p>
            <p className="text-sm text-muted">Burst pipe, no power, locked out: 24/7 fundis.</p>
          </div>
          <ChevronRight className="size-5 text-faint transition group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <h2 className="text-2xl font-bold">What do you need?</h2>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to={`/services?category=${c.id}`}
              className="card group flex flex-col items-center gap-2 px-2 py-4 text-center transition hover:border-brand-500 hover:bg-brand-50"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <CategoryIcon id={c.id} className="size-5.5" />
              </span>
              <span className="text-xs font-semibold leading-tight sm:text-sm">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {recentProviders && recentProviders.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-10">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold">Recently viewed</h2>
            <Link to="/saved" className="text-sm font-semibold text-brand-600 hover:underline">
              My Fundis
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentProviders.slice(0, 3).map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Top rated near you</h2>
          <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
            See all <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-4">
          {loading ? (
            <CardSkeletons count={3} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topRated?.slice(0, 6).map((p) => <ProviderCard key={p.id} provider={p} />)}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold">How Fundi works</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Tags, title: 'Prices up front', text: 'Fundis list their call-out fees and rates, so you can compare before you call.' },
            { icon: ShieldCheck, title: 'Honest ratings', text: 'Reviews from real customers, including what they actually paid.' },
            { icon: MessageCircle, title: 'Contact directly', text: 'Call or WhatsApp the fundi yourself. No middleman, no booking fees.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
                <Icon className="size-5" aria-hidden />
              </div>
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-0.5 text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand-900 p-6 text-white sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-xl font-bold">Are you a fundi?</p>
            <p className="text-brand-100">List your business for free and get calls from local customers.</p>
          </div>
          <Link to="/join" className="btn-accent shrink-0">
            List your business
          </Link>
        </div>
      </section>
    </>
  )
}

import { Columns3, MessageSquareQuote, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getProvidersByIds } from '../lib/api'
import { MAX_SHORTLIST, useMyFundis } from '../lib/myFundis'
import { useAsync } from '../lib/useAsync'
import Avatar from './Avatar'

/** Floating bar showing the shortlist with Compare and Get quotes actions. */
export default function ShortlistTray() {
  const { pathname } = useLocation()
  const { shortlist, toggleShortlist, clearShortlist } = useMyFundis()
  const key = shortlist.join(',')
  const { data: providers } = useAsync(() => getProvidersByIds(key ? key.split(',') : []), [key])

  const hidden = !shortlist.length || pathname === '/compare' || pathname === '/request'
  if (hidden) return null
  const onProfile = pathname.startsWith('/providers/')

  return (
    <div
      className={`fixed inset-x-0 z-20 px-3 ${onProfile ? 'hidden md:block' : ''} bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-4`}
    >
      <div className="mx-auto flex max-w-2xl animate-rise flex-wrap items-center gap-3 rounded-2xl bg-brand-900 p-2.5 pl-3 text-white shadow-2xl shadow-brand-900/30">
        <div className="flex items-center -space-x-2">
          {providers?.map((p) => (
            <button
              key={p.id}
              onClick={() => toggleShortlist(p.id)}
              className="group relative rounded-2xl ring-2 ring-brand-900"
              aria-label={`Remove ${p.businessName ?? p.name} from shortlist`}
            >
              <Avatar id={p.id} name={p.name} photoUrl={p.photoUrl} />
              <span className="absolute -right-1 -top-1 hidden rounded-full bg-alert-500 p-0.5 group-hover:block">
                <X className="size-3" />
              </span>
            </button>
          ))}
        </div>
        <p className="min-w-0 flex-1 text-sm">
          <b>{shortlist.length}</b> of {MAX_SHORTLIST} shortlisted
          <button onClick={clearShortlist} className="ml-2 text-white/70 underline-offset-2 hover:underline">
            Clear
          </button>
        </p>
        <div className="flex w-full gap-2 sm:w-auto">
          <Link
            to="/compare"
            className={`btn flex-1 whitespace-nowrap bg-white/10 py-2 text-sm hover:bg-white/20 ${shortlist.length < 2 ? 'pointer-events-none opacity-50' : ''}`}
            aria-disabled={shortlist.length < 2}
          >
            <Columns3 className="size-4" aria-hidden /> Compare
          </Link>
          <Link to="/request" className="btn-accent flex-1 whitespace-nowrap py-2 text-sm">
            <MessageSquareQuote className="size-4" aria-hidden /> Get quotes
          </Link>
        </div>
      </div>
    </div>
  )
}

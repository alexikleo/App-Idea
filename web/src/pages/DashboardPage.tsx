import { BadgeCheck, Check, Eye, MapPin, QrCode, Star, Store, Wrench } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { AboutFields, AreaFields, ServicesFields } from '../components/ListingForm'
import { type Section, useListingDraft } from '../lib/listingDraft'
import { StarRating } from '../components/StarRating'
import { EmptyState, Loading } from '../components/States'
import StrengthMeter from '../components/StrengthMeter'
import { getMyListing, saveMyListing } from '../lib/api'
import { useAuth } from '../lib/authContext'
import { listingStrength } from '../lib/strength'
import { useAsync } from '../lib/useAsync'
import type { Provider } from '../types'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: listing, loading, reload } = useAsync(getMyListing, [user?.id])

  if (loading && !listing) return <Loading />
  if (!listing)
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <EmptyState icon={Store} title="You don’t have a listing yet">
          <Link to="/join" className="btn-primary mt-3">
            List your business
          </Link>
        </EmptyState>
      </div>
    )
  // Remount the editor when the saved listing changes so the form starts from it.
  return <Editor key={listing.id} listing={listing} onSaved={reload} />
}

const SECTIONS: { id: Section; title: string; icon: typeof Wrench }[] = [
  { id: 'about', title: 'About you', icon: Store },
  { id: 'services', title: 'Services & prices', icon: Wrench },
  { id: 'area', title: 'Area & availability', icon: MapPin },
]

function Editor({ listing, onSaved }: { listing: Provider; onSaved: () => void }) {
  const draft = useListingDraft(listing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function save() {
    for (const s of SECTIONS) {
      const problem = draft.validate(s.id)
      if (problem) {
        setError(`${s.title}: ${problem}`)
        document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    setError('')
    setSaving(true)
    try {
      await saveMyListing(draft.toInput())
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onSaved()
      }, 1200)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar id={listing.id} name={listing.name} photoUrl={listing.photoUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="label">Your listing</p>
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{listing.businessName ?? listing.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <StarRating value={listing.ratingAvg} count={listing.ratingCount} />
            {listing.verified ? (
              <span className="chip bg-brand-100 text-brand-700">
                <BadgeCheck className="size-3.5" aria-hidden /> Verified
              </span>
            ) : (
              <span className="chip">Not yet verified</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Link to={`/providers/${listing.id}`} className="btn-outline">
          <Eye className="size-4" aria-hidden /> View listing
        </Link>
        <Link to={`/providers/${listing.id}/card`} className="btn-outline">
          <QrCode className="size-4" aria-hidden /> QR card
        </Link>
        <Link to={`/providers/${listing.id}#reviews`} className="btn-outline col-span-2 sm:col-span-1">
          <Star className="size-4" aria-hidden /> {listing.ratingCount} review{listing.ratingCount === 1 ? '' : 's'}
        </Link>
      </div>

      <section className="card mt-5 p-5">
        <StrengthMeter result={listingStrength(draft.strengthInput)} />
      </section>

      {SECTIONS.map(({ id, title, icon: Icon }) => (
        <section key={id} id={`section-${id}`} className="card mt-4 scroll-mt-24 space-y-4 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Icon className="size-5 text-brand-600" aria-hidden /> {title}
          </h2>
          {id === 'about' && <AboutFields draft={draft} />}
          {id === 'services' && <ServicesFields draft={draft} />}
          {id === 'area' && <AreaFields draft={draft} />}
        </section>
      ))}

      <p className="mt-4 text-xs text-faint">
        Verification is done by the Fundi team. Email us your trade registration (e.g. PIRB, ECSA, SAPCA) to get the Verified badge.
      </p>

      <div className="fixed inset-x-0 bottom-[calc(4.1rem+env(safe-area-inset-bottom))] z-20 border-t border-line bg-surface/95 p-3 backdrop-blur-md md:bottom-0">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <p className="min-w-0 flex-1 text-sm" role="status">
            {error ? <span className="text-alert-600">{error}</span> : saved ? 'Saved. Customers see your changes now.' : 'Changes go live as soon as you save.'}
          </p>
          <button onClick={save} disabled={saving} className="btn-primary shrink-0">
            {saved ? <Check className="size-4" aria-hidden /> : null}
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

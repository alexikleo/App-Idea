import { Check, ChevronRight, Heart, LogOut, Store, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { getMyListing } from '../lib/api'
import { useAuth } from '../lib/authContext'
import { useAsync } from '../lib/useAsync'

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, isDemo, signOut, setDisplayName } = useAuth()
  const { data: listing, loading } = useAsync(getMyListing, [user?.id])
  const [name, setName] = useState(user?.displayName ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-600 text-white">
          <UserRound className="size-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold">Your account</h1>
          <p className="truncate text-muted">Signed in as {user.email ?? user.phone}</p>
        </div>
      </div>
      {isDemo && (
        <p className="mt-4 rounded-xl bg-marigold-100 p-3 text-sm text-marigold-700">
          Demo mode: your account and listing are saved on this device only.
        </p>
      )}

      <section className="card mt-6 p-5">
        <h2 className="text-lg font-bold">Your listing</h2>
        {loading ? (
          <div className="skeleton mt-3 h-16 w-full" />
        ) : listing ? (
          <Link to="/dashboard" className="mt-3 flex items-center gap-3 rounded-xl bg-canvas p-3 transition hover:bg-sunken">
            <Avatar id={listing.id} name={listing.name} photoUrl={listing.photoUrl} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{listing.businessName ?? listing.name}</p>
              <p className="text-sm text-muted">Edit your prices, services and details</p>
            </div>
            <ChevronRight className="size-5 text-faint" aria-hidden />
          </Link>
        ) : (
          <Link to="/join" className="mt-3 flex items-center gap-3 rounded-xl bg-canvas p-3 transition hover:bg-sunken">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700">
              <Store className="size-6" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Are you a fundi?</p>
              <p className="text-sm text-muted">List your business for free</p>
            </div>
            <ChevronRight className="size-5 text-faint" aria-hidden />
          </Link>
        )}
      </section>

      <section className="card mt-4 space-y-3 p-5">
        <h2 className="text-lg font-bold">Name on your reviews</h2>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            setError('')
            try {
              await setDisplayName(name)
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
            } catch (err) {
              setError((err as Error).message)
            }
          }}
        >
          <input
            id="account-name"
            className="field"
            placeholder="e.g. Thandi M."
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn-primary shrink-0">{saved ? <Check className="size-4" aria-label="Saved" /> : 'Save'}</button>
        </form>
        <p className="text-xs text-faint">Shown next to reviews you write. First name and surname initial works well.</p>
        {error && <p className="text-sm text-alert-600">{error}</p>}
      </section>

      <section className="card mt-4 divide-y divide-line">
        <Link to="/saved" className="flex items-center gap-3 p-4 transition hover:bg-canvas">
          <Heart className="size-5 text-muted" aria-hidden />
          <span className="flex-1 font-medium">My Fundis</span>
          <ChevronRight className="size-5 text-faint" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={async () => {
            await signOut()
            navigate('/')
          }}
          className="flex w-full items-center gap-3 p-4 text-left text-alert-600 transition hover:bg-canvas"
        >
          <LogOut className="size-5" aria-hidden />
          <span className="flex-1 font-medium">Sign out</span>
        </button>
      </section>
    </div>
  )
}

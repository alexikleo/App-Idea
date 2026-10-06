import { ArrowLeft, Download, Printer, QrCode, UserX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, Loading } from '../components/States'
import { getProvider } from '../lib/api'
import { qrDataUrl, renderBusinessCard } from '../lib/businessCard'
import { providerUrl } from '../lib/share'
import { useAuth } from '../lib/authContext'
import { useAsync } from '../lib/useAsync'

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function BusinessCardPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const { data: provider, loading } = useAsync(() => getProvider(id), [id, user?.id])
  const [card, setCard] = useState<string>()
  const [qr, setQr] = useState<string>()

  useEffect(() => {
    if (!provider) return
    const url = providerUrl(provider)
    renderBusinessCard(provider, url).then(setCard)
    qrDataUrl(url).then(setQr)
  }, [provider])

  if (loading && !provider) return <Loading />
  if (!provider)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState icon={UserX} title="We couldn’t find that fundi" />
      </div>
    )
  if (!provider.isMine)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState icon={QrCode} title="Only the owner of this listing can get its QR card">
          If this is your business, sign in with the account you used to list it.
        </EmptyState>
      </div>
    )

  const name = slug(provider.businessName ?? provider.name)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link to={`/providers/${provider.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink print:hidden">
        <ArrowLeft className="size-4" aria-hidden /> Back to profile
      </Link>
      <div className="mt-3 flex items-center gap-3 print:hidden">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-600 text-white">
          <QrCode className="size-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold">Your Fundi QR card</h1>
          <p className="text-muted">Put it on your bakkie, invoices, flyers or WhatsApp status. Customers scan it to see your prices and reviews.</p>
        </div>
      </div>

      <div className="mt-6">
        {card ? (
          <img
            src={card}
            alt={`Business card for ${provider.businessName ?? provider.name} with QR code`}
            className="w-full rounded-2xl border border-line shadow-xl shadow-brand-900/10 print:w-[3.5in] print:rounded-none print:shadow-none"
          />
        ) : (
          <div className="skeleton aspect-[1050/600] w-full rounded-2xl" />
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 print:hidden">
        {card && (
          <a href={card} download={`fundi-card-${name}.png`} className="btn-primary">
            <Download className="size-4" aria-hidden /> Download card
          </a>
        )}
        {qr && (
          <a href={qr} download={`fundi-qr-${name}.png`} className="btn-outline">
            <QrCode className="size-4" aria-hidden /> Download QR only
          </a>
        )}
        <button type="button" onClick={() => window.print()} className="btn-outline">
          <Printer className="size-4" aria-hidden /> Print
        </button>
      </div>

      <div className="card mt-6 p-5 text-sm print:hidden">
        <p className="font-semibold">Ideas for using your card</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          <li>Print it as a sticker for your bakkie window or toolbox.</li>
          <li>Add it to quotes and invoices so happy customers can leave a review.</li>
          <li>Post it as your WhatsApp status or profile picture.</li>
        </ul>
      </div>
    </div>
  )
}

import { Check, Copy, MessageCircle, Share2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { providerUrl, shareText, whatsappShareLink } from '../lib/share'
import type { Provider } from '../types'

export default function ShareButton({ provider }: { provider: Provider }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  async function onShare() {
    // Phones get the native share sheet (WhatsApp, SMS, etc.).
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: provider.businessName ?? provider.name, text: shareText(provider), url: providerUrl(provider) })
        return
      } catch {
        // Cancelled or unsupported: fall back to the menu.
      }
    }
    setOpen((o) => !o)
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(providerUrl(provider))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link', providerUrl(provider))
    }
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={onShare} className="btn-outline py-2 text-sm" aria-expanded={open}>
        <Share2 className="size-4" aria-hidden /> Share
      </button>
      {open && (
        <div className="card absolute right-0 top-full z-20 mt-2 w-56 animate-rise p-1.5 shadow-xl shadow-brand-900/10">
          <a
            href={whatsappShareLink(provider)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-sunken"
          >
            <MessageCircle className="size-4 text-[#1da851]" aria-hidden /> Share on WhatsApp
          </a>
          <button
            type="button"
            onClick={copy}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-sunken"
          >
            {copied ? <Check className="size-4 text-brand-600" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? 'Link copied' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  )
}

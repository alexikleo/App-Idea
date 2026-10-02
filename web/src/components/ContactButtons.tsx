import { MessageCircle, Phone } from 'lucide-react'
import { formatPhone, whatsappLink } from '../lib/format'
import type { Provider } from '../types'

export default function ContactButtons({ provider, compact = false }: { provider: Provider; compact?: boolean }) {
  const size = compact ? 'py-2 text-sm' : 'py-3'
  return (
    <div className={`flex gap-2 ${compact ? '' : 'flex-col'}`}>
      <a href={`tel:${provider.phone}`} className={`btn-primary flex-1 whitespace-nowrap ${size}`}>
        <Phone className="size-4" aria-hidden />
        {compact ? 'Call' : formatPhone(provider.phone)}
      </a>
      {provider.whatsapp && (
        <a
          href={whatsappLink(provider.whatsapp, `Hi ${provider.name}, I found you on Fundi and would like a quote.`)}
          target="_blank"
          rel="noreferrer"
          className={`btn flex-1 whitespace-nowrap bg-[#25D366] text-[#073b1e] hover:brightness-95 ${size}`}
        >
          <MessageCircle className="size-4" aria-hidden />
          WhatsApp
        </a>
      )}
    </div>
  )
}

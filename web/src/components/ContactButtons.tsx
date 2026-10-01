import { formatPhone, whatsappLink } from '../lib/format'
import type { Provider } from '../types'

export default function ContactButtons({ provider, compact = false }: { provider: Provider; compact?: boolean }) {
  const pad = compact ? 'px-3 py-2 text-sm' : 'px-4 py-3'
  return (
    <div className={`flex gap-2 ${compact ? 'flex-wrap' : 'flex-col'}`}>
      <a
        href={`tel:${provider.phone}`}
        className={`inline-flex flex-1 items-center whitespace-nowrap justify-center gap-2 rounded-lg bg-brand-600 font-semibold text-white hover:bg-brand-700 ${pad}`}
      >
        📞 {compact ? 'Call' : formatPhone(provider.phone)}
      </a>
      {provider.whatsapp && (
        <a
          href={whatsappLink(provider.whatsapp, `Hi ${provider.name}, I found you on Fundi and would like a quote.`)}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex flex-1 items-center whitespace-nowrap justify-center gap-2 rounded-lg bg-[#25D366] font-semibold text-white hover:brightness-95 ${pad}`}
        >
          💬 WhatsApp
        </a>
      )}
    </div>
  )
}

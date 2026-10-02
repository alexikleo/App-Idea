import type { Provider } from '../types'

export function providerUrl(provider: Provider): string {
  return new URL(`${import.meta.env.BASE_URL}providers/${provider.id}`, window.location.origin).toString()
}

export function shareText(provider: Provider): string {
  const name = provider.businessName ?? provider.name
  const rating = provider.ratingCount ? ` (${provider.ratingAvg.toFixed(1)}★ from ${provider.ratingCount} reviews)` : ''
  return `Here's a ${provider.location.city} fundi I found: ${name}${rating}`
}

export function whatsappShareLink(provider: Provider): string {
  return `https://wa.me/?text=${encodeURIComponent(`${shareText(provider)} ${providerUrl(provider)}`)}`
}

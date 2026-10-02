import QRCode from 'qrcode'
import { getCategory } from '../data/categories'
import type { Provider } from '../types'
import { formatPhone } from './format'

export const CARD_W = 1050
export const CARD_H = 600

const FOREST = '#0d4a3a'
const MARIGOLD = '#fbc531'
const INK = '#11211b'
const MUTED = '#5b6b64'

export function qrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, width: 600, errorCorrectionLevel: 'M', color: { dark: FOREST, light: '#ffffff' } })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number, weight: number, family: string) {
  let size = startSize
  do {
    ctx.font = `${weight} ${size}px ${family}`
    size -= 2
  } while (ctx.measureText(text).width > maxWidth && size > 20)
}

/** Draws a 3.5 × 2 business card (PNG data URL) with the provider's QR code. */
export async function renderBusinessCard(provider: Provider, url: string): Promise<string> {
  await document.fonts.ready
  const display = '"Bricolage Grotesque Variable", system-ui, sans-serif'
  const body = '"Figtree Variable", system-ui, sans-serif'
  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, CARD_W, CARD_H)
  ctx.fillStyle = FOREST
  ctx.fillRect(0, CARD_H - 70, CARD_W, 70)

  // Logo mark: roof + "f" + marigold dot.
  ctx.save()
  ctx.translate(60, 52)
  ctx.scale(0.9, 0.9)
  ctx.fillStyle = FOREST
  ctx.beginPath()
  ctx.roundRect(0, 0, 64, 64, 16)
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(14, 31)
  ctx.lineTo(32, 16)
  ctx.lineTo(50, 31)
  ctx.moveTo(24, 48)
  ctx.lineTo(24, 36)
  ctx.lineTo(40, 36)
  ctx.stroke()
  ctx.fillStyle = MARIGOLD
  ctx.beginPath()
  ctx.arc(44, 46, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.fillStyle = FOREST
  ctx.font = `800 40px ${display}`
  ctx.fillText('fundi', 128, 96)

  const textW = 560
  const name = provider.businessName ?? provider.name
  ctx.fillStyle = INK
  fitText(ctx, name, textW, 60, 800, display)
  ctx.fillText(name, 60, 210)

  const trades = provider.categoryIds.map((c) => getCategory(c)?.name).filter(Boolean).join(' · ')
  ctx.fillStyle = MUTED
  fitText(ctx, trades, textW, 30, 500, body)
  ctx.fillText(trades, 60, 258)

  if (provider.ratingCount) {
    ctx.fillStyle = '#f2a900'
    ctx.font = `700 32px ${body}`
    ctx.fillText('★★★★★'.slice(0, Math.round(provider.ratingAvg)), 60, 318)
    ctx.fillStyle = INK
    ctx.fillText(`${provider.ratingAvg.toFixed(1)}  (${provider.ratingCount} reviews)`, 60 + 30 * 5 + 18, 318)
  }

  ctx.fillStyle = INK
  ctx.font = `800 52px ${display}`
  ctx.fillText(formatPhone(provider.phone), 60, 410)
  ctx.fillStyle = MUTED
  ctx.font = `500 26px ${body}`
  ctx.fillText(`${provider.location.city}${provider.available24h ? '  ·  24/7 call-outs' : ''}`, 60, 452)

  const qr = await loadImage(await qrDataUrl(url))
  const qrSize = 330
  const qx = CARD_W - qrSize - 60
  ctx.drawImage(qr, qx, 60, qrSize, qrSize)
  ctx.fillStyle = INK
  ctx.font = `700 24px ${body}`
  ctx.textAlign = 'center'
  ctx.fillText('Scan for my prices', qx + qrSize / 2, 60 + qrSize + 40)
  ctx.fillText('& reviews', qx + qrSize / 2, 60 + qrSize + 70)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.font = `600 26px ${body}`
  ctx.fillText('Find me on Fundi', 60, CARD_H - 26)
  ctx.textAlign = 'right'
  ctx.fillStyle = MARIGOLD
  ctx.fillText(new URL(url).host + new URL(url).pathname.replace(/\/$/, ''), CARD_W - 60, CARD_H - 26)

  return canvas.toDataURL('image/png')
}

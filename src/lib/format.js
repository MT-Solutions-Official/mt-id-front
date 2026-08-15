import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function firstName(name) {
  return name?.trim().split(/\s+/)[0] || 'owner'
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function relativeTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
}

export function isLocalOrigin(origin) {
  return /localhost|127\.0\.0\.1/i.test(origin || '')
}

export function ownerPhoto(owner) {
  return owner?.images?.find((image) => image.imageType === 'PROFILE')?.imageUrl
}

export function formatAddress(address) {
  if (!address) return ''
  const line = [address.street, address.number, address.complement].filter(Boolean).join(', ')
  const city = [address.neighborhood, address.city, address.state, address.zipCode].filter(Boolean).join(' · ')
  return [line, city].filter(Boolean).join(' — ')
}

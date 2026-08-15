import { parsePhoneNumberFromString } from 'libphonenumber-js'

export function formatPhoneDisplay(value) {
  const parsed = parsePhoneNumberFromString(value || '')
  return parsed ? parsed.formatInternational() : value || ''
}

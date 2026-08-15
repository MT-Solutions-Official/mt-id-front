export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

export const masks = {
  cpf: {
    imask: '000.000.000-00',
    unmask: digitsOnly,
    inputMode: 'numeric',
    autoComplete: 'off',
    placeholder: '000.000.000-00',
  },
  cnpj: {
    imask: '00.000.000/0000-00',
    unmask: digitsOnly,
    inputMode: 'numeric',
    autoComplete: 'off',
    placeholder: '00.000.000/0000-00',
  },
  cep: {
    imask: '00000-000',
    unmask: digitsOnly,
    inputMode: 'numeric',
    autoComplete: 'postal-code',
    placeholder: '00000-000',
  },
  zip5: {
    imask: '00000',
    unmask: digitsOnly,
    inputMode: 'numeric',
    autoComplete: 'postal-code',
    placeholder: '00000',
  },
  zipPt: {
    imask: '0000-000',
    unmask: formatPortugueseZip,
    inputMode: 'numeric',
    autoComplete: 'postal-code',
    placeholder: '1000-001',
  },
}

const ZIP_MASK = {
  BR: 'cep',
  US: 'zip5',
  PT: 'zipPt',
  ID: 'zip5',
}

export function formatPortugueseZip(value) {
  const digits = digitsOnly(value).slice(0, 7)
  if (digits.length !== 7) return digits
  return `${digits.slice(0, 4)}-${digits.slice(4)}`
}

export function zipMask(country) {
  return ZIP_MASK[country] || 'cep'
}

export function normalizeZip(country, value) {
  if (country === 'PT') return formatPortugueseZip(value)
  if (country === 'US' || country === 'ID') return digitsOnly(value).slice(0, 5)
  return digitsOnly(value)
}

export function isZipReady(country, value) {
  const zip = normalizeZip(country, value)
  if (country === 'PT') return zip.length === 8
  if (country === 'US' || country === 'ID') return zip.length === 5
  return zip.length === 8
}

export function unmask(name, value) {
  return masks[name]?.unmask ? masks[name].unmask(value) : value
}

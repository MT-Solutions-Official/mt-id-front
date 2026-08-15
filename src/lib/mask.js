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
}

export function unmask(name, value) {
  return masks[name]?.unmask ? masks[name].unmask(value) : value
}

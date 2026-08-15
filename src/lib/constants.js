export const REQUIRED_FIELDS = [
  { id: 'NAME', label: 'Nome' },
  { id: 'USERNAME', label: 'Username' },
  { id: 'EMAIL', label: 'E-mail' },
  { id: 'PASSWORD', label: 'Senha' },
  { id: 'PHONE', label: 'Telefone' },
  { id: 'DOCUMENT', label: 'Documento' },
  { id: 'MARITAL_STATUS', label: 'Estado civil' },
]

export const PASSWORD_HINT =
  'Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.'

export const PASSWORD_CHECKS = [
  { id: 'len', label: '8+ caracteres', test: (value) => value.length >= 8 },
  { id: 'case', label: 'Maiúscula e minúscula', test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { id: 'num', label: 'Número', test: (value) => /\d/.test(value) },
  { id: 'sym', label: 'Caractere especial', test: (value) => /[^A-Za-z0-9]/.test(value) },
]

export const RESERVED_ROLE_NAMES = ['USER', 'APPLICATION', 'REFRESH_TOKEN', 'OWNER', 'OWNER_WRITER', 'OWNER_VIEWER']

export function isReservedRoleName(name) {
  return RESERVED_ROLE_NAMES.includes(String(name || '').trim().toUpperCase())
}

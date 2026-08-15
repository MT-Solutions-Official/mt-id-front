import { toast } from 'sonner'

export async function copyText(value, label = 'Valor') {
  await navigator.clipboard.writeText(value || '')
  toast.success(`${label} copiado`)
}

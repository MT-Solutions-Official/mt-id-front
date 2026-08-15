import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { addresses } from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'
import { unmask } from '../../lib/mask'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { cn } from '../../lib/cn'

const COUNTRIES = [
  { id: 'BR', label: 'Brasil' },
  { id: 'US', label: 'Estados Unidos' },
  { id: 'PT', label: 'Portugal' },
  { id: 'ID', label: 'Indonésia' },
]

export const EMPTY_ADDRESS = {
  country: 'BR',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  rt: '',
  rw: '',
  kelurahan: '',
  kecamatan: '',
}

export function toAddressPayload(form) {
  return {
    country: form.country,
    zipCode: form.country === 'PT' ? form.zipCode.trim() : unmask('cep', form.zipCode),
    street: form.street.trim(),
    number: form.number.trim(),
    complement: form.complement.trim() || undefined,
    neighborhood: form.neighborhood.trim() || undefined,
    city: form.city.trim(),
    state: form.state.trim(),
    rt: form.rt.trim() || undefined,
    rw: form.rw.trim() || undefined,
    kelurahan: form.kelurahan.trim() || undefined,
    kecamatan: form.kecamatan.trim() || undefined,
  }
}

export function isAddressComplete(form) {
  const zip = form.country === 'PT' ? form.zipCode.trim() : unmask('cep', form.zipCode)
  if (!zip || !form.street.trim() || !form.number.trim() || !form.city.trim() || !form.state.trim()) {
    return false
  }
  if (form.country === 'ID' && (!form.rt.trim() || !form.rw.trim())) {
    return false
  }
  return true
}

export function OwnerAddressForm({ onSubmit, saving, embedded = false, value, onChange }) {
  const [internal, setInternal] = useState(EMPTY_ADDRESS)
  const form = embedded ? value : internal
  const [looking, setLooking] = useState(false)
  const lookedZip = useRef('')

  function setForm(next) {
    if (embedded) onChange(next)
    else setInternal(next)
  }

  function setField(key, nextValue) {
    if (key === 'zipCode') lookedZip.current = ''
    setForm({ ...form, [key]: nextValue })
  }

  async function lookup(event) {
    event?.preventDefault()
    const zip = form.country === 'PT' ? form.zipCode.trim() : unmask('cep', form.zipCode)
    if (!zip) {
      toast.error('Informe o CEP / ZIP.')
      return
    }
    if (form.country !== 'BR') {
      if (!form.street.trim() || !form.number.trim()) {
        toast.error('Para este país, informe rua e número antes de buscar o CEP.')
        return
      }
    }
    if (form.country === 'ID' && (!form.rt.trim() || !form.rw.trim())) {
      toast.error('Informe RT e RW para buscar o CEP da Indonésia.')
      return
    }

    setLooking(true)
    try {
      const params = {
        number: form.number || undefined,
        complement: form.complement || undefined,
        street: form.street || undefined,
        rt: form.rt || undefined,
        rw: form.rw || undefined,
      }
      const { data } = await addresses.lookup(form.country, zip, params)
      setForm({
        ...form,
        country: form.country,
        zipCode: data.zipCode || form.zipCode,
        street: data.street || form.street,
        neighborhood: data.neighborhood || form.neighborhood,
        city: data.city || form.city,
        state: data.state || form.state,
        kelurahan: data.kelurahan || form.kelurahan,
        kecamatan: data.kecamatan || form.kecamatan,
        number: data.number || form.number,
        complement: data.complement || form.complement,
      })
      lookedZip.current = zip
      toast.success('Endereço encontrado pelo CEP.')
    } catch (error) {
      lookedZip.current = zip
      toast.error(getErrorMessage(error))
    } finally {
      setLooking(false)
    }
  }

  useEffect(() => {
    if (form.country !== 'BR') return undefined
    const digits = unmask('cep', form.zipCode)
    if (digits.length !== 8 || lookedZip.current === digits) return undefined
    const timer = window.setTimeout(() => {
      lookup()
    }, 450)
    return () => window.clearTimeout(timer)
  }, [form.zipCode, form.country])

  function submit(event) {
    event.preventDefault()
    if (!isAddressComplete(form)) {
      toast.error('Busque o CEP e complete rua, número, cidade e estado.')
      return
    }
    onSubmit(toAddressPayload(form))
    lookedZip.current = ''
    setForm({ ...EMPTY_ADDRESS, country: form.country })
  }

  const fields = (
    <>
      <div className="flex flex-wrap gap-1 rounded-xl border border-line p-1">
        {COUNTRIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              lookedZip.current = ''
              setForm({ ...EMPTY_ADDRESS, country: item.id })
            }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs',
              form.country === item.id ? 'bg-white/8 text-ink' : 'text-ink-muted hover:text-ink',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          label={form.country === 'BR' ? 'CEP' : 'ZIP / código postal'}
          mask={form.country === 'BR' ? 'cep' : undefined}
          value={form.zipCode}
          onChange={(event) => setField('zipCode', event.target.value)}
          hint={form.country === 'BR' ? 'Busca automática no ViaCEP ao completar 8 dígitos.' : 'Informe rua e número e clique em buscar.'}
        />
        <Button type="button" variant="secondary" className="mt-7 self-end" disabled={looking} onClick={lookup}>
          <Search className="h-4 w-4" />
          {looking ? 'Buscando…' : 'Buscar'}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <Input label="Rua" value={form.street} onChange={(event) => setField('street', event.target.value)} />
        <Input label="Número" value={form.number} onChange={(event) => setField('number', event.target.value)} />
      </div>
      <Input label="Complemento" value={form.complement} onChange={(event) => setField('complement', event.target.value)} />
      {form.country === 'BR' || form.country === 'PT' ? (
        <Input
          label={form.country === 'PT' ? 'Freguesia' : 'Bairro'}
          value={form.neighborhood}
          onChange={(event) => setField('neighborhood', event.target.value)}
        />
      ) : null}
      {form.country === 'ID' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="RT" value={form.rt} onChange={(event) => setField('rt', event.target.value)} />
          <Input label="RW" value={form.rw} onChange={(event) => setField('rw', event.target.value)} />
          <Input label="Kelurahan" value={form.kelurahan} onChange={(event) => setField('kelurahan', event.target.value)} />
          <Input label="Kecamatan" value={form.kecamatan} onChange={(event) => setField('kecamatan', event.target.value)} />
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Cidade" value={form.city} onChange={(event) => setField('city', event.target.value)} />
        <Input label={form.country === 'BR' ? 'UF' : 'Estado'} value={form.state} onChange={(event) => setField('state', event.target.value)} />
      </div>
    </>
  )

  if (embedded) {
    return <div className="space-y-4">{fields}</div>
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {fields}
      <Button type="submit" disabled={saving}>
        {saving ? 'Salvando…' : 'Adicionar endereço'}
      </Button>
    </form>
  )
}

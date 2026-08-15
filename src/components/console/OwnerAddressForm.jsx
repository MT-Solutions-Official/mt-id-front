import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { addresses } from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'
import { isZipReady, normalizeZip, zipMask } from '../../lib/mask'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { cn } from '../../lib/cn'

const COUNTRIES = [
  { id: 'BR', label: 'Brasil' },
  { id: 'US', label: 'Estados Unidos' },
  { id: 'PT', label: 'Portugal' },
  { id: 'ID', label: 'Indonésia' },
]

const COUNTRY_UI = {
  BR: {
    zipLabel: 'CEP',
    zipHint: 'Ao completar 8 dígitos, preenche rua, bairro, cidade e UF.',
    zipIncomplete: 'Informe um CEP com 8 dígitos.',
    stateLabel: 'UF',
    neighborhoodLabel: 'Bairro',
    found: 'Endereço encontrado pelo CEP.',
  },
  US: {
    zipLabel: 'ZIP',
    zipHint: '5 dígitos. A busca preenche só cidade e estado.',
    zipIncomplete: 'Informe um ZIP com 5 dígitos.',
    stateLabel: 'Estado',
    found: 'Cidade e estado preenchidos. Confira rua e número.',
  },
  PT: {
    zipLabel: 'Código postal',
    zipHint: 'Formato 1000-001. A busca preenche só cidade e distrito.',
    zipIncomplete: 'Informe o código postal no formato 1000-001.',
    stateLabel: 'Distrito',
    neighborhoodLabel: 'Freguesia',
    found: 'Cidade e distrito preenchidos. Confira rua e número.',
  },
  ID: {
    zipLabel: 'Kode pos',
    zipHint: '5 dígitos. A busca preenche kelurahan, kecamatan, cidade e província.',
    zipIncomplete: 'Informe um kode pos com 5 dígitos.',
    stateLabel: 'Província',
    found: 'Localidade preenchida. Confira rua, número, RT e RW.',
  },
}

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

function lookupKey(form) {
  return `${form.country}:${normalizeZip(form.country, form.zipCode)}`
}

function canAutoLookup(form) {
  if (!isZipReady(form.country, form.zipCode)) return false
  if (form.country === 'BR') return true
  if (!form.street.trim() || !form.number.trim()) return false
  if (form.country === 'ID' && (!form.rt.trim() || !form.rw.trim())) return false
  return true
}

export function toAddressPayload(form) {
  return {
    country: form.country,
    zipCode: normalizeZip(form.country, form.zipCode),
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
  if (!isZipReady(form.country, form.zipCode)) return false
  if (!form.street.trim() || !form.number.trim() || !form.city.trim() || !form.state.trim()) {
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
  const ui = COUNTRY_UI[form.country] || COUNTRY_UI.BR

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
    const zip = normalizeZip(form.country, form.zipCode)
    if (!isZipReady(form.country, form.zipCode)) {
      toast.error(ui.zipIncomplete)
      return
    }
    if (form.country !== 'BR' && (!form.street.trim() || !form.number.trim())) {
      toast.error('Informe rua e número antes de buscar. O código postal não devolve a rua.')
      return
    }
    if (form.country === 'ID' && (!form.rt.trim() || !form.rw.trim())) {
      toast.error('Informe RT e RW para buscar o kode pos da Indonésia.')
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
      lookedZip.current = lookupKey(form)
      toast.success(ui.found)
    } catch (error) {
      lookedZip.current = lookupKey(form)
      toast.error(getErrorMessage(error))
    } finally {
      setLooking(false)
    }
  }

  useEffect(() => {
    if (!canAutoLookup(form)) return undefined
    const key = lookupKey(form)
    if (lookedZip.current === key) return undefined
    const timer = window.setTimeout(() => {
      lookup()
    }, 450)
    return () => window.clearTimeout(timer)
  }, [form.zipCode, form.country, form.street, form.number, form.rt, form.rw])

  function submit(event) {
    event.preventDefault()
    if (!isAddressComplete(form)) {
      toast.error(
        form.country === 'BR'
          ? 'Busque o CEP e complete rua, número, cidade e estado.'
          : 'Busque o código postal e complete rua, número, cidade e estado.',
      )
      return
    }
    onSubmit(toAddressPayload(form))
    lookedZip.current = ''
    setForm({ ...EMPTY_ADDRESS, country: form.country })
  }

  const zipField = (
    <div className="flex items-start gap-2">
      <Input
        label={ui.zipLabel}
        mask={zipMask(form.country)}
        value={form.zipCode}
        onChange={(event) => setField('zipCode', event.target.value)}
        hint={ui.zipHint}
      />
      <Button type="button" variant="secondary" size="lg" className="mt-[26px] shrink-0" disabled={looking} onClick={lookup}>
        <Search className="h-4 w-4" />
        {looking ? 'Buscando…' : 'Buscar'}
      </Button>
    </div>
  )

  const streetFields = (
    <>
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <Input
          label="Rua"
          value={form.street}
          onChange={(event) => setField('street', event.target.value)}
          hint={form.country === 'BR' ? undefined : 'Obrigatória — o código postal não devolve a rua.'}
        />
        <Input label="Número" value={form.number} onChange={(event) => setField('number', event.target.value)} />
      </div>
      <Input label="Complemento" value={form.complement} onChange={(event) => setField('complement', event.target.value)} />
    </>
  )

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

      {form.country === 'BR' ? (
        <>
          {zipField}
          {streetFields}
          <Input
            label={ui.neighborhoodLabel}
            value={form.neighborhood}
            onChange={(event) => setField('neighborhood', event.target.value)}
          />
        </>
      ) : (
        <>
          <p className="rounded-xl border border-line bg-bg/40 px-3.5 py-2.5 text-xs leading-5 text-ink-muted">
            {form.country === 'ID'
              ? 'O kode pos não devolve a rua. Informe rua, número, RT e RW; a busca preenche kelurahan, kecamatan, cidade e província.'
              : 'O código postal não devolve a rua. Informe rua e número; a busca preenche só cidade e estado.'}
          </p>
          {streetFields}
          {form.country === 'PT' ? (
            <Input
              label={ui.neighborhoodLabel}
              value={form.neighborhood}
              onChange={(event) => setField('neighborhood', event.target.value)}
            />
          ) : null}
          {form.country === 'ID' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="RT"
                value={form.rt}
                onChange={(event) => setField('rt', event.target.value)}
                hint="Unidade de vizinhança, obrigatória na busca."
              />
              <Input label="RW" value={form.rw} onChange={(event) => setField('rw', event.target.value)} />
            </div>
          ) : null}
          {zipField}
          {form.country === 'ID' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Kelurahan" value={form.kelurahan} onChange={(event) => setField('kelurahan', event.target.value)} />
              <Input label="Kecamatan" value={form.kecamatan} onChange={(event) => setField('kecamatan', event.target.value)} />
            </div>
          ) : null}
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Cidade" value={form.city} onChange={(event) => setField('city', event.target.value)} />
        <Input label={ui.stateLabel} value={form.state} onChange={(event) => setField('state', event.target.value)} />
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

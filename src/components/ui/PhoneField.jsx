import { useMemo, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { getName, registerLocale } from 'i18n-iso-countries'
import ptLocale from 'i18n-iso-countries/langs/pt.json'
import { ChevronsUpDown, Search } from 'lucide-react'
import { defaultCountries, FlagImage, parseCountry, usePhoneInput } from 'react-international-phone'
import { cn } from '../../lib/cn'

registerLocale(ptLocale)

const PREFERRED = ['br', 'us', 'pt', 'id']
const ALL_COUNTRIES = defaultCountries.map(parseCountry)

function countryLabel(iso2) {
  return getName(iso2.toUpperCase(), 'pt') || iso2.toUpperCase()
}

function filterCountries(query) {
  const normalized = query.trim().toLowerCase().replace(/^\+/, '')
  const matches = !normalized
    ? ALL_COUNTRIES
    : ALL_COUNTRIES.filter((country) => {
        const name = countryLabel(country.iso2).toLowerCase()
        return (
          name.includes(normalized) ||
          country.name.toLowerCase().includes(normalized) ||
          country.iso2.includes(normalized) ||
          country.dialCode.includes(normalized)
        )
      })

  if (normalized) return matches

  const preferred = PREFERRED.map((iso2) => matches.find((country) => country.iso2 === iso2)).filter(Boolean)
  const rest = matches.filter((country) => !PREFERRED.includes(country.iso2))
  return [...preferred, ...rest]
}

export function PhoneField({ label = 'Telefone', hint, error, className, value, onChange, required, disabled, name }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { inputValue, country, setCountry, handlePhoneValueChange, inputRef } = usePhoneInput({
    defaultCountry: 'br',
    value: value || '',
    disableDialCodeAndPrefix: true,
    onChange: ({ phone }) => onChange?.(phone),
  })

  const countries = useMemo(() => filterCountries(query), [query])

  function selectCountry(iso2) {
    setCountry(iso2)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-1.5 text-sm', className)}>
      {label ? <span className="text-[13px] font-medium text-ink">{label}</span> : null}
      <div
        className={cn(
          'flex h-12 overflow-visible rounded-xl border border-line bg-bg/60 transition focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgb(34_224_255_/_0.15)]',
          error && 'border-danger/60',
        )}
      >
        <Popover.Root
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) setQuery('')
          }}
        >
          <Popover.Trigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="flex h-full shrink-0 items-center gap-2 rounded-l-xl px-3 text-ink hover:bg-white/4"
              aria-label="Selecionar DDI"
            >
              <FlagImage iso2={country.iso2} size="24px" />
              <span className="font-mono text-[13px] font-medium text-ink-muted">+{country.dialCode}</span>
              <ChevronsUpDown className="h-3.5 w-3.5 text-ink-faint" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={8}
              className="panel z-50 w-[min(92vw,360px)] rounded-2xl p-2"
            >
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.preventDefault()
                  }}
                  placeholder="Buscar país ou DDI"
                  className="h-10 w-full rounded-xl border border-line bg-bg px-9 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
                />
              </div>
              <div className="max-h-72 overflow-y-auto">
                {countries.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-ink-faint">Nenhum país encontrado.</p>
                ) : (
                  countries.map((item, index) => (
                    <button
                      key={`${item.iso2}-${item.dialCode}-${index}`}
                      type="button"
                      onClick={() => selectCountry(item.iso2)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/5',
                        item.iso2 === country.iso2 && 'bg-accent/10',
                      )}
                    >
                      <FlagImage iso2={item.iso2} size="22px" />
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">{countryLabel(item.iso2)}</span>
                      <span className="font-mono text-[13px] text-ink-muted">+{item.dialCode}</span>
                    </button>
                  ))
                )}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <div className="mx-1 w-px self-stretch bg-line" />
        <input
          ref={inputRef}
          name={name}
          required={required}
          disabled={disabled}
          value={inputValue}
          onChange={handlePhoneValueChange}
          placeholder="21 99999-9999"
          autoComplete="tel-national"
          inputMode="tel"
          className="h-full min-w-0 flex-1 rounded-r-xl bg-transparent px-3 text-ink outline-none placeholder:text-ink-faint"
        />
      </div>
      {error ? <span className="text-xs text-danger">{error}</span> : hint ? <span className="text-xs text-ink-faint">{hint}</span> : null}
    </div>
  )
}

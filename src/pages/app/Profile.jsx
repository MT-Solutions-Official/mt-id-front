import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { Camera, KeyRound, MapPin, Shield, Trash2, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { owners } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { getErrorMessage } from '../../lib/errors'
import { formatAddress, ownerPhoto, relativeTime } from '../../lib/format'
import { unmask } from '../../lib/mask'
import { formatPhoneDisplay } from '../../lib/phone'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Input } from '../../components/ui/Input'
import { PhoneField } from '../../components/ui/PhoneField'
import { CopyButton } from '../../components/ui/CopyField'
import { OwnerAddressForm } from '../../components/console/OwnerAddressForm'
import { cn } from '../../lib/cn'

const TABS = [
  { id: 'perfil', label: 'Perfil', icon: UserRound },
  { id: 'enderecos', label: 'Endereços', icon: MapPin },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
]

function profileFromOwner(owner) {
  return {
    name: owner?.name || '',
    phoneNumber: owner?.phone?.phoneNumber || '',
    cpf: owner?.document?.cpf || '',
  }
}

export function Profile() {
  const { owner } = useAuth()
  const queryClient = useQueryClient()
  const fileRef = useRef(null)
  const [tab, setTab] = useState('perfil')
  const [saving, setSaving] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [addressBusy, setAddressBusy] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)
  const [verifyBusy, setVerifyBusy] = useState(false)
  const [form, setForm] = useState(() => profileFromOwner(owner))
  const [snapshot, setSnapshot] = useState(() => profileFromOwner(owner))

  useEffect(() => {
    if (!owner) return
    const next = profileFromOwner(owner)
    setForm(next)
    setSnapshot(next)
  }, [owner?.ownerId])

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(snapshot), [form, snapshot])
  const addresses = owner?.addresses || []
  const emailVerified = Boolean(owner?.email?.verified)
  const photo = ownerPhoto(owner)

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function refreshMe(next) {
    if (next) {
      queryClient.setQueryData(['owner', 'me'], next)
      return
    }
    await queryClient.invalidateQueries({ queryKey: ['owner', 'me'] })
  }

  async function saveProfile() {
    if (form.phoneNumber && !isValidPhoneNumber(form.phoneNumber)) {
      toast.error('Informe um telefone válido.')
      return
    }
    setSaving(true)
    try {
      const { data } = await owners.updateMe({
        name: form.name,
        phoneNumber: form.phoneNumber || undefined,
        document: { cpf: unmask('cpf', form.cpf) || undefined },
      })
      await refreshMe(data)
      setSnapshot(form)
      toast.success('Dados atualizados')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function onPhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Envie um arquivo de imagem.')
      return
    }
    setPhotoBusy(true)
    try {
      const { data } = await owners.uploadPhoto(file)
      await refreshMe(data)
      toast.success('Foto atualizada')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setPhotoBusy(false)
    }
  }

  async function removePhoto() {
    setPhotoBusy(true)
    try {
      await owners.removePhoto()
      await refreshMe()
      toast.success('Foto removida')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setPhotoBusy(false)
    }
  }

  async function saveAddress(body) {
    setAddressBusy(true)
    try {
      const { data } = await owners.attachAddress(body)
      await refreshMe(data)
      toast.success('Endereço salvo')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setAddressBusy(false)
    }
  }

  async function removeAddress(index) {
    setAddressBusy(true)
    try {
      await owners.removeAddress(index)
      await refreshMe()
      toast.success('Endereço removido')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setAddressBusy(false)
    }
  }

  async function sendResetEmail() {
    setResetBusy(true)
    try {
      await owners.forgotPassword(owner.email.email)
      toast.success('Se a conta existir, o e-mail de reset foi enviado.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setResetBusy(false)
    }
  }

  async function resendVerification() {
    setVerifyBusy(true)
    try {
      await owners.sendVerification(owner.ownerId, owner.email.email)
      toast.success('E-mail de verificação enviado.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setVerifyBusy(false)
    }
  }

  return (
    <div className="pb-28">
      <section className="panel relative overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-accent/10 to-transparent" />
        <div className="relative p-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex min-w-0 items-start gap-4">
              <div className="relative">
                <Avatar name={form.name || owner?.name} src={photo} size="xl" />
                <button
                  type="button"
                  disabled={photoBusy}
                  onClick={() => fileRef.current?.click()}
                  className="absolute right-0 bottom-0 grid h-8 w-8 place-items-center rounded-full border border-line bg-surface-2 text-ink shadow-lg hover:border-line-strong"
                  aria-label="Trocar foto"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">Conta</p>
                <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight md:text-[28px]">
                  {form.name || owner?.name || 'Seu perfil'}
                </h1>
                <div className="mt-2 flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm text-ink-muted">{owner?.email?.email}</span>
                  {owner?.email?.email ? <CopyButton value={owner.email.email} label="e-mail" /> : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge>OWNER</Badge>
                  <Badge tone={emailVerified ? 'ok' : 'danger'}>{emailVerified ? 'E-mail verificado' : 'E-mail pendente'}</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
              <Button type="button" variant="secondary" disabled={photoBusy} onClick={() => fileRef.current?.click()}>
                <Camera className="h-4 w-4" />
                {photoBusy ? 'Enviando…' : 'Trocar foto'}
              </Button>
              {photo ? (
                <Button type="button" variant="ghost" disabled={photoBusy} onClick={removePhoto}>
                  <Trash2 className="h-4 w-4" />
                  Remover
                </Button>
              ) : null}
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <HeroStat
              label="Telefone"
              value={form.phoneNumber ? formatPhoneDisplay(form.phoneNumber) : 'Não informado'}
              hint={owner?.phone?.verified ? 'Verificado' : 'Não verificado'}
            />
            <HeroStat label="Endereços" value={addresses.length} hint={addresses[0]?.city || 'Nenhum cadastrado'} />
            <HeroStat label="Conta" value={relativeTime(owner?.createdAt)} hint="Criada" />
          </div>
        </div>
      </section>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white/[0.03] p-1">
        {TABS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition',
                tab === item.id ? 'bg-white/8 text-ink shadow-[0_0_0_1px_rgb(34_224_255_/_0.18)]' : 'text-ink-muted hover:text-ink',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
              {item.id === 'seguranca' && !emailVerified ? (
                <span className="h-1.5 w-1.5 rounded-full bg-danger" />
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="mt-8">
        {tab === 'perfil' ? (
          <Section
            kicker="Identidade"
            title="Dados do owner"
            description="Nome, telefone e CPF usados no console. O e-mail não muda por aqui."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome" value={form.name} onChange={(event) => setField('name', event.target.value)} required />
              <Input label="CPF" mask="cpf" value={form.cpf} onChange={(event) => setField('cpf', event.target.value)} />
            </div>
            <PhoneField label="Telefone" value={form.phoneNumber} onChange={(value) => setField('phoneNumber', value)} />
          </Section>
        ) : null}

        {tab === 'enderecos' ? (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <Section
              kicker="Cadastro"
              title="Endereços salvos"
              description="Usados no perfil do owner. Remover não afeta users das suas apps."
            >
              {addresses.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-muted">
                  Nenhum endereço ainda. Busque o CEP ao lado e informe o número.
                </p>
              ) : (
                <ul className="space-y-3">
                  {addresses.map((address, index) => (
                    <li key={`${address.zipCode}-${index}`} className="rounded-xl border border-line bg-bg/40 px-4 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-ink-faint" />
                            <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                              {address.country}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-ink">{formatAddress(address)}</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={addressBusy}
                          onClick={() => removeAddress(index)}
                        >
                          Remover
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
            <Section
              kicker="ViaCEP"
              title="Adicionar endereço"
              description="No Brasil, complete o CEP para preencher rua, bairro, cidade e UF. Depois informe o número."
            >
              <OwnerAddressForm onSubmit={saveAddress} saving={addressBusy} />
            </Section>
          </div>
        ) : null}

        {tab === 'seguranca' ? (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Section
              kicker="E-mail"
              title="Verificação"
              description="O endereço não pode ser alterado aqui. Se ainda estiver pendente, reenvie o link."
            >
              <Input label="E-mail" value={owner?.email?.email || ''} disabled />
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={emailVerified ? 'ok' : 'danger'}>{emailVerified ? 'Verificado' : 'Pendente'}</Badge>
                {!emailVerified ? (
                  <Button type="button" size="sm" variant="secondary" disabled={verifyBusy} onClick={resendVerification}>
                    {verifyBusy ? 'Enviando…' : 'Reenviar verificação'}
                  </Button>
                ) : null}
              </div>
            </Section>
            <section className="rounded-2xl border border-line bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Senha</p>
              <h2 className="mt-1 flex items-center gap-2 text-[15px] font-medium">
                <KeyRound className="h-4 w-4 text-ink-faint" />
                Reset por e-mail
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-ink-muted">
                A senha só muda pelo link enviado ao e-mail da conta. Não há troca com a senha atual neste console.
              </p>
              <Button type="button" variant="secondary" className="mt-5" disabled={resetBusy} onClick={sendResetEmail}>
                {resetBusy ? 'Enviando…' : 'Enviar e-mail de reset'}
              </Button>
            </section>
          </div>
        ) : null}
      </div>

      {dirty && tab === 'perfil' ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/90 backdrop-blur-xl lg:left-60">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
            <div>
              <p className="text-sm font-medium">Alterações não salvas</p>
              <p className="text-xs text-ink-faint">Nome, telefone e CPF ainda não foram persistidos.</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setForm(snapshot)}>
                Descartar
              </Button>
              <Button type="button" disabled={saving} onClick={saveProfile}>
                {saving ? 'Salvando…' : 'Salvar dados'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function HeroStat({ label, value, hint }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-bg/40 px-3.5 py-3">
      <div className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">{label}</div>
      <div className="mt-1 truncate text-lg font-semibold tracking-tight">{value}</div>
      {hint ? <div className="mt-0.5 truncate text-[11px] text-ink-faint">{hint}</div> : null}
    </div>
  )
}

function Section({ kicker, title, description, children }) {
  return (
    <section className="panel rounded-2xl p-6">
      <div className="mb-5">
        {kicker ? <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">{kicker}</p> : null}
        <h2 className="mt-1 text-[15px] font-medium">{title}</h2>
        {description ? <p className="mt-1.5 text-sm leading-6 text-ink-muted">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

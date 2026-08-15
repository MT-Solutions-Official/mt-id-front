import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { ArrowLeft, ArrowRight, IdCard, Mail, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../ui/Button'
import { Input, PasswordInput } from '../ui/Input'
import { PhoneField } from '../ui/PhoneField'
import { EMPTY_ADDRESS, OwnerAddressForm, isAddressComplete, toAddressPayload } from '../console/OwnerAddressForm'
import { owners } from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'
import { unmask } from '../../lib/mask'
import { cn } from '../../lib/cn'

const passwordChecks = [
  { id: 'len', label: '8+ caracteres', test: (value) => value.length >= 8 },
  { id: 'case', label: 'Maiúscula e minúscula', test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { id: 'num', label: 'Número', test: (value) => /\d/.test(value) },
  { id: 'sym', label: 'Caractere especial', test: (value) => /[^A-Za-z0-9]/.test(value) },
]

const steps = [
  { id: 1, label: 'Conta' },
  { id: 2, label: 'Endereço' },
]

const ease = [0.22, 1, 0.36, 1]

export function StepIndicator({ step }) {
  return (
    <ol className="flex items-center gap-3">
      {steps.map((item, index) => (
        <li key={item.id} className={cn('flex items-center gap-3', index === 0 && 'flex-1')}>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'grid h-7 w-7 place-items-center rounded-full font-mono text-[11px] transition-colors',
                step === item.id && 'bg-accent text-accent-fg',
                step > item.id && 'bg-ok/15 text-ok',
                step < item.id && 'border border-line text-ink-faint',
              )}
            >
              {item.id}
            </span>
            <span className={cn('text-[13px]', step === item.id ? 'text-ink' : 'text-ink-muted')}>{item.label}</span>
          </div>
          {index < steps.length - 1 ? (
            <span className={cn('h-px flex-1', step > item.id ? 'bg-ok/40' : 'bg-line')} />
          ) : null}
        </li>
      ))}
    </ol>
  )
}

export function OwnerCreateForm({
  allowRole = false,
  submitLabel = 'Criar conta',
  onCreated,
  onStepChange,
}) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    cpf: '',
    role: 'OWNER_VIEWER',
    address: EMPTY_ADDRESS,
  })

  const checks = useMemo(
    () => passwordChecks.map((check) => ({ ...check, ok: check.test(form.password) })),
    [form.password],
  )

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function validateAccount() {
    if (!form.name.trim()) {
      toast.error('Informe o nome.')
      return false
    }
    if (!form.email.trim()) {
      toast.error('Informe o e-mail.')
      return false
    }
    if (!isValidPhoneNumber(form.phoneNumber || '')) {
      toast.error('Informe um telefone válido.')
      return false
    }
    if (unmask('cpf', form.cpf).length !== 11) {
      toast.error('Informe um CPF válido.')
      return false
    }
    if (checks.some((check) => !check.ok)) {
      toast.error('A senha ainda não atende a política.')
      return false
    }
    return true
  }

  function goToStep(next) {
    setStep(next)
    onStepChange?.(next)
  }

  function goNext(event) {
    event.preventDefault()
    if (!validateAccount()) return
    goToStep(2)
  }

  async function onCreate(event) {
    event.preventDefault()
    if (!isAddressComplete(form.address)) {
      toast.error('Informe o endereço: busque o CEP e complete rua, número, cidade e estado.')
      return
    }
    setLoading(true)
    try {
      const { data } = await owners.create({
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        document: { cpf: unmask('cpf', form.cpf) },
        address: toAddressPayload(form.address),
      })
      await onCreated?.(data, form.role)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: step === 1 ? -12 : 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease }}
    >
      {step === 1 ? (
        <form onSubmit={goNext} className="space-y-4">
          <Input
            label="Nome completo"
            autoComplete="name"
            placeholder="Jane Doe"
            icon={<User className="h-4 w-4" />}
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            required
          />
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            icon={<Mail className="h-4 w-4" />}
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            required
          />
          <PhoneField value={form.phoneNumber} onChange={(phone) => setField('phoneNumber', phone)} required />
          <Input
            label="CPF"
            mask="cpf"
            autoComplete="off"
            icon={<IdCard className="h-4 w-4" />}
            value={form.cpf}
            onChange={(e) => setField('cpf', e.target.value)}
            required
          />
          <PasswordInput
            label="Senha"
            autoComplete="new-password"
            placeholder="Crie uma senha forte"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            required
          />
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
            {checks.map((check) => (
              <li key={check.id} className={`text-[11px] ${check.ok ? 'text-ok' : 'text-ink-faint'}`}>
                {check.ok ? '●' : '○'} {check.label}
              </li>
            ))}
          </ul>
          {allowRole ? (
            <div>
              <p className="mb-2 font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Papel nesta app</p>
              <div className="flex gap-1 rounded-xl border border-line p-1">
                {[
                  { id: 'OWNER_VIEWER', label: 'Viewer' },
                  { id: 'OWNER_WRITER', label: 'Writer' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setField('role', item.id)}
                    className={cn(
                      'flex-1 rounded-lg px-3 py-1.5 text-sm',
                      form.role === item.id ? 'bg-white/8 text-ink' : 'text-ink-muted hover:text-ink',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <Button type="submit" size="lg" className="w-full">
            Continuar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <form onSubmit={onCreate} className="space-y-4">
          <OwnerAddressForm embedded value={form.address} onChange={(address) => setField('address', address)} />
          <div className="flex gap-3 pt-1">
            <Button type="button" size="lg" variant="secondary" onClick={() => goToStep(1)}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button type="submit" size="lg" className="flex-1" disabled={loading}>
              {loading ? 'Criando…' : submitLabel}
            </Button>
          </div>
        </form>
      )}
    </motion.div>
  )
}

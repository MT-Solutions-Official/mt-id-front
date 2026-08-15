import { useState } from 'react'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { owners } from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await owners.forgotPassword(email)
      toast.success('Se a conta existir, o e-mail de reset foi enviado.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset de senha"
      subtitle="Enviamos o link se o e-mail existir. A resposta é sempre a mesma, de propósito."
      switchTo={{ prompt: 'Lembrou a senha?', to: '/login', label: 'Entrar' }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar link'}
        </Button>
      </form>
    </AuthLayout>
  )
}

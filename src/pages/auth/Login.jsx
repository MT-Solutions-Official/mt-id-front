import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/ui/Button'
import { GoogleSignIn } from '../../components/ui/GoogleSignIn'
import { Input, PasswordInput } from '../../components/ui/Input'
import { authError, useAuth } from '../../lib/auth'

export function Login() {
  const { hasSession, login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (hasSession) {
    return <Navigate to="/app" replace />
  }

  async function onSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/app')
    } catch (error) {
      toast.error(authError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre com o e-mail do owner para abrir o console."
      switchTo={{ prompt: 'Não tem conta?', to: '/signup', label: 'Criar conta' }}
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
        <PasswordInput
          label="Senha"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-[13px] text-ink-muted hover:text-accent">
            Esqueci a senha
          </Link>
        </div>
        <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar no console'}
        </Button>
      </form>
      <GoogleSignIn
        onSuccess={async (response) => {
          try {
            await loginWithGoogle(response.credential)
            navigate('/app')
          } catch (error) {
            toast.error(authError(error))
          }
        }}
        onError={() => toast.error('Google login cancelado.')}
      />
    </AuthLayout>
  )
}

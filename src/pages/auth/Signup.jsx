import { Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { OwnerCreateForm, StepIndicator } from '../../components/auth/OwnerCreateForm'
import { useAuth } from '../../lib/auth'
import { toast } from 'sonner'
import { useState } from 'react'

export function Signup() {
  const { hasSession } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  if (hasSession) {
    return <Navigate to="/app" replace />
  }

  return (
    <AuthLayout
      wide
      title={step === 1 ? 'Criar conta' : 'Endereço'}
      subtitle={
        step === 1
          ? 'Conta no MT ID. Depois você entra nas apps como writer ou viewer — o papel é da aplicação, não deste cadastro.'
          : 'Busque o CEP. No Brasil, rua, bairro, cidade e UF preenchem sozinhos — falta o número.'
      }
      switchTo={{ prompt: 'Já tem conta?', to: '/login', label: 'Entrar' }}
      progress={<StepIndicator step={step} />}
    >
      <OwnerCreateForm
        submitLabel="Criar conta"
        onStepChange={setStep}
        onCreated={async () => {
          toast.success('Conta criada. Verifique o e-mail e entre.')
          navigate('/login')
        }}
      />
    </AuthLayout>
  )
}

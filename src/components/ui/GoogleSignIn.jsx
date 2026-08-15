import { GoogleLogin } from '@react-oauth/google'

export function GoogleSignIn({ onSuccess, onError }) {
  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!googleId) return null

  return (
    <div className="mt-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-[11px] tracking-[0.16em] text-ink-faint uppercase">ou continue com</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <div className="google-signin">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          theme="filled_black"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="400"
          locale="pt-BR"
        />
      </div>
    </div>
  )
}

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Skeleton } from './ui/Skeleton'

export function ProtectedRoute() {
  const { hasSession, loading } = useAuth()
  if (!hasSession) {
    return <Navigate to="/login" replace />
  }
  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg">
        <div className="hidden w-60 border-r border-line bg-bg-muted p-5 lg:block">
          <Skeleton className="h-6 w-24" />
          <div className="mt-8 space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-6 h-24 w-full max-w-3xl" />
        </div>
      </div>
    )
  }
  return <Outlet />
}

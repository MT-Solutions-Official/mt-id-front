import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ScrollRestore } from './components/ScrollRestore'
import { AppShell } from './components/layout/AppShell'
import { DocsShell } from './components/layout/DocsShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Landing } from './pages/Landing'
import { Login } from './pages/auth/Login'
import { Signup } from './pages/auth/Signup'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { DocsPage } from './pages/docs/DocsPage'
import { Overview } from './pages/app/Overview'
import { Applications } from './pages/app/Applications'
import { NewApplication } from './pages/app/NewApplication'
import { ApplicationDetail } from './pages/app/ApplicationDetail'
import { Team } from './pages/app/Team'
import { Profile } from './pages/app/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollRestore />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/docs" element={<DocsShell />}>
          <Route index element={<DocsPage />} />
          <Route path=":slug" element={<DocsPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Overview />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/new" element={<NewApplication />} />
            <Route path="applications/:appId" element={<ApplicationDetail />} />
            <Route path="team" element={<Team />} />
            <Route path="account" element={<Profile />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

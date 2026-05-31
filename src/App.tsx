import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { getCurrentUserProfile, hasAccessExpired, type UserProfile } from './lib/auth'
import LoginPage from './pages/LoginPage'
import CreatePasswordPage from './pages/CreatePasswordPage'
import AccessExpiredPage from './pages/AccessExpiredPage'
import { HomePage } from './pages/HomePage'
import { WeeksPage } from './pages/WeeksPage'
import { WeekDetailPage } from './pages/WeekDetailPage'
import { DevotionalPage } from './pages/DevotionalPage'
import { AudioPlayerPage } from './pages/AudioPlayerPage'
import { HabitsPage } from './pages/HabitsPage'
import { ProfilePage } from './pages/ProfilePage'
import { WorkoutPage } from './pages/WorkoutPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminStudentsPage } from './pages/AdminStudentsPage'
import { AdminAddStudentPage } from './pages/AdminAddStudentPage'
import { Layout } from './components/Layout'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'password-change-required' | 'access-expired'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>('loading')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setAuthState('unauthenticated')
        return
      }

      const { data: profile, error: profileError } = await getCurrentUserProfile()
      if (profileError || !profile) {
        setAuthState('unauthenticated')
        return
      }

      if (!profile.is_active || hasAccessExpired(profile)) {
        setAuthState('access-expired')
        return
      }

      if (profile.must_change_password) {
        setAuthState('password-change-required')
        return
      }

      setAuthState('authenticated')
    }

    checkAuth()
  }, [])

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Carregando...</div>
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  if (authState === 'password-change-required') {
    return <Navigate to="/create-password" replace />
  }

  if (authState === 'access-expired') {
    return <Navigate to="/access-expired" replace />
  }

  return <>{children}</>
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const [hasToken, setHasToken] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      setHasToken(false)
    }
  }, [])

  if (!hasToken) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Student Routes */}
        <Route path="/login" element={<LoginPage onLoginSuccess={() => window.location.href = '/'} />} />
        <Route path="/create-password" element={<CreatePasswordPage />} />
        <Route path="/access-expired" element={<AccessExpiredPage />} />

        {/* Protected Student Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout><HomePage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/weeks"
          element={
            <ProtectedRoute>
              <Layout><WeeksPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/week/:weekId"
          element={
            <ProtectedRoute>
              <Layout><WeekDetailPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/day/:dayId"
          element={
            <ProtectedRoute>
              <Layout><DevotionalPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/day/:dayId/audio"
          element={
            <ProtectedRoute>
              <Layout><AudioPlayerPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/week/:weekId/habits"
          element={
            <ProtectedRoute>
              <Layout><HabitsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout><ProfilePage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout"
          element={
            <ProtectedRoute>
              <Layout><WorkoutPage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Public Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <AdminProtectedRoute>
              <AdminStudentsPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/students/new"
          element={
            <AdminProtectedRoute>
              <AdminAddStudentPage />
            </AdminProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App

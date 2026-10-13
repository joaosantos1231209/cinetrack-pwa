import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Pages
import HomePage from '@/pages/Home'
import SearchPage from '@/pages/Search'
import MyListPage from '@/pages/MyList'
import ProfilePage from '@/pages/Profile'
import MediaDetailPage from '@/pages/MediaDetail'
import LoginPage from '@/pages/auth/Login'
import RegisterPage from '@/pages/auth/Register'

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullPage size="lg" text="A carregar CineTrack..." />
  }

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* App routes (accessible without login, but personalized when logged in) */}
      <Route path="/"              element={<HomePage />} />
      <Route path="/search"        element={<SearchPage />} />
      <Route path="/mylist"        element={<MyListPage />} />
      <Route path="/profile"       element={<ProfilePage />} />
      <Route path="/movie/:id"     element={<MediaDetailPage />} />
      <Route path="/tv/:id"        element={<MediaDetailPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

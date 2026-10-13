import React from 'react'
import BottomNav from './BottomNav'
import InstallPWA from '@/components/ui/InstallPWA'

interface LayoutProps {
  children: React.ReactNode
  hideNav?: boolean
}

export default function Layout({ children, hideNav = false }: LayoutProps) {
  return (
    <div className="app-layout">
      <InstallPWA />
      <main className="page-content" id="main-content">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}

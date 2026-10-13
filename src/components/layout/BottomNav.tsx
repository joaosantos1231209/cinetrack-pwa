import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, List, User } from 'lucide-react'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

const NAV_ITEMS: NavItem[] = [
  { path: '/',        label: 'Início',   icon: Home },
  { path: '/search',  label: 'Pesquisar', icon: Search },
  { path: '/mylist',  label: 'A minha lista', icon: List },
  { path: '/profile', label: 'Perfil',    icon: User },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navegação principal">
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
        const isActive = path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(path)

        return (
          <button
            key={path}
            id={`nav-${path.replace('/', '') || 'home'}`}
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
            onClick={() => navigate(path)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="active-dot" aria-hidden="true" />
            <span className="nav-icon" aria-hidden="true">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </span>
            <span className="nav-label">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

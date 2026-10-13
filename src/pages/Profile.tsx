import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Film, Settings, ChevronRight, Mail, X, Trash2, Moon, Database, Check } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToastMsg = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleClearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      }
      showToastMsg('Cache offline limpa com sucesso!')
    } catch {
      showToastMsg('Erro ao limpar cache.')
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="empty-state" style={{ marginTop: 48 }}>
          <div className="empty-state-icon">
            <User size={32} />
          </div>
          <h1 className="empty-state-title">Perfil</h1>
          <p className="empty-state-text">Inicia sessão para acederes ao teu perfil.</p>
          <button
            id="profile-login-cta"
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            onClick={() => navigate('/login')}
          >
            Iniciar Sessão
          </button>
        </div>
      </Layout>
    )
  }

  const avatarLetter = user.email?.[0]?.toUpperCase() || 'U'
  const joinedDate = new Date(user.created_at || Date.now()).toLocaleDateString('pt-PT', {
    year: 'numeric', month: 'long',
  })

  return (
    <Layout>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 50,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          className="slide-down"
        >
          <Check size={16} color="#4ade80" />
          {toast}
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Perfil</h1>
      </div>

      {/* Avatar & Info */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 16px 24px',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-accent), #ff6b6b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 800,
            color: 'white',
            boxShadow: '0 0 32px rgba(229, 9, 20, 0.35)',
          }}
          aria-hidden="true"
        >
          {avatarLetter}
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            {user.email?.split('@')[0]}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Membro desde {joinedDate}</p>
        </div>
      </div>

      {/* Menu items */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <MenuSection>
          <MenuItem
            id="profile-email"
            icon={<Mail size={18} />}
            label="Email"
            value={user.email || ''}
            disabled
          />
          <MenuItem
            id="profile-mylist"
            icon={<Film size={18} />}
            label="A minha lista"
            onClick={() => navigate('/mylist')}
          />
          <MenuItem
            id="profile-settings"
            icon={<Settings size={18} />}
            label="Definições"
            onClick={() => setShowSettings(true)}
          />
        </MenuSection>

        <MenuSection>
          <MenuItem
            id="profile-signout"
            icon={<LogOut size={18} />}
            label="Terminar sessão"
            destructive
            onClick={handleSignOut}
          />
        </MenuSection>
      </div>

      {/* Version badge */}
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)', margin: '28px 0 12px' }}>
        CineTrack v1.4.0
      </p>

      {/* Settings Modal */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Settings size={20} color="var(--color-accent)" />
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Definições</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {/* Tema */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Moon size={18} color="#a855f7" />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>Tema Escuro</p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Otimizado para ecrãs OLED</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '3px 8px', borderRadius: 4 }}>
                  Ativo
                </span>
              </div>

              {/* Sincronização */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Database size={18} color="#60a5fa" />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>Sincronização Cloud</p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Supabase PostgreSQL ativo</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)', padding: '3px 8px', borderRadius: 4 }}>
                  Online
                </span>
              </div>

              {/* Limpar Cache */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Trash2 size={18} color="var(--color-accent)" />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>Limpar Cache Offline</p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Liberta espaço no telemóvel</p>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleClearCache}
                  style={{ fontSize: 12, padding: '5px 12px' }}
                >
                  Limpar
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={() => setShowSettings(false)}>
              Concluído
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}

// ─── Helper Components ────────────────────────────────────────────────────────

function MenuSection({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}

interface MenuItemProps {
  id: string
  icon: React.ReactNode
  label: string
  value?: string
  onClick?: () => void
  destructive?: boolean
  disabled?: boolean
}

function MenuItem({ id, icon, label, value, onClick, destructive, disabled }: MenuItemProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid var(--color-border)',
        cursor: disabled ? 'default' : 'pointer',
        color: destructive ? 'var(--color-accent)' : 'var(--color-text-primary)',
        transition: 'background 0.15s',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => !disabled && ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
    >
      <span style={{ color: destructive ? 'var(--color-accent)' : 'var(--color-text-muted)', flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{label}</span>
      {value ? (
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 180 }} className="truncate">
          {value}
        </span>
      ) : !disabled ? (
        <ChevronRight size={16} color="var(--color-text-muted)" />
      ) : null}
    </button>
  )
}

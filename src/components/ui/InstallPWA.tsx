import React, { useState, useEffect } from 'react'
import { Download, Smartphone, Share, CheckCircle2, MoreVertical, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already running as installed PWA (standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone === true)

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua)
    setIsIOS(ios)

    // Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    } else {
      setShowGuide(true)
    }
  }

  if (isInstalled || dismissed) {
    return null
  }

  return (
    <>
      <div
        className="install-pwa-card"
        style={{
          margin: '12px 16px',
          padding: '14px 16px',
          background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.18) 0%, rgba(26, 26, 38, 0.95) 100%)',
          border: '1px solid rgba(229, 9, 20, 0.35)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(229, 9, 20, 0.3)',
          }}
        >
          <img src="/icons/icon-192x192.png" alt="CineTrack" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>
            Instalar CineTrack
          </h2>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
            Coloca no teu ecrã inicial como app.
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={handleInstallClick}
          style={{
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 700,
            gap: 5,
            flexShrink: 0,
            borderRadius: 8,
          }}
        >
          <Download size={14} />
          Instalar
        </button>

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowGuide(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Smartphone size={22} color="var(--color-accent)" />
                <h3 style={{ fontSize: 17, fontWeight: 800 }}>
                  {isIOS ? 'Como instalar no iPhone' : 'Como instalar no Android'}
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {isIOS ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 6, flexShrink: 0 }}>
                    <Share size={20} color="#60a5fa" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>1. Toca no botão de Partilhar</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      Na barra inferior do Safari (o ícone do quadrado com a seta para cima ⬆️).
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 6, flexShrink: 0 }}>
                    <CheckCircle2 size={20} color="#4ade80" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>2. Adicionar ao Ecrã Principal</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      Desce nas opções e seleciona <strong>"Adicionar ao Ecrã Principal"</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 6, flexShrink: 0 }}>
                    <MoreVertical size={20} color="#fbbf24" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>1. Clica no menu do Chrome</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      Toca nos <strong>3 pontinhos verticais ⋮</strong> no canto superior direito do Chrome.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 6, flexShrink: 0 }}>
                    <CheckCircle2 size={20} color="#4ade80" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>2. "Instale e crie um atalho" ou "Adicionar ao ecrã inicial"</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      Toca nessa opção e clica em <strong>Adicionar</strong>. A aplicação CineTrack com o seu ícone oficial fica guardada no teu ecrã inicial!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-full" onClick={() => setShowGuide(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}

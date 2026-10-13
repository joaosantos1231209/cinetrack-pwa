import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Film, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { authService } from '@/lib/supabase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)

  const passwordStrength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3

  const strengthColors = ['', '#e50914', '#fbbf24', '#4ade80']
  const strengthLabels = ['', 'Fraca', 'Média', 'Forte']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('As passwords não coincidem.')
      return
    }

    if (password.length < 6) {
      setError('A password deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      const data = await authService.signUp(email, password)
      if (data.session) {
        setSuccess(true)
        setTimeout(() => navigate('/'), 1500)
      } else {
        setNeedsConfirm(true)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta'
      if (message.includes('User already registered')) {
        setError('Já existe uma conta com este email.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (needsConfirm) {
    return (
      <div className="auth-page">
        <div className="auth-card slide-up" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(96, 165, 250, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle size={32} color="#60a5fa" />
          </div>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Verifica o teu Email</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 20 }}>
            Enviámos um link de confirmação para <strong>{email}</strong>. Clica no link para ativar a conta e depois inicia sessão.
          </p>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>
            Ir para Iniciar Sessão
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card slide-up" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(74, 222, 128, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle size={32} color="#4ade80" />
          </div>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Conta criada!</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            A redirecionar para o início...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Film size={22} color="white" />
          </div>
          <span className="auth-logo-text">CineTrack</span>
        </div>

        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-subtitle">Começa já a gerir os teus filmes e séries</p>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div
              className="form-error"
              style={{
                background: 'rgba(229, 9, 20, 0.08)',
                border: '1px solid rgba(229, 9, 20, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                marginBottom: 16,
              }}
              role="alert"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="register-email" className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none',
                }}
              />
              <input
                id="register-email"
                type="email"
                className="input-field"
                style={{ paddingLeft: 42 }}
                placeholder="o-teu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-password" className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none',
                }}
              />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                style={{ paddingLeft: 42, paddingRight: 44 }}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
              <button
                type="button"
                id="toggle-register-password"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4,
                }}
                aria-label={showPassword ? 'Esconder password' : 'Mostrar password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: passwordStrength >= level ? strengthColors[passwordStrength] : 'var(--color-border)',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: strengthColors[passwordStrength], marginTop: 4 }}>
                  Password {strengthLabels[passwordStrength]}
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm-password" className="form-label">Confirmar Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none',
                }}
              />
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                style={{
                  paddingLeft: 42,
                  borderColor: confirmPassword && confirmPassword !== password
                    ? 'var(--color-accent)' : undefined,
                }}
                placeholder="Repete a password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !email || !password || !confirmPassword}
            style={{ marginTop: 8 }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                A criar conta...
              </>
            ) : (
              'Criar conta gratuita'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Já tens conta?{' '}
          <Link to="/login" id="go-to-login">Iniciar sessão</Link>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { Film } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullPage?: boolean
  text?: string
}

export default function LoadingSpinner({ size = 'md', fullPage = false, text }: LoadingSpinnerProps) {
  const sizeMap = { sm: 20, md: 32, lg: 48 }
  const spinnerSize = sizeMap[size]

  if (fullPage) {
    return (
      <div
        className="flex-center"
        style={{ minHeight: '60vh', flexDirection: 'column', gap: 16 }}
        role="status"
        aria-live="polite"
        aria-label={text || 'A carregar...'}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ width: spinnerSize, height: spinnerSize }} />
          <Film
            size={spinnerSize * 0.45}
            style={{ position: 'absolute', color: 'var(--color-accent)' }}
          />
        </div>
        {text && <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{text}</p>}
      </div>
    )
  }

  return (
    <div
      className="flex-center"
      style={{ padding: 16 }}
      role="status"
      aria-label={text || 'A carregar...'}
    >
      <div className="spinner" style={{ width: spinnerSize, height: spinnerSize }} />
    </div>
  )
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        className="skeleton"
        style={{ width: '100%', aspectRatio: '2/3', borderRadius: 'var(--radius-md)' }}
      />
      <div className="skeleton" style={{ height: 14, width: '80%' }} />
      <div className="skeleton" style={{ height: 12, width: '50%' }} />
    </div>
  )
}

export function SkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="scroll-row" style={{ paddingBottom: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ flex: '0 0 140px', width: 140 }}>
          <SkeletonCard />
        </div>
      ))}
    </div>
  )
}

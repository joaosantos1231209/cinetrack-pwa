import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Film, Tv, Eye, Bookmark, CheckCircle } from 'lucide-react'
import { tmdbImage, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import type { TMDBMedia, UserMediaItem, WatchStatus } from '@/types'

interface MediaCardProps {
  media: TMDBMedia
  userItem?: UserMediaItem | null
  compact?: boolean
  onClick?: () => void
  onStatusChange?: (status: WatchStatus) => void
}

const STATUS_ICONS: Record<WatchStatus, { icon: typeof Eye; color: string; label: string }> = {
  wishlist:           { icon: Bookmark,    color: '#60a5fa', label: 'Quero ver' },
  currently_watching: { icon: Eye,         color: '#fbbf24', label: 'A ver' },
  watched:            { icon: CheckCircle, color: '#4ade80', label: 'Visto' },
}

export default function MediaCard({ media, userItem, compact = false, onClick }: MediaCardProps) {
  const navigate = useNavigate()
  const title = getMediaTitle(media)
  const year = getMediaYear(media)
  const posterUrl = tmdbImage.poster(media.poster_path, 'w342')
  const rating = media.vote_average ? media.vote_average.toFixed(1) : null
  const mediaType = media.media_type || 'movie'

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(`/${mediaType}/${media.id}`)
    }
  }

  const statusInfo = userItem ? STATUS_ICONS[userItem.status] : null

  return (
    <article
      className="media-card fade-in"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${title} (${year})`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      id={`media-card-${mediaType}-${media.id}`}
    >
      {/* Poster */}
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={`Poster de ${title}`}
          className="media-card-poster"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="media-card-poster-placeholder" aria-hidden="true">
          {mediaType === 'movie' ? <Film size={32} /> : <Tv size={32} />}
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', padding: '0 8px' }}>
            Sem imagem
          </span>
        </div>
      )}

      {/* Media type badge */}
      <span className={`media-card-badge ${mediaType === 'movie' ? 'badge-movie' : 'badge-tv'}`}>
        {mediaType === 'movie' ? 'Filme' : 'Série'}
      </span>

      {/* User status badge */}
      {statusInfo && (
        <span
          className="media-card-status-badge"
          style={{ background: `${statusInfo.color}22`, color: statusInfo.color }}
          title={statusInfo.label}
          aria-label={statusInfo.label}
        >
          <statusInfo.icon size={14} />
        </span>
      )}

      {/* Info */}
      {!compact && (
        <div className="media-card-info">
          <p className="media-card-title" title={title}>{title}</p>
          <div className="media-card-meta">
            <span>{year}</span>
            {rating && Number(rating) > 0 && (
              <>
                <span>·</span>
                <span className="media-card-rating">
                  <Star size={10} fill="currentColor" />
                  {rating}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

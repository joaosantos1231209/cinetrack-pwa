import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Film, Tv } from 'lucide-react'
import { tmdbImage, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import type { TMDBMedia } from '@/types'

interface CompactMediaCardProps {
  media: TMDBMedia
  onClick?: () => void
}

export default function CompactMediaCard({ media, onClick }: CompactMediaCardProps) {
  const navigate = useNavigate()
  const title = getMediaTitle(media)
  const year = getMediaYear(media)
  const posterUrl = tmdbImage.poster(media.poster_path, 'w342')
  const rating = media.vote_average && media.vote_average > 0 ? media.vote_average.toFixed(1) : null
  const mediaType = media.media_type || 'movie'

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(`/${mediaType}/${media.id}`)
    }
  }

  return (
    <article
      className="netflix-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${title} (${year})`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      id={`netflix-card-${mediaType}-${media.id}`}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={title}
          className="netflix-card-poster"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="netflix-card-fallback">
          {mediaType === 'movie' ? <Film size={22} color="#60a5fa" /> : <Tv size={22} color="#a855f7" />}
          <span className="netflix-card-fallback-title">{title}</span>
        </div>
      )}

      {/* Badges on top: Type and Rating */}
      <div className="netflix-card-badges">
        <span className={`netflix-badge-type ${mediaType === 'movie' ? 'netflix-badge-movie' : 'netflix-badge-tv'}`}>
          {mediaType === 'movie' ? 'Filme' : 'Série'}
        </span>
        {rating && (
          <span className="netflix-badge-rating">
            <Star size={8} fill="currentColor" />
            {rating}
          </span>
        )}
      </div>

      {/* Netflix subtle bottom gradient with title & year */}
      <div className="netflix-card-gradient">
        <p className="netflix-card-title" title={title}>
          {title}
        </p>
        <div className="netflix-card-year">
          {year || '—'}
        </div>
      </div>
    </article>
  )
}

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft, Star, Calendar, Clock, Tv, Bookmark, Eye, CheckCircle,
  Loader2, Plus, Film as FilmIcon,
} from 'lucide-react'
import { tmdbService, tmdbImage, getMediaTitle } from '@/lib/tmdb'
import { mediaListService } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { TMDBMovieDetails, TMDBTVDetails, WatchStatus, UserMediaItem } from '@/types'

type MediaDetails = TMDBMovieDetails | TMDBTVDetails

const STATUS_OPTIONS: Array<{ status: WatchStatus; label: string; icon: typeof Bookmark; color: string }> = [
  { status: 'wishlist',           label: 'Quero Ver',  icon: Bookmark,    color: '#60a5fa' },
  { status: 'currently_watching', label: 'A Ver',      icon: Eye,         color: '#fbbf24' },
  { status: 'watched',            label: 'Visto',      icon: CheckCircle, color: '#4ade80' },
]

export default function MediaDetailPage() {
  const { type: paramType, id } = useParams<{ type?: 'movie' | 'tv'; id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const type: 'movie' | 'tv' = paramType || (location.pathname.startsWith('/tv') ? 'tv' : 'movie')

  const [media, setMedia] = useState<MediaDetails | null>(null)
  const [userItem, setUserItem] = useState<UserMediaItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    if (!type || !id) return

    const fetchMedia = async () => {
      setLoading(true)
      try {
        const details = type === 'movie'
          ? await tmdbService.getMovieDetails(Number(id))
          : await tmdbService.getTVDetails(Number(id))

        setMedia(details)

        if (user) {
          const item = await mediaListService.getItem(user.id, Number(id))
          setUserItem(item)
        }
      } catch (err) {
        console.error('Error fetching media details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [type, id, user])

  const handleStatusChange = async (status: WatchStatus) => {
    if (!user || !media) return
    setActionLoading(true)
    setShowStatusMenu(false)

    try {
      if (userItem) {
        const updated = await mediaListService.updateStatus(user.id, media.id, status)
        setUserItem(updated)
        showToast(`Atualizado para "${STATUS_OPTIONS.find((s) => s.status === status)?.label}"`)
      } else {
        const isTv = media.media_type === 'tv'
        const tvMedia = isTv ? (media as TMDBTVDetails) : null

        const added = await mediaListService.addItem(user.id, {
          tmdb_id: media.id,
          media_type: media.media_type as 'movie' | 'tv',
          status,
          title: getMediaTitle(media),
          poster_path: media.poster_path,
          vote_average: media.vote_average,
          total_seasons: tvMedia?.number_of_seasons ?? null,
          total_episodes: tvMedia?.number_of_episodes ?? null,
          current_season: status === 'currently_watching' ? 1 : null,
          current_episode: status === 'currently_watching' ? 1 : null,
        })
        setUserItem(added)
        showToast(`Adicionado à lista!`)
      }
    } catch (err) {
      console.error('Error updating status:', err)
      showToast('Erro ao atualizar. Tenta novamente.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!user || !media || !userItem) return
    setActionLoading(true)
    try {
      await mediaListService.removeItem(user.id, media.id)
      setUserItem(null)
      showToast('Removido da lista')
    } catch (err) {
      showToast('Erro ao remover.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleProgressChange = async (season: number, episode: number) => {
    if (!user || !media || !userItem) return
    try {
      const updated = await mediaListService.updateProgress(user.id, media.id, season, episode)
      setUserItem(updated)
      showToast(`Progresso: T${season} E${episode}`)
    } catch {
      showToast('Erro ao atualizar progresso.')
    }
  }

  const handleStepEpisode = async (direction: 1 | -1) => {
    if (!user || !media || !userItem) return
    const tv = media as TMDBTVDetails
    const currentSeasonNum = userItem.current_season || 1
    const currentEpNum = userItem.current_episode || 0
    const validSeasons = tv.seasons ? tv.seasons.filter((s) => s.season_number > 0) : []
    const curSeasonObj = validSeasons.find((s) => s.season_number === currentSeasonNum) || validSeasons[0]
    const curSeasonMaxEp = curSeasonObj?.episode_count || 1

    if (direction === 1) {
      if (currentEpNum + 1 > curSeasonMaxEp) {
        // Check if there is a next season
        const nextSeasonObj = validSeasons.find((s) => s.season_number === currentSeasonNum + 1)
        if (nextSeasonObj) {
          await handleProgressChange(currentSeasonNum + 1, 1)
          showToast(`Avançado para Temporada ${currentSeasonNum + 1}, Ep. 1`)
        } else {
          showToast('Chegaste ao fim da última temporada!')
        }
      } else {
        await handleProgressChange(currentSeasonNum, currentEpNum + 1)
      }
    } else {
      if (currentEpNum - 1 < 1) {
        // Check if there is a previous season
        const prevSeasonObj = validSeasons.find((s) => s.season_number === currentSeasonNum - 1)
        if (prevSeasonObj) {
          await handleProgressChange(currentSeasonNum - 1, prevSeasonObj.episode_count || 1)
          showToast(`Voltaste para Temporada ${currentSeasonNum - 1}`)
        } else {
          await handleProgressChange(currentSeasonNum, 0)
        }
      } else {
        await handleProgressChange(currentSeasonNum, currentEpNum - 1)
      }
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} color="var(--color-accent)" style={{ animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  if (!media) {
    return (
      <div className="empty-state" style={{ minHeight: '100dvh' }}>
        <h1 className="empty-state-title">Não encontrado</h1>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Voltar</button>
      </div>
    )
  }

  const title = getMediaTitle(media)
  const backdropUrl = tmdbImage.backdrop(media.backdrop_path, 'w780')
  const posterUrl = tmdbImage.poster(media.poster_path, 'w342')
  const year = (media.release_date || (media as TMDBTVDetails).first_air_date || '').slice(0, 4)
  const rating = media.vote_average?.toFixed(1)
  const isTv = media.media_type === 'tv'
  const tvMedia = isTv ? (media as TMDBTVDetails) : null

  const currentStatus = userItem?.status
  const currentStatusInfo = STATUS_OPTIONS.find((s) => s.status === currentStatus)

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 24 }}>
      {/* Toast */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle size={16} color="#4ade80" />
          {toast}
        </div>
      )}

      {/* Backdrop */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
        {backdropUrl ? (
          <img src={backdropUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--color-bg-secondary)' }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,10,15,0.5) 0%, rgba(10,10,15,0.8) 60%, rgba(10,10,15,1) 100%)',
        }} />

        {/* Back button */}
        <button
          id="detail-back"
          className="btn btn-ghost btn-icon"
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: 16, left: 12,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
            borderRadius: 50, border: '1px solid var(--color-border)',
          }}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px', marginTop: -24 }}>
        {/* Poster + Info Row */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 16 }}>
          {/* Poster */}
          <div style={{
            flexShrink: 0, width: 100, height: 150,
            borderRadius: 12, overflow: 'hidden',
            border: '2px solid var(--color-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {posterUrl ? (
              <img src={posterUrl} alt={`Poster de ${title}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'var(--color-bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-muted)',
              }}>
                <FilmIcon size={28} />
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
            <span style={{
              display: 'inline-block',
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8,
              padding: '3px 8px', borderRadius: 4, marginBottom: 8,
              background: isTv ? 'rgba(168,85,247,0.2)' : 'rgba(59,130,246,0.2)',
              color: isTv ? '#a855f7' : '#60a5fa',
            }}>
              {isTv ? 'Série' : 'Filme'}
            </span>

            <h1 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, marginBottom: 8, letterSpacing: -0.3 }}>
              {title}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13 }}>
              {year && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)' }}>
                  <Calendar size={13} /> {year}
                </span>
              )}
              {rating && Number(rating) > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-gold)', fontWeight: 600 }}>
                  <Star size={13} fill="currentColor" /> {rating}
                </span>
              )}
              {isTv && tvMedia && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)' }}>
                  <Tv size={13} /> {tvMedia.number_of_seasons} temp.
                </span>
              )}
              {!isTv && (media as TMDBMovieDetails).runtime > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)' }}>
                  <Clock size={13} /> {(media as TMDBMovieDetails).runtime} min
                </span>
              )}
            </div>
          </div>
        </div>

        {/* TV Series stats */}
        {isTv && tvMedia && (
          <div style={{
            display: 'flex', gap: 12, marginBottom: 16,
          }}>
            {[
              { label: 'Temporadas', value: tvMedia.number_of_seasons },
              { label: 'Episódios', value: tvMedia.number_of_episodes },
              { label: 'Estado', value: tvMedia.in_production ? 'Em Produção' : 'Terminada' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                flex: 1, textAlign: 'center',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 8px',
              }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                  {value}
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div style={{ marginBottom: 20, position: 'relative' }}>
          {!user ? (
            <button
              id="detail-login-cta"
              className="btn btn-primary btn-full"
              onClick={() => navigate('/login')}
              style={{ gap: 8 }}
            >
              <Bookmark size={18} />
              Iniciar Sessão para Guardar
            </button>
          ) : userItem ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                id="detail-status-toggle"
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  borderColor: currentStatusInfo ? `${currentStatusInfo.color}44` : undefined,
                  color: currentStatusInfo?.color,
                  background: currentStatusInfo ? `${currentStatusInfo.color}15` : undefined,
                }}
                onClick={() => setShowStatusMenu((v) => !v)}
                disabled={actionLoading}
              >
                {currentStatusInfo && <currentStatusInfo.icon size={16} />}
                {currentStatusInfo?.label || 'Na lista'}
              </button>
              <button
                id="detail-remove"
                className="btn btn-ghost btn-icon"
                onClick={handleRemove}
                disabled={actionLoading}
                aria-label="Remover da lista"
                style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
              >
                {actionLoading ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Plus size={16} style={{ transform: 'rotate(45deg)' }} />}
              </button>
            </div>
          ) : (
            <button
              id="detail-add"
              className="btn btn-primary btn-full"
              onClick={() => setShowStatusMenu((v) => !v)}
              disabled={actionLoading}
            >
              {actionLoading
                ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                : <Plus size={16} />
              }
              Adicionar à lista
            </button>
          )}

          {/* Status dropdown */}
          {user && showStatusMenu && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 50,
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              {STATUS_OPTIONS.map(({ status, label, icon: Icon, color }) => (
                <button
                  key={status}
                  id={`detail-status-${status}`}
                  onClick={() => handleStatusChange(status)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px', background: currentStatus === status ? `${color}15` : 'none',
                    border: 'none', borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer', color: currentStatus === status ? color : 'var(--color-text-primary)',
                    fontSize: 14, fontWeight: 500, textAlign: 'left',
                  }}
                >
                  <Icon size={17} color={color} />
                  {label}
                  {currentStatus === status && (
                    <CheckCircle size={14} color={color} style={{ marginLeft: 'auto' }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TV Series Episode Tracker (if series is in user list) */}
        {user && userItem && isTv && (() => {
          const currentSeasonNum = userItem.current_season || 1
          const currentEpNum = userItem.current_episode || 0
          const validSeasons = tvMedia?.seasons ? tvMedia.seasons.filter((s) => s.season_number > 0) : []
          const curSeasonObj = validSeasons.find((s) => s.season_number === currentSeasonNum) || validSeasons[0]
          const seasonEpisodeCount = curSeasonObj?.episode_count || 1

          return (
            <div
              style={{
                marginBottom: 20,
                padding: '14px 16px',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: 0.6, marginBottom: 3 }}>
                  O teu progresso
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Temporada {currentSeasonNum} · Ep. {currentEpNum} de {seasonEpisodeCount} ep.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleStepEpisode(-1)}
                  disabled={currentEpNum <= 0 && currentSeasonNum <= 1}
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  -1 Ep
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleStepEpisode(1)}
                  style={{ padding: '6px 14px', fontSize: 12, gap: 4 }}
                >
                  <Plus size={13} /> +1 Ep
                </button>
              </div>
            </div>
          )
        })()}

        {/* Overview */}
        {media.overview && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Sinopse</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              {media.overview}
            </p>
          </div>
        )}

        {/* Genres */}
        {media.genres && media.genres.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Géneros</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {media.genres.map((genre) => (
                <span
                  key={genre.id}
                  style={{
                    padding: '5px 12px', borderRadius: 50,
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    fontSize: 13, fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Seasons list (TV only) */}
        {isTv && tvMedia && tvMedia.seasons?.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Temporadas</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tvMedia.seasons
                .filter((s) => s.season_number > 0)
                .map((season) => {
                  const isCurrent = user && userItem && (userItem.current_season || 1) === season.season_number
                  return (
                    <div
                      key={season.id}
                      onClick={() => {
                        if (user && userItem) {
                          handleProgressChange(season.season_number, 1)
                          showToast(`Temporada ${season.season_number} selecionada`)
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: isCurrent ? 'rgba(251, 191, 36, 0.08)' : 'var(--color-bg-card)',
                        border: `1px solid ${isCurrent ? 'rgba(251, 191, 36, 0.5)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        cursor: user && userItem ? 'pointer' : 'default',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      <div style={{
                        width: 40, height: 56, borderRadius: 6, overflow: 'hidden',
                        flexShrink: 0, background: 'var(--color-bg-secondary)',
                      }}>
                        {season.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${season.poster_path}`}
                            alt={season.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                            <Tv size={16} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{season.name}</p>
                          {isCurrent && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                              background: '#fbbf24', color: '#000', padding: '1px 6px', borderRadius: 4,
                            }}>
                              A ver
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {season.episode_count} episódios
                          {season.air_date && ` · ${new Date(season.air_date).getFullYear()}`}
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

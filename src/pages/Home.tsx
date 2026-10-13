import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Film as FilmIcon, Play, Tv, TrendingUp, Trophy, Star } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import MediaCard from '@/components/ui/MediaCard'
import { SkeletonRow } from '@/components/ui/LoadingSpinner'
import { tmdbService, getMediaTitle } from '@/lib/tmdb'
import { mediaListService } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { TMDBMedia, UserMediaItem } from '@/types'

interface ActiveHero {
  id: number
  title: string
  backdrop_path: string | null
  media_type: 'movie' | 'tv'
  isWatching?: boolean
  current_season?: number | null
  current_episode?: number | null
}

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [trending, setTrending] = useState<TMDBMedia[]>([])
  const [popularMovies, setPopularMovies] = useState<TMDBMedia[]>([])
  const [popularTV, setPopularTV] = useState<TMDBMedia[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMedia[]>([])
  const [topRatedTV, setTopRatedTV] = useState<TMDBMedia[]>([])
  const [hero, setHero] = useState<ActiveHero | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingData, moviesData, tvData, topMoviesData, topTVData] = await Promise.all([
          tmdbService.getTrending('all', 'week'),
          tmdbService.getPopularMovies(),
          tmdbService.getPopularTV(),
          tmdbService.getTopRatedMovies(),
          tmdbService.getTopRatedTV(),
        ])

        const trendingResults = trendingData.results.slice(0, 10)
        setTrending(trendingResults)
        setPopularMovies(moviesData.results.slice(0, 10))
        setPopularTV(tvData.results.slice(0, 10))
        setTopRatedMovies(topMoviesData.results.slice(0, 10))
        setTopRatedTV(topTVData.results.slice(0, 10))

        // Check if user has something in "currently_watching"
        let watchingHeroFound: ActiveHero | null = null
        if (user) {
          try {
            const watchingItems = await mediaListService.getByStatus(user.id, 'currently_watching')
            // Prioritize TV series, or fallback to first watching item
            const targetItem = watchingItems.find((i: UserMediaItem) => i.media_type === 'tv') || watchingItems[0]

            if (targetItem) {
              // Fetch TMDB details to get full backdrop
              try {
                const details = targetItem.media_type === 'tv'
                  ? await tmdbService.getTVDetails(targetItem.tmdb_id)
                  : await tmdbService.getMovieDetails(targetItem.tmdb_id)

                watchingHeroFound = {
                  id: targetItem.tmdb_id,
                  title: targetItem.title,
                  backdrop_path: details.backdrop_path,
                  media_type: targetItem.media_type,
                  isWatching: true,
                  current_season: targetItem.current_season,
                  current_episode: targetItem.current_episode,
                }
              } catch {
                watchingHeroFound = {
                  id: targetItem.tmdb_id,
                  title: targetItem.title,
                  backdrop_path: null,
                  media_type: targetItem.media_type,
                  isWatching: true,
                  current_season: targetItem.current_season,
                  current_episode: targetItem.current_episode,
                }
              }
            }
          } catch (e) {
            console.error('Error fetching currently watching item for hero:', e)
          }
        }

        if (watchingHeroFound) {
          setHero(watchingHeroFound)
        } else if (trendingResults[0]) {
          const t = trendingResults[0]
          setHero({
            id: t.id,
            title: getMediaTitle(t),
            backdrop_path: t.backdrop_path,
            media_type: t.media_type || 'movie',
            isWatching: false,
          })
        }
      } catch (err) {
        console.error('Error fetching home data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const heroBackdrop = hero?.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${hero.backdrop_path}`
    : null

  return (
    <Layout>
      {/* Hero Section */}
      {hero && (
        <div className="hero-backdrop" style={{ margin: '0 0 8px' }}>
          {heroBackdrop && (
            <img src={heroBackdrop} alt={hero.title} />
          )}
          <div className="hero-gradient" />
          <div className="hero-content">
            <p style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: hero.isWatching ? '#fbbf24' : 'var(--color-accent)',
              marginBottom: 6,
              textTransform: 'uppercase',
            }}>
              {hero.isWatching ? (
                <>
                  <Tv size={13} />
                  A Continuar a Ver
                </>
              ) : (
                'Em destaque esta semana'
              )}
            </p>

            <h2
              style={{ fontSize: 24, fontWeight: 800, marginBottom: hero.isWatching && hero.current_season ? 4 : 12, lineHeight: 1.2, letterSpacing: -0.3 }}
              onClick={() => navigate(`/${hero.media_type}/${hero.id}`)}
              role="button"
              tabIndex={0}
            >
              {hero.title}
            </h2>

            {hero.isWatching && hero.media_type === 'tv' && (
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                Temporada {hero.current_season || 1} · Episódio {hero.current_episode || 1}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                id="hero-more-info"
                className={`btn ${hero.isWatching ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '9px 18px', fontSize: 13, gap: 6 }}
                onClick={() => navigate(`/${hero.media_type}/${hero.id}`)}
              >
                {hero.isWatching ? (
                  <>
                    <Play size={15} fill="currentColor" />
                    Continuar a Ver
                  </>
                ) : (
                  <>
                    <FilmIcon size={15} />
                    Mais Info
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Greeting */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <h1 className="page-title">
          {user?.email ? `Olá! 👋` : 'Descobre'}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>
          O que vais ver hoje?
        </p>
      </div>

      {/* Melhores Filmes de Sempre */}
      <section className="section" aria-labelledby="top-movies-title">
        <div className="section-header">
          <h2 className="section-title" id="top-movies-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={18} style={{ color: '#f5c518' }} />
            Melhores Filmes de Sempre
          </h2>
          <button className="btn btn-ghost section-link" style={{ padding: 0 }} onClick={() => navigate('/search')}>
            Ver mais
          </button>
        </div>
        {loading ? (
          <SkeletonRow count={5} />
        ) : (
          <div className="scroll-row" role="list" aria-label="Melhores filmes de sempre">
            {topRatedMovies.map((movie) => (
              <div key={`top-movie-${movie.id}`} role="listitem">
                <MediaCard media={{ ...movie, media_type: 'movie' }} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Melhores Séries de Sempre */}
      <section className="section" aria-labelledby="top-tv-title">
        <div className="section-header">
          <h2 className="section-title" id="top-tv-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={18} style={{ color: '#fbbf24' }} fill="#fbbf24" />
            Melhores Séries de Sempre
          </h2>
          <button className="btn btn-ghost section-link" style={{ padding: 0 }} onClick={() => navigate('/search')}>
            Ver mais
          </button>
        </div>
        {loading ? (
          <SkeletonRow count={5} />
        ) : (
          <div className="scroll-row" role="list" aria-label="Melhores séries de sempre">
            {topRatedTV.map((show) => (
              <div key={`top-tv-${show.id}`} role="listitem">
                <MediaCard media={{ ...show, media_type: 'tv' }} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      <section className="section" aria-labelledby="trending-title">
        <div className="section-header">
          <h2 className="section-title" id="trending-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={18} color="var(--color-accent)" />
            Em Alta
          </h2>
          <button className="btn btn-ghost section-link" style={{ padding: 0 }} onClick={() => navigate('/search')}>
            Ver mais
          </button>
        </div>
        {loading ? (
          <SkeletonRow count={5} />
        ) : (
          <div className="scroll-row" role="list" aria-label="Conteúdos em alta">
            {trending.map((item) => (
              <div key={`${item.media_type}-${item.id}`} role="listitem">
                <MediaCard media={item} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Movies */}
      <section className="section" aria-labelledby="movies-title">
        <div className="section-header">
          <h2 className="section-title" id="movies-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilmIcon size={18} style={{ color: '#60a5fa' }} />
            Filmes Populares
          </h2>
        </div>
        {loading ? (
          <SkeletonRow count={5} />
        ) : (
          <div className="scroll-row" role="list" aria-label="Filmes populares">
            {popularMovies.map((movie) => (
              <div key={movie.id} role="listitem">
                <MediaCard media={{ ...movie, media_type: 'movie' }} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular TV */}
      <section className="section" aria-labelledby="tv-title">
        <div className="section-header">
          <h2 className="section-title" id="tv-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} style={{ color: '#a855f7' }} />
            Séries em Destaque
          </h2>
        </div>
        {loading ? (
          <SkeletonRow count={5} />
        ) : (
          <div className="scroll-row" role="list" aria-label="Séries em destaque">
            {popularTV.map((show) => (
              <div key={show.id} role="listitem">
                <MediaCard media={{ ...show, media_type: 'tv' }} />
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}

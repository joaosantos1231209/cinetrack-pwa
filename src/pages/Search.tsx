import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, SlidersHorizontal, Film, Tv, Check, Filter, Loader2 } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import MediaCard from '@/components/ui/MediaCard'
import CompactMediaCard from '@/components/ui/CompactMediaCard'
import { SkeletonCard } from '@/components/ui/LoadingSpinner'
import { tmdbService } from '@/lib/tmdb'
import type { TMDBMedia } from '@/types'

type FilterType = 'all' | 'movie' | 'tv'

const FILTER_OPTIONS: Array<{ value: FilterType; label: string }> = [
  { value: 'all',   label: 'Tudo' },
  { value: 'movie', label: 'Filmes' },
  { value: 'tv',    label: 'Séries' },
]

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2015, 2010]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Query search results
  const [searchResults, setSearchResults] = useState<TMDBMedia[]>([])
  const [searchPage, setSearchPage] = useState(1)
  const [hasMoreSearch, setHasMoreSearch] = useState(false)
  const [loadingMoreSearch, setLoadingMoreSearch] = useState(false)

  // Movies Tab state (Infinite / All)
  const [moviesList, setMoviesList] = useState<TMDBMedia[]>([])
  const [moviePage, setMoviePage] = useState(1)
  const [hasMoreMovies, setHasMoreMovies] = useState(true)
  const [loadingMoreMovies, setLoadingMoreMovies] = useState(false)

  // Series Tab state (Infinite / All)
  const [tvList, setTvList] = useState<TMDBMedia[]>([])
  const [tvPage, setTvPage] = useState(1)
  const [hasMoreTV, setHasMoreTV] = useState(true)
  const [loadingMoreTV, setLoadingMoreTV] = useState(false)

  // "Tudo" Tab state
  const [tudoMovies, setTudoMovies] = useState<TMDBMedia[]>([])
  const [tudoMoviePage, setTudoMoviePage] = useState(1)
  const [tudoTV, setTudoTV] = useState<TMDBMedia[]>([])
  const [tudoTVPage, setTudoTVPage] = useState(1)
  const [loadingMoreTudoMovies, setLoadingMoreTudoMovies] = useState(false)
  const [loadingMoreTudoTV, setLoadingMoreTudoTV] = useState(false)

  // Filter Modal State
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [availableGenres, setAvailableGenres] = useState<Array<{ id: number; name: string }>>([])
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedSort, setSelectedSort] = useState<'date' | 'rating'>('date')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load genre list for filter modal
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movieG, tvG] = await Promise.all([
          tmdbService.getGenres('movie'),
          tmdbService.getGenres('tv'),
        ])
        const map = new Map<number, string>()
        movieG.forEach((g) => map.set(g.id, g.name))
        tvG.forEach((g) => map.set(g.id, g.name))
        setAvailableGenres(Array.from(map.entries()).map(([id, name]) => ({ id, name })))
      } catch (e) {
        console.error('Error loading genres:', e)
      }
    }
    fetchGenres()
  }, [])

  // Initial load or tab change (page 1)
  const loadInitialDiscover = useCallback(async () => {
    setLoading(true)
    try {
      if (filter === 'all') {
        const [mRes, tRes] = await Promise.all([
          tmdbService.discoverMovies({ page: 1, genreId: selectedGenre || undefined, year: selectedYear || undefined, sortBy: selectedSort }),
          tmdbService.discoverTV({ page: 1, genreId: selectedGenre || undefined, year: selectedYear || undefined, sortBy: selectedSort }),
        ])
        setTudoMovies(mRes.results)
        setTudoMoviePage(1)
        setTudoTV(tRes.results)
        setTudoTVPage(1)
      } else if (filter === 'movie') {
        const mRes = await tmdbService.discoverMovies({
          page: 1,
          genreId: selectedGenre || undefined,
          year: selectedYear || undefined,
          sortBy: selectedSort,
        })
        setMoviesList(mRes.results)
        setMoviePage(1)
        setHasMoreMovies(mRes.page < mRes.total_pages)
      } else if (filter === 'tv') {
        const tRes = await tmdbService.discoverTV({
          page: 1,
          genreId: selectedGenre || undefined,
          year: selectedYear || undefined,
          sortBy: selectedSort,
        })
        setTvList(tRes.results)
        setTvPage(1)
        setHasMoreTV(tRes.page < tRes.total_pages)
      }
    } catch (err) {
      console.error('Error discovering content:', err)
    } finally {
      setLoading(false)
    }
  }, [filter, selectedGenre, selectedYear, selectedSort])

  // Load more Movies (for Filmes tab)
  const loadMoreMovies = async () => {
    if (loadingMoreMovies || !hasMoreMovies) return
    setLoadingMoreMovies(true)
    try {
      const nextPage = moviePage + 1
      const res = await tmdbService.discoverMovies({
        page: nextPage,
        genreId: selectedGenre || undefined,
        year: selectedYear || undefined,
        sortBy: selectedSort,
      })
      setMoviesList((prev) => {
        const ids = new Set(prev.map((i) => i.id))
        const news = res.results.filter((i) => !ids.has(i.id))
        return [...prev, ...news]
      })
      setMoviePage(nextPage)
      setHasMoreMovies(nextPage < res.total_pages)
    } catch (err) {
      console.error('Error loading more movies:', err)
    } finally {
      setLoadingMoreMovies(false)
    }
  }

  // Load more Series (for Series tab)
  const loadMoreTV = async () => {
    if (loadingMoreTV || !hasMoreTV) return
    setLoadingMoreTV(true)
    try {
      const nextPage = tvPage + 1
      const res = await tmdbService.discoverTV({
        page: nextPage,
        genreId: selectedGenre || undefined,
        year: selectedYear || undefined,
        sortBy: selectedSort,
      })
      setTvList((prev) => {
        const ids = new Set(prev.map((i) => i.id))
        const news = res.results.filter((i) => !ids.has(i.id))
        return [...prev, ...news]
      })
      setTvPage(nextPage)
      setHasMoreTV(nextPage < res.total_pages)
    } catch (err) {
      console.error('Error loading more TV:', err)
    } finally {
      setLoadingMoreTV(false)
    }
  }

  // Load more for "Tudo" tab
  const loadMoreTudoMovies = async () => {
    if (loadingMoreTudoMovies) return
    setLoadingMoreTudoMovies(true)
    try {
      const nextPage = tudoMoviePage + 1
      const res = await tmdbService.discoverMovies({
        page: nextPage,
        genreId: selectedGenre || undefined,
        year: selectedYear || undefined,
        sortBy: selectedSort,
      })
      setTudoMovies((prev) => {
        const ids = new Set(prev.map((i) => i.id))
        const news = res.results.filter((i) => !ids.has(i.id))
        return [...prev, ...news]
      })
      setTudoMoviePage(nextPage)
    } catch (e) {
      console.error('Error loading more movies in Tudo:', e)
    } finally {
      setLoadingMoreTudoMovies(false)
    }
  }

  const loadMoreTudoTV = async () => {
    if (loadingMoreTudoTV) return
    setLoadingMoreTudoTV(true)
    try {
      const nextPage = tudoTVPage + 1
      const res = await tmdbService.discoverTV({
        page: nextPage,
        genreId: selectedGenre || undefined,
        year: selectedYear || undefined,
        sortBy: selectedSort,
      })
      setTudoTV((prev) => {
        const ids = new Set(prev.map((i) => i.id))
        const news = res.results.filter((i) => !ids.has(i.id))
        return [...prev, ...news]
      })
      setTudoTVPage(nextPage)
    } catch (e) {
      console.error('Error loading more TV in Tudo:', e)
    } finally {
      setLoadingMoreTudoTV(false)
    }
  }

  // Search by text query
  const doSearch = useCallback(async (q: string, f: FilterType) => {
    if (!q.trim()) {
      setSearched(false)
      loadInitialDiscover()
      return
    }

    setLoading(true)
    setSearched(true)
    setSearchPage(1)

    try {
      let data
      if (f === 'movie') {
        data = await tmdbService.searchMovies(q, 1)
      } else if (f === 'tv') {
        data = await tmdbService.searchTV(q, 1)
      } else {
        data = await tmdbService.search(q, 1)
      }

      let filtered = data.results
      if (selectedYear) {
        filtered = filtered.filter((item) => {
          const date = item.release_date || item.first_air_date
          return date && new Date(date).getFullYear() === selectedYear
        })
      }
      if (selectedGenre) {
        filtered = filtered.filter((item) => item.genre_ids?.includes(selectedGenre))
      }

      setSearchResults(filtered)
      setHasMoreSearch(data.page < data.total_pages)
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
      setHasMoreSearch(false)
    } finally {
      setLoading(false)
    }
  }, [loadInitialDiscover, selectedGenre, selectedYear])

  // Load more search results
  const loadMoreSearch = async () => {
    if (loadingMoreSearch || !hasMoreSearch || !query.trim()) return
    setLoadingMoreSearch(true)
    try {
      const nextPage = searchPage + 1
      let data
      if (filter === 'movie') {
        data = await tmdbService.searchMovies(query, nextPage)
      } else if (filter === 'tv') {
        data = await tmdbService.searchTV(query, nextPage)
      } else {
        data = await tmdbService.search(query, nextPage)
      }

      let news = data.results
      if (selectedYear) {
        news = news.filter((item) => {
          const date = item.release_date || item.first_air_date
          return date && new Date(date).getFullYear() === selectedYear
        })
      }
      if (selectedGenre) {
        news = news.filter((item) => item.genre_ids?.includes(selectedGenre))
      }

      setSearchResults((prev) => {
        const ids = new Set(prev.map((i) => i.id))
        const filteredNews = news.filter((i) => !ids.has(i.id))
        return [...prev, ...filteredNews]
      })
      setSearchPage(nextPage)
      setHasMoreSearch(nextPage < data.total_pages)
    } catch (e) {
      console.error('Error loading more search results:', e)
    } finally {
      setLoadingMoreSearch(false)
    }
  }

  useEffect(() => {
    if (!query.trim()) {
      loadInitialDiscover()
    } else {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => doSearch(query, filter), 350)
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, filter, selectedGenre, selectedYear, doSearch, loadInitialDiscover])

  const clearSearch = () => {
    setQuery('')
    setSearched(false)
    inputRef.current?.focus()
  }

  const hasActiveFilters = selectedGenre !== null || selectedYear !== null || selectedSort !== 'date'

  const clearFilters = () => {
    setSelectedGenre(null)
    setSelectedYear(null)
    setSelectedSort('date')
  }

  return (
    <Layout>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title">Pesquisar</h1>
        <button
          id="search-filter-button"
          onClick={() => setShowFilterModal(true)}
          style={{
            position: 'relative',
            background: hasActiveFilters ? 'rgba(229, 9, 20, 0.15)' : 'var(--color-bg-card)',
            border: `1px solid ${hasActiveFilters ? 'var(--color-accent)' : 'var(--color-border)'}`,
            borderRadius: 10,
            padding: '8px 10px',
            color: hasActiveFilters ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          aria-label="Abrir filtros"
        >
          <SlidersHorizontal size={18} />
          {hasActiveFilters && (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                position: 'absolute',
                top: 4,
                right: 4,
              }}
            />
          )}
        </button>
      </div>

      {/* Search bar */}
      <div style={{ padding: '0 16px 12px' }}>
        <div className="search-bar">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            id="search-input"
            type="search"
            className="input-field"
            placeholder="Pesquisar por título..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Pesquisar filmes e séries"
            enterKeyHint="search"
          />
          {query && (
            <button
              id="clear-search"
              onClick={clearSearch}
              style={{
                position: 'absolute', right: 14,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', padding: 4,
                display: 'flex', alignItems: 'center',
              }}
              aria-label="Limpar pesquisa"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tab-list" role="tablist" aria-label="Filtrar por tipo" style={{ marginBottom: 14 }}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            id={`filter-${opt.value}`}
            role="tab"
            aria-selected={filter === opt.value}
            className={`tab-item${filter === opt.value ? ' active' : ''}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Active filters badge row */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Filtros ativos:</span>
          {selectedSort === 'rating' && (
            <span style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fbbf24',
            }}>
              ⭐ Mais Bem Avaliados
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedSort('date')} />
            </span>
          )}
          {selectedYear && (
            <span style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              Ano: {selectedYear}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedYear(null)} />
            </span>
          )}
          {selectedGenre && (
            <span style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {availableGenres.find((g) => g.id === selectedGenre)?.name}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedGenre(null)} />
            </span>
          )}
          <button
            onClick={clearFilters}
            style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
          >
            Limpar tudo
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="netflix-grid" aria-label="A carregar resultados" aria-busy="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="netflix-card skeleton" />
          ))}
        </div>
      ) : searched ? (
        /* Search Query Results */
        searchResults.length === 0 ? (
          <div className="empty-state" role="status">
            <div className="empty-state-icon">
              <Search size={32} />
            </div>
            <h2 className="empty-state-title">Sem resultados</h2>
            <p className="empty-state-text">
              Não encontrámos nada para "{query}". Tenta outro termo ou limpa os filtros.
            </p>
          </div>
        ) : (
          <div style={{ paddingBottom: 24 }}>
            <div className="netflix-grid" role="list" aria-label={`Resultados para "${query}"`}>
              {searchResults.map((item) => (
                <CompactMediaCard key={`${item.media_type}-${item.id}`} media={item} />
              ))}
            </div>
            {hasMoreSearch && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, padding: '0 16px' }}>
                <button
                  onClick={loadMoreSearch}
                  disabled={loadingMoreSearch}
                  className="btn btn-outline"
                  style={{ width: '100%', maxWidth: 300, gap: 8 }}
                >
                  {loadingMoreSearch ? <Loader2 size={16} className="spin" /> : null}
                  Carregar Mais Resultados
                </button>
              </div>
            )}
          </div>
        )
      ) : filter === 'all' ? (
        /* ─── Default "Tudo" View: Filmes & Séries com suporte a carregar tudo ─── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 32 }}>
          {/* Filmes Mais Recentes */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Film size={18} color="#60a5fa" />
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Filmes (Por Ordem de Lançamento)</h2>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: 0, color: 'var(--color-accent)' }}
                onClick={() => setFilter('movie')}
              >
                Ver todos ({tudoMovies.length}+)
              </button>
            </div>
            <div className="netflix-grid">
              {tudoMovies.map((item) => (
                <CompactMediaCard key={`all-movie-${item.id}`} media={item} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14, padding: '0 16px' }}>
              <button
                onClick={loadMoreTudoMovies}
                disabled={loadingMoreTudoMovies}
                className="btn btn-ghost"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  fontSize: 12,
                  fontWeight: 600,
                  width: '100%',
                  gap: 6,
                }}
              >
                {loadingMoreTudoMovies ? <Loader2 size={14} className="spin" /> : <Film size={14} color="#60a5fa" />}
                + Carregar mais filmes ({tudoMovies.length} carregados)
              </button>
            </div>
          </section>

          {/* Séries Mais Recentes */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tv size={18} color="#a855f7" />
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Séries (Por Ordem de Lançamento)</h2>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: 0, color: 'var(--color-accent)' }}
                onClick={() => setFilter('tv')}
              >
                Ver todas ({tudoTV.length}+)
              </button>
            </div>
            <div className="netflix-grid">
              {tudoTV.map((item) => (
                <CompactMediaCard key={`all-tv-${item.id}`} media={item} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14, padding: '0 16px' }}>
              <button
                onClick={loadMoreTudoTV}
                disabled={loadingMoreTudoTV}
                className="btn btn-ghost"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  fontSize: 12,
                  fontWeight: 600,
                  width: '100%',
                  gap: 6,
                }}
              >
                {loadingMoreTudoTV ? <Loader2 size={14} className="spin" /> : <Tv size={14} color="#a855f7" />}
                + Carregar mais séries ({tudoTV.length} carregadas)
              </button>
            </div>
          </section>
        </div>
      ) : filter === 'movie' ? (
        /* ─── "Filmes" Tab: Ecrã total, tamanho uniforme menor, todos os filmes ─── */
        <div style={{ paddingBottom: 32 }}>
          <div style={{ padding: '0 12px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              A mostrar {moviesList.length} filmes por ordem de lançamento
            </span>
          </div>

          <div className="netflix-grid" role="list">
            {moviesList.map((item) => (
              <CompactMediaCard key={`movie-item-${item.id}`} media={item} />
            ))}
          </div>

          {hasMoreMovies && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, padding: '0 16px' }}>
              <button
                id="load-more-movies-btn"
                onClick={loadMoreMovies}
                disabled={loadingMoreMovies}
                className="btn btn-primary"
                style={{ width: '100%', maxWidth: 360, gap: 8, padding: '12px 20px', borderRadius: 50 }}
              >
                {loadingMoreMovies ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    A carregar mais filmes...
                  </>
                ) : (
                  <>
                    <Film size={18} />
                    Carregar Mais Filmes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ─── "Séries" Tab: Ecrã total, tamanho uniforme menor, todas as séries ─── */
        <div style={{ paddingBottom: 32 }}>
          <div style={{ padding: '0 12px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              A mostrar {tvList.length} séries por ordem de lançamento
            </span>
          </div>

          <div className="netflix-grid" role="list">
            {tvList.map((item) => (
              <CompactMediaCard key={`tv-item-${item.id}`} media={item} />
            ))}
          </div>

          {hasMoreTV && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, padding: '0 16px' }}>
              <button
                id="load-more-tv-btn"
                onClick={loadMoreTV}
                disabled={loadingMoreTV}
                className="btn btn-primary"
                style={{ width: '100%', maxWidth: 360, gap: 8, padding: '12px 20px', borderRadius: 50 }}
              >
                {loadingMoreTV ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    A carregar mais séries...
                  </>
                ) : (
                  <>
                    <Tv size={18} />
                    Carregar Mais Séries
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
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
          onClick={() => setShowFilterModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Filter size={18} color="var(--color-accent)" />
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Filtros</h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tipo */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Tipo
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 8,
                      border: `1px solid ${filter === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: filter === opt.value ? 'rgba(229, 9, 20, 0.15)' : 'var(--color-bg-secondary)',
                      color: filter === opt.value ? 'var(--color-accent)' : 'var(--color-text-primary)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ordenação */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Ordenar por
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <button
                  onClick={() => setSelectedSort('date')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: `1px solid ${selectedSort === 'date' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: selectedSort === 'date' ? 'rgba(229, 9, 20, 0.15)' : 'var(--color-bg-secondary)',
                    color: selectedSort === 'date' ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Mais Recentes
                </button>
                <button
                  onClick={() => setSelectedSort('rating')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: `1px solid ${selectedSort === 'rating' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: selectedSort === 'rating' ? 'rgba(229, 9, 20, 0.15)' : 'var(--color-bg-secondary)',
                    color: selectedSort === 'rating' ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ⭐ Melhores Avaliados
                </button>
              </div>
            </div>

            {/* Ano */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Ano de Lançamento
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedYear(null)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 50,
                    border: `1px solid ${selectedYear === null ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: selectedYear === null ? 'rgba(229, 9, 20, 0.15)' : 'var(--color-bg-secondary)',
                    color: selectedYear === null ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Todos
                </button>
                {YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y === selectedYear ? null : y)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 50,
                      border: `1px solid ${selectedYear === y ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: selectedYear === y ? 'rgba(229, 9, 20, 0.15)' : 'var(--color-bg-secondary)',
                      color: selectedYear === y ? 'var(--color-accent)' : 'var(--color-text-primary)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Categorias / Géneros */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Categorias / Géneros
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxHeight: 180, overflowY: 'auto' }}>
                <button
                  onClick={() => setSelectedGenre(null)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 50,
                    border: `1px solid ${selectedGenre === null ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: selectedGenre === null ? 'rgba(229, 9, 20, 0.15)' : 'var(--color-bg-secondary)',
                    color: selectedGenre === null ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Todas
                </button>
                {availableGenres.map((g) => {
                  const isSel = selectedGenre === g.id
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGenre(isSel ? null : g.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 50,
                        border: `1px solid ${isSel ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        background: isSel ? 'rgba(229, 9, 20, 0.15)' : 'var(--color-bg-secondary)',
                        color: isSel ? 'var(--color-accent)' : 'var(--color-text-primary)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {g.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={clearFilters}
                className="btn btn-outline"
                style={{ flex: 1, padding: 12 }}
              >
                Limpar
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="btn btn-primary"
                style={{ flex: 1, padding: 12 }}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

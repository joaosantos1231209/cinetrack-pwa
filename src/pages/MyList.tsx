import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, Bookmark, Eye, CheckCircle, Loader2, ChevronRight, SlidersHorizontal, X, Filter, Search, Star, ArrowUpDown } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { mediaListService } from '@/lib/supabase'
import { tmdbImage } from '@/lib/tmdb'
import type { UserMediaItem, WatchStatus, MediaType } from '@/types'

const SAVED_TAB_KEY = 'cinetrack_last_mylist_tab'

const TABS: Array<{ status: WatchStatus; label: string; icon: typeof Bookmark; color: string }> = [
  { status: 'wishlist',           label: 'Quero Ver',  icon: Bookmark,    color: '#60a5fa' },
  { status: 'currently_watching', label: 'A Ver',      icon: Eye,         color: '#fbbf24' },
  { status: 'watched',            label: 'Visto',      icon: CheckCircle, color: '#4ade80' },
]

type ListSortOption = 'recent' | 'oldest' | 'title_asc' | 'title_desc' | 'rating_desc'

export default function MyListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Initialize with the last visited tab saved in localStorage
  const [activeTab, setActiveTab] = useState<WatchStatus>(() => {
    const saved = localStorage.getItem(SAVED_TAB_KEY)
    if (saved === 'wishlist' || saved === 'currently_watching' || saved === 'watched') {
      return saved
    }
    return 'currently_watching'
  })

  const [items, setItems] = useState<UserMediaItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filters state (available in "Quero Ver", "Visto" and overall)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filterType, setFilterType] = useState<'all' | MediaType>('all')
  const [sortBy, setSortBy] = useState<ListSortOption>('recent')
  const [searchQuery, setSearchQuery] = useState('')

  const handleTabChange = (status: WatchStatus) => {
    setActiveTab(status)
    localStorage.setItem(SAVED_TAB_KEY, status)
  }

  useEffect(() => {
    if (!user) return

    const fetchItems = async () => {
      setLoading(true)
      try {
        const data = await mediaListService.getByStatus(user.id, activeTab)
        setItems(data)
      } catch (err) {
        console.error('Error fetching list:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [user, activeTab])

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Type filter
    if (filterType !== 'all') {
      result = result.filter((i) => i.media_type === filterType)
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((i) => i.title.toLowerCase().includes(q))
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updated_at || b.added_at).getTime() - new Date(a.updated_at || a.added_at).getTime()
      }
      if (sortBy === 'oldest') {
        return new Date(a.added_at).getTime() - new Date(b.added_at).getTime()
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'title_desc') {
        return b.title.localeCompare(a.title)
      }
      if (sortBy === 'rating_desc') {
        const rateA = a.user_rating || a.vote_average || 0
        const rateB = b.user_rating || b.vote_average || 0
        return rateB - rateA
      }
      return 0
    })

    return result
  }, [items, filterType, sortBy, searchQuery])

  const hasActiveFilters = filterType !== 'all' || sortBy !== 'recent' || searchQuery.trim() !== ''

  const clearFilters = () => {
    setFilterType('all')
    setSortBy('recent')
    setSearchQuery('')
  }

  if (!user) {
    return (
      <Layout>
        <div className="empty-state" style={{ marginTop: 48 }}>
          <div className="empty-state-icon">
            <List size={32} />
          </div>
          <h2 className="empty-state-title">A minha lista</h2>
          <p className="empty-state-text">Inicia sessão para guardar e gerir os teus filmes e séries.</p>
          <button
            id="mylist-login-cta"
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

  const activeTabInfo = TABS.find((t) => t.status === activeTab)!
  const isFilterableTab = activeTab === 'wishlist' || activeTab === 'watched' || activeTab === 'currently_watching'

  return (
    <Layout>
      {/* Header with Title, Count, and Filter Button */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">A minha lista</h1>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {hasActiveFilters ? `${filteredItems.length} de ${items.length} itens` : `${items.length} itens`}
          </span>
        </div>

        {isFilterableTab && (
          <button
            id="mylist-filter-button"
            onClick={() => setShowFilterModal(true)}
            style={{
              position: 'relative',
              background: hasActiveFilters ? 'rgba(229, 9, 20, 0.15)' : 'var(--color-bg-card)',
              border: `1px solid ${hasActiveFilters ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: 10,
              padding: '8px 12px',
              color: hasActiveFilters ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              fontSize: 13,
            }}
            aria-label="Filtrar lista"
          >
            <SlidersHorizontal size={16} />
            <span>Filtrar</span>
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
        )}
      </div>

      {/* Status Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '0 16px 14px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
        role="tablist"
        aria-label="Estado dos conteúdos"
      >
        {TABS.map(({ status, label, icon: Icon, color }) => {
          const isActive = activeTab === status
          return (
            <button
              key={status}
              id={`mylist-tab-${status}`}
              role="tab"
              aria-selected={isActive}
              className="btn"
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                fontSize: 13,
                background: isActive ? `${color}22` : 'var(--color-bg-card)',
                color: isActive ? color : 'var(--color-text-muted)',
                border: `1px solid ${isActive ? `${color}44` : 'var(--color-border)'}`,
                borderRadius: 50,
                gap: 6,
              }}
              onClick={() => handleTabChange(status)}
            >
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Active filters badges (como na pesquisa) */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Filtros ativos:</span>
          {filterType !== 'all' && (
            <span style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              Tipo: {filterType === 'movie' ? 'Filmes' : 'Séries'}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilterType('all')} />
            </span>
          )}
          {sortBy !== 'recent' && (
            <span style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {sortBy === 'title_asc' && 'Ordem: A - Z'}
              {sortBy === 'title_desc' && 'Ordem: Z - A'}
              {sortBy === 'oldest' && 'Mais antigos primeiro'}
              {sortBy === 'rating_desc' && 'Melhor avaliação'}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSortBy('recent')} />
            </span>
          )}
          {searchQuery.trim() && (
            <span style={{
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              "{searchQuery}"
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
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
        <div className="flex-center" style={{ marginTop: 48 }}>
          <Loader2 size={28} color="var(--color-accent)" style={{ animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div
            className="empty-state-icon"
            style={{ color: activeTabInfo.color, background: `${activeTabInfo.color}15` }}
          >
            <activeTabInfo.icon size={32} />
          </div>
          <h2 className="empty-state-title">Nada aqui ainda</h2>
          <p className="empty-state-text">
            {activeTab === 'wishlist' && 'Adiciona filmes e séries à tua lista de "Quero Ver".'}
            {activeTab === 'currently_watching' && 'Marca o que estás a ver agora para fazer tracking.'}
            {activeTab === 'watched' && 'Os conteúdos que viste aparecerão aqui.'}
          </p>
          <button
            id="mylist-search-cta"
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            onClick={() => navigate('/search')}
          >
            Pesquisar conteúdo
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 24 }}>
          <div className="empty-state-icon">
            <Filter size={28} />
          </div>
          <h2 className="empty-state-title">Nenhum resultado com estes filtros</h2>
          <p className="empty-state-text">Experimenta alterar ou limpar os filtros para veres os teus conteúdos.</p>
          <button
            onClick={clearFilters}
            className="btn btn-outline"
            style={{ marginTop: 12 }}
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div
          style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24 }}
          role="list"
          aria-label={`Lista: ${activeTabInfo.label}`}
        >
          {filteredItems.map((item) => (
            <MyListItem
              key={item.id}
              item={item}
              onClick={() => navigate(`/${item.media_type}/${item.tmdb_id}`)}
            />
          ))}
        </div>
      )}

      {/* Filter Modal (Como na Pesquisa) */}
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
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Filtrar "{activeTabInfo.label}"</h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Pesquisar na lista */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Pesquisar por título
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filtrar por nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Tipo */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Tipo de Conteúdo
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { value: 'all', label: 'Tudo' },
                  { value: 'movie', label: 'Filmes' },
                  { value: 'tv', label: 'Séries' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterType(opt.value as any)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 8,
                      border: `1px solid ${filterType === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: filterType === opt.value ? 'rgba(229, 9, 20, 0.15)' : 'var(--color-bg-secondary)',
                      color: filterType === opt.value ? 'var(--color-accent)' : 'var(--color-text-primary)',
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
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Ordenar por
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { value: 'recent', label: 'Adicionado recentemente (Mais recente)' },
                  { value: 'oldest', label: 'Adicionado antigamente (Mais antigo)' },
                  { value: 'title_asc', label: 'Título (A - Z)' },
                  { value: 'title_desc', label: 'Título (Z - A)' },
                  { value: 'rating_desc', label: 'Melhor avaliação / nota' },
                ].map((opt) => {
                  const isSelected = sortBy === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value as ListSortOption)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        background: isSelected ? 'rgba(229, 9, 20, 0.12)' : 'var(--color-bg-secondary)',
                        color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)',
                        fontSize: 13,
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)' }} />}
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

// ─── List Item Component ──────────────────────────────────────────────────────

interface MyListItemProps {
  item: UserMediaItem
  onClick: () => void
}

function MyListItem({ item, onClick }: MyListItemProps) {
  const posterUrl = tmdbImage.poster(item.poster_path, 'w185')

  return (
    <div
      role="listitem"
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 14,
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        padding: 12,
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
      }}
      className="media-card-hover"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Poster */}
      <div
        style={{
          flexShrink: 0,
          width: 58,
          height: 86,
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--color-bg-secondary)',
        }}
      >
        {posterUrl ? (
          <img src={posterUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-muted)',
          }}>
            <Eye size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}
          className="truncate"
        >
          {item.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
            padding: '2px 7px', borderRadius: 4,
            background: item.media_type === 'movie' ? 'rgba(59,130,246,0.15)' : 'rgba(168,85,247,0.15)',
            color: item.media_type === 'movie' ? '#60a5fa' : '#a855f7',
          }}>
            {item.media_type === 'movie' ? 'Filme' : 'Série'}
          </span>

          {/* Rating if available */}
          {item.vote_average && item.vote_average > 0 ? (
            <span style={{ fontSize: 11, color: 'var(--color-gold)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Star size={10} fill="currentColor" />
              {item.vote_average.toFixed(1)}
            </span>
          ) : null}

          {/* Progress display for TV shows */}
          {item.media_type === 'tv' && item.status === 'currently_watching' && (
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#fbbf24',
              background: 'rgba(251, 191, 36, 0.12)',
              padding: '2px 8px',
              borderRadius: 4,
            }}>
              T{item.current_season || 1} · Ep. {item.current_episode || 0}
            </span>
          )}
        </div>
      </div>

      {/* Right chevron indicator */}
      <div style={{ color: 'var(--color-text-muted)', flexShrink: 0, paddingRight: 4 }}>
        <ChevronRight size={18} />
      </div>
    </div>
  )
}

import axios from 'axios'
import type {
  TMDBSearchResult,
  TMDBMovieDetails,
  TMDBTVDetails,
  TMDBMedia,
} from '@/types'

const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p'

if (!API_KEY) {
  console.warn('Missing VITE_TMDB_API_KEY environment variable. TMDB features will not work.')
}

const tmdbClient = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'pt-PT',
  },
  timeout: 10000,
})

// ─── Image URL helpers ────────────────────────────────────────────────────────

export const tmdbImage = {
  poster: (path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w342') =>
    path ? `${IMAGE_BASE_URL}/${size}${path}` : null,

  backdrop: (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w780') =>
    path ? `${IMAGE_BASE_URL}/${size}${path}` : null,

  profile: (path: string | null, size: 'w45' | 'w185' | 'h632' | 'original' = 'w185') =>
    path ? `${IMAGE_BASE_URL}/${size}${path}` : null,
}

// ─── Helper: get display title ────────────────────────────────────────────────

export const getMediaTitle = (media: TMDBMedia): string =>
  media.title || media.name || media.original_title || media.original_name || 'Sem título'

export const getMediaYear = (media: TMDBMedia): string => {
  const date = media.release_date || media.first_air_date
  return date ? new Date(date).getFullYear().toString() : '—'
}

// ─── Search ──────────────────────────────────────────────────────────────────

export const tmdbService = {
  /**
   * Multi-search: returns both movies and TV shows ranked by relevance.
   */
  async search(query: string, page = 1): Promise<TMDBSearchResult> {
    if (!query.trim()) return { page: 1, results: [], total_pages: 0, total_results: 0 }

    const { data } = await tmdbClient.get<TMDBSearchResult>('/search/multi', {
      params: { query: query.trim(), page, include_adult: false },
    })

    // Filter out persons, keep only movies and TV shows
    return {
      ...data,
      results: data.results.filter(
        (item) => item.media_type === 'movie' || item.media_type === 'tv'
      ),
    }
  },

  /**
   * Search movies only.
   */
  async searchMovies(query: string, page = 1): Promise<TMDBSearchResult> {
    const { data } = await tmdbClient.get<TMDBSearchResult>('/search/movie', {
      params: { query: query.trim(), page },
    })
    return {
      ...data,
      results: data.results.map((m) => ({ ...m, media_type: 'movie' as const })),
    }
  },

  /**
   * Search TV shows only.
   */
  async searchTV(query: string, page = 1): Promise<TMDBSearchResult> {
    const { data } = await tmdbClient.get<TMDBSearchResult>('/search/tv', {
      params: { query: query.trim(), page },
    })
    return {
      ...data,
      results: data.results.map((t) => ({ ...t, media_type: 'tv' as const })),
    }
  },

  // ─── Details ───────────────────────────────────────────────────────────────

  /**
   * Get full movie details.
   */
  async getMovieDetails(id: number): Promise<TMDBMovieDetails> {
    const { data } = await tmdbClient.get<TMDBMovieDetails>(`/movie/${id}`, {
      params: { append_to_response: 'videos,credits' },
    })
    return { ...data, media_type: 'movie' }
  },

  /**
   * Get full TV show details including seasons.
   */
  async getTVDetails(id: number): Promise<TMDBTVDetails> {
    const { data } = await tmdbClient.get<TMDBTVDetails>(`/tv/${id}`, {
      params: { append_to_response: 'videos,credits' },
    })
    return { ...data, media_type: 'tv' }
  },

  // ─── Discovery ─────────────────────────────────────────────────────────────

  /**
   * Trending content (week).
   */
  async getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResult> {
    const { data } = await tmdbClient.get<TMDBSearchResult>(`/trending/${mediaType}/${timeWindow}`)
    return data
  },

  /**
   * Popular movies.
   */
  async getPopularMovies(page = 1): Promise<TMDBSearchResult> {
    const { data } = await tmdbClient.get<TMDBSearchResult>('/movie/popular', { params: { page } })
    return {
      ...data,
      results: data.results.map((m) => ({ ...m, media_type: 'movie' as const })),
    }
  },

  /**
   * Popular TV shows.
   */
  async getPopularTV(page = 1): Promise<TMDBSearchResult> {
    const { data } = await tmdbClient.get<TMDBSearchResult>('/tv/popular', { params: { page } })
    return {
      ...data,
      results: data.results.map((t) => ({ ...t, media_type: 'tv' as const })),
    }
  },

  /**
   * Top rated movies.
   */
  async getTopRatedMovies(page = 1): Promise<TMDBSearchResult> {
    const { data } = await tmdbClient.get<TMDBSearchResult>('/movie/top_rated', { params: { page } })
    return {
      ...data,
      results: data.results.map((m) => ({ ...m, media_type: 'movie' as const })),
    }
  },

  /**
   * Top rated TV shows (Melhores Séries de Sempre).
   */
  async getTopRatedTV(page = 1): Promise<TMDBSearchResult> {
    const { data } = await tmdbClient.get<TMDBSearchResult>('/tv/top_rated', { params: { page } })
    return {
      ...data,
      results: data.results.map((t) => ({ ...t, media_type: 'tv' as const })),
    }
  },

  /**
   * Discover movies sorted by release date or rating with filters.
   */
  async discoverMovies(options: { page?: number; genreId?: number; year?: number; sortBy?: 'date' | 'rating' } = {}): Promise<TMDBSearchResult> {
    const today = new Date().toISOString().split('T')[0]
    const params: Record<string, unknown> = {
      page: options.page || 1,
    }
    if (options.sortBy === 'rating') {
      params.sort_by = 'vote_average.desc'
      params['vote_count.gte'] = 250
    } else {
      params.sort_by = 'primary_release_date.desc'
      params['primary_release_date.lte'] = today
    }
    if (options.genreId) params.with_genres = options.genreId
    if (options.year) params.primary_release_year = options.year

    const { data } = await tmdbClient.get<TMDBSearchResult>('/discover/movie', { params })
    return {
      ...data,
      results: data.results.map((m) => ({ ...m, media_type: 'movie' as const })),
    }
  },

  /**
   * Discover TV series sorted by first air date or rating with filters.
   */
  async discoverTV(options: { page?: number; genreId?: number; year?: number; sortBy?: 'date' | 'rating' } = {}): Promise<TMDBSearchResult> {
    const today = new Date().toISOString().split('T')[0]
    const params: Record<string, unknown> = {
      page: options.page || 1,
    }
    if (options.sortBy === 'rating') {
      params.sort_by = 'vote_average.desc'
      params['vote_count.gte'] = 150
    } else {
      params.sort_by = 'first_air_date.desc'
      params['first_air_date.lte'] = today
    }
    if (options.genreId) params.with_genres = options.genreId
    if (options.year) params.first_air_date_year = options.year

    const { data } = await tmdbClient.get<TMDBSearchResult>('/discover/tv', { params })
    return {
      ...data,
      results: data.results.map((t) => ({ ...t, media_type: 'tv' as const })),
    }
  },

  /**
   * Get list of genres for movies and TV.
   */
  async getGenres(type: 'movie' | 'tv' = 'movie'): Promise<Array<{ id: number; name: string }>> {
    const { data } = await tmdbClient.get<{ genres: Array<{ id: number; name: string }> }>(`/genre/${type}/list`)
    return data.genres || []
  },
}

export default tmdbService

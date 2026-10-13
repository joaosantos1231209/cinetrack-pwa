// ─── Media Types (TMDB) ───────────────────────────────────────────────────────

export type MediaType = 'movie' | 'tv'

export interface TMDBMedia {
  id: number
  title?: string          // movies
  name?: string           // tv shows
  original_title?: string
  original_name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  release_date?: string   // movies
  first_air_date?: string // tv shows
  genre_ids?: number[]
  media_type?: MediaType
  popularity: number
}

export interface TMDBMovieDetails extends TMDBMedia {
  media_type: 'movie'
  runtime: number
  status: string
  tagline: string
  genres: Array<{ id: number; name: string }>
  production_companies: Array<{ id: number; name: string; logo_path: string | null }>
  spoken_languages: Array<{ english_name: string; name: string }>
  budget: number
  revenue: number
  homepage: string
  imdb_id: string
}

export interface TMDBTVDetails extends TMDBMedia {
  media_type: 'tv'
  number_of_seasons: number
  number_of_episodes: number
  episode_run_time: number[]
  status: string
  tagline: string
  genres: Array<{ id: number; name: string }>
  seasons: TMDBSeason[]
  networks: Array<{ id: number; name: string; logo_path: string | null }>
  created_by: Array<{ id: number; name: string; profile_path: string | null }>
  homepage: string
  in_production: boolean
  last_air_date: string
}

export interface TMDBSeason {
  id: number
  name: string
  season_number: number
  episode_count: number
  overview: string
  poster_path: string | null
  air_date: string | null
}

export interface TMDBSearchResult {
  page: number
  results: TMDBMedia[]
  total_pages: number
  total_results: number
}

// ─── User Media List Types ────────────────────────────────────────────────────

export type WatchStatus = 'wishlist' | 'currently_watching' | 'watched'

export interface UserMediaItem {
  id: string
  user_id: string
  tmdb_id: number
  media_type: MediaType
  status: WatchStatus
  title: string
  poster_path: string | null
  vote_average: number
  // For TV series tracking
  current_season: number | null
  current_episode: number | null
  total_seasons: number | null
  total_episodes: number | null
  // Timestamps
  added_at: string
  updated_at: string
  // Optional user notes
  user_rating: number | null
  notes: string | null
}

export interface UserMediaInsert {
  tmdb_id: number
  media_type: MediaType
  status: WatchStatus
  title: string
  poster_path: string | null
  vote_average: number
  current_season?: number | null
  current_episode?: number | null
  total_seasons?: number | null
  total_episodes?: number | null
  user_rating?: number | null
  notes?: string | null
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  created_at: string
}

// ─── UI Types ────────────────────────────────────────────────────────────────

export type TabType = 'home' | 'search' | 'mylist' | 'profile'

export interface NavigationTab {
  id: TabType
  label: string
  path: string
}

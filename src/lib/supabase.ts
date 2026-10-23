import { createClient } from '@supabase/supabase-js'
import type { UserMediaItem, UserMediaInsert, WatchStatus } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export const authService = {
  async signUp(email: string, password: string, displayName?: string) {
    const defaultName = displayName || email.split('@')[0]
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: defaultName,
          name: defaultName,
        },
      },
    })
    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async updateProfile(displayName: string) {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName.trim(),
        name: displayName.trim(),
      },
    })
    if (error) throw error
    return data.user
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// ─── Media List helpers ───────────────────────────────────────────────────────

export const mediaListService = {
  async getUserList(userId: string): Promise<UserMediaItem[]> {
    const { data, error } = await supabase
      .from('user_media_list')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data as UserMediaItem[]
  },

  async getByStatus(userId: string, status: WatchStatus): Promise<UserMediaItem[]> {
    const { data, error } = await supabase
      .from('user_media_list')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data as UserMediaItem[]
  },

  async getItem(userId: string, tmdbId: number): Promise<UserMediaItem | null> {
    const { data, error } = await supabase
      .from('user_media_list')
      .select('*')
      .eq('user_id', userId)
      .eq('tmdb_id', tmdbId)
      .maybeSingle()

    if (error) throw error
    return data as UserMediaItem | null
  },

  async addItem(userId: string, item: UserMediaInsert): Promise<UserMediaItem> {
    const { data, error } = await supabase
      .from('user_media_list')
      .insert({ user_id: userId, ...item })
      .select()
      .single()

    if (error) throw error
    return data as UserMediaItem
  },

  async updateItem(
    userId: string,
    tmdbId: number,
    updates: Partial<UserMediaInsert>
  ): Promise<UserMediaItem> {
    const { data, error } = await supabase
      .from('user_media_list')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('tmdb_id', tmdbId)
      .select()
      .single()

    if (error) throw error
    return data as UserMediaItem
  },

  async updateStatus(
    userId: string,
    tmdbId: number,
    status: WatchStatus
  ): Promise<UserMediaItem> {
    return mediaListService.updateItem(userId, tmdbId, { status })
  },

  async updateProgress(
    userId: string,
    tmdbId: number,
    season: number,
    episode: number
  ): Promise<UserMediaItem> {
    return mediaListService.updateItem(userId, tmdbId, {
      current_season: season,
      current_episode: episode,
    })
  },

  async removeItem(userId: string, tmdbId: number): Promise<void> {
    const { error } = await supabase
      .from('user_media_list')
      .delete()
      .eq('user_id', userId)
      .eq('tmdb_id', tmdbId)

    if (error) throw error
  },
}

import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { cachedGet, progressApi } from '../lib/api'

interface AppState {
  cards: any[]
  categories: any[]
  summary: any
  user: any
  loaded: boolean
  loading: boolean
  loadAll: () => Promise<void>
  refreshSummary: () => Promise<void>
  setUser: (user: any) => void
}

export const useStore = create<AppState>((set, get) => ({
  cards: [],
  categories: [],
  summary: null,
  user: null,
  loaded: false,
  loading: false,

  loadAll: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    try {
      const [catsRes, cardsRes, summaryRes] = await Promise.all([
        cachedGet('/api/cards/categories/'),
        cachedGet('/api/ai/random/?count=601'),
        progressApi.summary(),
      ])

      const cards = (cardsRes.data.questions || []).map((q: any) => ({
        id: q.card_id,
        source_text: q.source_text,
        target_text: q.target_text,
        romanization: q.romanization,
      }))

      set({
        categories: catsRes.data.results || catsRes.data,
        cards,
        summary: summaryRes.data,
        loaded: true,
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  refreshSummary: async () => {
    try {
      const res = await progressApi.summary()
      set({ summary: res.data })
    } catch {}
  },

  setUser: (user) => set({ user }),
}))
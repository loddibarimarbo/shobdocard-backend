import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = 'http://192.168.0.239:8000'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refresh = await AsyncStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/token/refresh/`, { refresh })
          await AsyncStorage.setItem('access_token', data.access)
          err.config.headers.Authorization = `Bearer ${data.access}`
          return api(err.config)
        } catch {
          await AsyncStorage.removeItem('access_token')
          await AsyncStorage.removeItem('refresh_token')
        }
      }
    }
    return Promise.reject(err)
  }
)

export default api

export const auth = {
  login: (email: string, password: string) => api.post('/api/auth/token/', { email, password }),
  register: (data: any) => api.post('/api/users/register/', data),
  me: () => api.get('/api/users/me/'),
}

export const cardsApi = {
  decks: () => api.get('/api/cards/decks/'),
  deckCards: (deckId: string) => api.get(`/api/cards/decks/${deckId}/cards/`),
  categories: () => api.get('/api/cards/categories/'),
}

export const progressApi = {
  summary: () => api.get('/api/progress/summary/'),
  review: (cardId: string, quality: number) => api.post('/api/progress/review/', { card_id: cardId, quality }),
}

export const quizApi = {
  random: (count = 10) => api.get(`/api/ai/random/?count=${count}`),
}

// Persistent cache using AsyncStorage — survives app restarts
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export async function cachedGet(url: string, forceRefresh = false) {
  const cacheKey = `cache_${url}`
  const now = Date.now()

  if (!forceRefresh) {
    try {
      const cached = await AsyncStorage.getItem(cacheKey)
      if (cached) {
        const { data, time } = JSON.parse(cached)
        if (now - time < CACHE_TTL) {
          return { data, fromCache: true }
        }
      }
    } catch {}
  }

  const res = await api.get(url)
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: res.data, time: now }))
  } catch {}
  return { data: res.data, fromCache: false }
}

export async function clearCache() {
  const keys = await AsyncStorage.getAllKeys()
  const cacheKeys = keys.filter(k => k.startsWith('cache_'))
  await AsyncStorage.multiRemove(cacheKeys)
}
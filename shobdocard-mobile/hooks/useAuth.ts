import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('access_token')
    setIsLoggedIn(!!token)
    setLoading(false)
  }

  const login = async (access: string, refresh: string) => {
    await AsyncStorage.setItem('access_token', access)
    await AsyncStorage.setItem('refresh_token', refresh)
    setIsLoggedIn(true)
  }

  const logout = async () => {
    await AsyncStorage.removeItem('access_token')
    await AsyncStorage.removeItem('refresh_token')
    setIsLoggedIn(false)
  }

  return { isLoggedIn, loading, login, logout }
}
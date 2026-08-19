import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import {
  getMe,
  login as loginService,
  logout as logoutService,
} from '../services/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      try {
        const response = await getMe()

        setUser(response.data)
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error('Erreur de restauration :', error)
        }

        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (email, password) => {
    const response = await loginService(email, password)

    const userData = response.data.user

    setUser(userData)

    return response
  }

  const logout = async () => {
    try {
      await logoutService()
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
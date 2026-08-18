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
      const token = localStorage.getItem('token')

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await getMe()

        setUser(response.data.data)
      } catch (error) {
        console.error('Erreur de restauration :', error)

        localStorage.removeItem('token')
        localStorage.removeItem('user')

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
    const token = response.data.token

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))

    setUser(userData)

    return response
  }

  const logout = () => {
    logoutService()

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setUser(null)
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
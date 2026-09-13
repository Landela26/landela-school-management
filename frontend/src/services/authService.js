

import api, { csrf } from './api'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'
const MOCK_SESSION_KEY = 'landela_mock_session'

const MOCK_USER = {
  id: 1,
  name: 'Admin Test',
  email: 'admin@landela.test',
  role: 'admin',
}

export async function login(email, password) {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    localStorage.setItem(MOCK_SESSION_KEY, 'true')
    // AuthProvider lit response.data.user
    return { data: { user: MOCK_USER } }
  }

  await csrf.get('/sanctum/csrf-cookie')

  const response = await api.post('/auth/login', {
    email,
    password,
  })

  return response.data
}

export async function getMe() {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 150))

    if (localStorage.getItem(MOCK_SESSION_KEY) === 'true') {
      // AuthProvider lit response.data directement (pas de clé "user" imbriquée ici)
      return { data: MOCK_USER }
    }

    // Simule un 401 pour que useAuth traite ça comme "non connecté"
    const error = new Error('Non authentifié')
    error.response = { status: 401 }
    throw error
  }

  const response = await api.get('/auth/me')

  return response.data
}

export async function logout() {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 150))
    localStorage.removeItem(MOCK_SESSION_KEY)
    return { message: 'Déconnecté (mock)' }
  }

  const response = await api.post('/auth/logout')

  return response.data
}
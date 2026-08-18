import api from './api'

export async function login(email, password) {
  const response = await api.post('/auth/login', {
    email,
    password,
  })

  return response.data
}

export async function getMe() {
  const response = await api.get('/auth/me')

  return response.data
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
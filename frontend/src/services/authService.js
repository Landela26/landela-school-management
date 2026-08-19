
import api, { csrf } from './api'

export async function login(email, password) {
  await csrf.get('/sanctum/csrf-cookie')

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

export async function logout() {
  const response = await api.post('/auth/logout')

  return response.data
}


// import axios from 'axios'

// const api = axios.create({
//   baseURL: 'http://localhost:8000/api',
//   withCredentials: true,
//   withXSRFToken: true,
//   headers: {
//     Accept: 'application/json',
//     'Content-Type': 'application/json',
//   },
// })

// export const csrf = axios.create({
//   baseURL:
//     import.meta.env.VITE_API_URL?.replace(/\/api$/, '') ||
//     'http://127.0.0.1:8000',
//   withCredentials: true,
// })

// export default api


import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export const csrf = axios.create({
  baseURL: API_URL.replace(/\/api$/, ''),
  withCredentials: true,
  withXSRFToken: true,
})

export default api
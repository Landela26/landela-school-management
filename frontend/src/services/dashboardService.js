import api from './api'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const MOCK_DASHBOARD = {
  success: true,
  message: 'Données du tableau de bord récupérées avec succès.',
  data: {
    indicateurs_generaux: {
      total_eleves: 120,
      total_personnel: 15,
      total_presences: 105,
    },
    pointage_du_jour: {
      presents: 95,
      retards: 10,
      absents: 15,
    },
    pointage_par_classe: [
      { classe: '6A', total_eleves: 42, pointes: 40 },
      { classe: '6B', total_eleves: 38, pointes: 35 },
      { classe: '6C', total_eleves: 41, pointes: 41 },
    ],
  },
}

export async function getDashboard({ signal } = {}) {
  if (USE_MOCKS) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => resolve(MOCK_DASHBOARD), 300)

      signal?.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        const error = new Error('Aborted')
        error.name = 'AbortError'
        reject(error)
      })
    })
  }

  const response = await api.get('/dashboard', { signal })
  return response.data
}
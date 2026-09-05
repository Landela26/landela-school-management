import api from './api'

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
    pointage_par_classe: [],
  },
}

export async function getDashboardMock() {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return MOCK_DASHBOARD
}

 export async function getDashboard() {
  const response = await api.get('/dashboard')
  return response.data
}
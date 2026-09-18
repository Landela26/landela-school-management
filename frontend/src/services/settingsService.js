import api from './api'

// Mock via VITE_USE_MOCKS tant que le backend F10 (GET/PUT /api/settings)
// n'est pas dans dev. Avec false, appelle la vraie API.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// Valeurs par défaut raisonnables si l'école n'a rien configuré (critère 3).
export const DEFAULT_SETTINGS = {
  seuil_retard: '08:00',        // heure au-delà de laquelle un pointage = retard
  delai_suppression_jours: 30,  // jours avant purge définitive d'un élève soft-deleted
}

// État mock en mémoire (simule la ligne unique des paramètres d'établissement).
let MOCK_SETTINGS = { ...DEFAULT_SETTINGS }

/**
 * Récupère les paramètres d'établissement.
 * Contrat : GET /api/settings
 * @returns {Promise<Object>} { success, data:{ seuil_retard, delai_suppression_jours } }
 */
export async function getSettings() {
  if (USE_MOCKS) {
    await delay(300)
    return { success: true, data: { ...MOCK_SETTINGS } }
  }
  const response = await api.get('/settings')
  return response.data
}

/**
 * Met à jour les paramètres d'établissement.
 * Contrat : PUT /api/settings  (JSON → PUT réel géré par Laravel, pas de spoofing)
 * @param {Object} payload - { seuil_retard, delai_suppression_jours }
 */
export async function updateSettings(payload) {
  if (USE_MOCKS) {
    await delay(400)
    MOCK_SETTINGS = {
      seuil_retard: payload.seuil_retard,
      delai_suppression_jours: Number(payload.delai_suppression_jours),
    }
    return { success: true, message: 'Paramètres enregistrés.', data: { ...MOCK_SETTINGS } }
  }
  const response = await api.put('/settings', payload)
  return response.data
}

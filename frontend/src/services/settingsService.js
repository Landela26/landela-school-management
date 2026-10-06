import api from './api'

// Mock via VITE_USE_MOCKS tant que le backend F10 (GET/PUT /api/settings)
// n'est pas dans dev. Avec false, appelle la vraie API.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// Valeurs par défaut si l'école n'a rien configuré (critère 3 du ticket F10).
export const DEFAULT_SETTINGS = {
  seuil_retard: '08:00',        // heure au-delà de laquelle un pointage = retard
  delai_suppression_jours: 30,  // jours avant purge définitive d'un élève soft-deleted
}

let MOCK_SETTINGS = { ...DEFAULT_SETTINGS }

// Endpoint absent côté serveur (404) : message clair, jamais de fausse sauvegarde.
function unavailable(err) {
  if (err.response?.status === 404) {
    return new Error('Le service des paramètres n’est pas encore disponible sur le serveur.')
  }
  return err
}

// Contrat back F10 : late_after (HH:MM), student_deletion_delay_days (entier ≥ 1).
const fromApi = (data = {}) => ({
  seuil_retard: data.late_after ?? DEFAULT_SETTINGS.seuil_retard,
  delai_suppression_jours: data.student_deletion_delay_days ?? DEFAULT_SETTINGS.delai_suppression_jours,
})
const toApi = (payload) => ({
  late_after: payload.seuil_retard,
  student_deletion_delay_days: Number(payload.delai_suppression_jours),
})

/**
 * Récupère les paramètres d'établissement (réservé aux administrateurs).
 * GET /api/settings → { success, data:{ late_after, student_deletion_delay_days } }
 */
export async function getSettings() {
  if (USE_MOCKS) {
    await delay(300)
    return { success: true, data: { ...MOCK_SETTINGS } }
  }
  try {
    const { data } = await api.get('/settings')
    return { ...data, data: fromApi(data?.data) }
  } catch (err) {
    throw unavailable(err)
  }
}

/**
 * Met à jour les paramètres d'établissement (réservé aux administrateurs).
 * PUT /api/settings (JSON) { late_after, student_deletion_delay_days }
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
  try {
    const { data } = await api.put('/settings', toApi(payload))
    return { ...data, data: fromApi(data?.data) }
  } catch (err) {
    throw unavailable(err)
  }
}

import api from './api'

/**
 * Liste paginée des élèves.
 * @param {Object} params - page, per_page, nom, sexe, statut, …
 * @returns {Promise<Object>} { success, message, data:[...], pagination:{...} }
 */
export async function getStudents(params = {}) {
  const response = await api.get('/students', { params })
  return response.data
}

/** Crée un élève (FormData multipart pour la photo). */
export async function createStudent(formData) {
  const response = await api.post('/students', formData)
  return response.data
}

/** Récupère un élève par id (préremplissage du formulaire d'édition). */
export async function getStudent(id) {
  const response = await api.get(`/students/${id}`)
  return response.data
}

/**
 * Met à jour un élève.
 * POST + `_method=PUT` (ajouté par l'appelant) : PHP ne parse pas le corps
 * multipart/form-data d'une vraie requête PUT.
 */
export async function updateStudent(id, formData) {
  const response = await api.post(`/students/${id}`, formData)
  return response.data
}

// --- F12 : suppression (soft delete) et réintégration ---------------------

/**
 * Endpoint F12 pas encore déployé → message clair (sans `response` attachée,
 * l'écran l'affiche à la place du message technique de Laravel).
 * - 405 : la méthode n'existe pas sur la route.
 * - 404 sans clé `success` : la route n'existe pas (un vrai « élève introuvable »
 *   renvoyé par le contrôleur porte `success: false` et reste affiché tel quel).
 * - `isList` : la liste ne renvoie jamais 404 légitimement (aujourd'hui,
 *   /students/deleted est capturé par /students/{id}).
 */
function f12Error(err, isList = false) {
  const status = err.response?.status
  const data = err.response?.data || {}
  const routeMissing = status === 405 || (status === 404 && (isList || !('success' in data)))
  if (routeMissing) {
    return new Error('La suppression des élèves n’est pas encore disponible sur le serveur.')
  }
  return err
}

/** Retire un élève de la liste active (soft delete). DELETE /students/{id} */
export async function deleteStudent(id) {
  try {
    const response = await api.delete(`/students/${id}`)
    return response.data
  } catch (err) {
    throw f12Error(err)
  }
}

/**
 * Élèves supprimés encore réintégrables. GET /students/deleted
 * Chaque élève porte `deleted_at` (date de suppression).
 */
export async function getDeletedStudents() {
  try {
    const response = await api.get('/students/deleted')
    return response.data
  } catch (err) {
    throw f12Error(err, true)
  }
}

/** Réintègre un élève supprimé dans la liste active. POST /students/{id}/restore */
export async function restoreStudent(id) {
  try {
    const response = await api.post(`/students/${id}/restore`)
    return response.data
  } catch (err) {
    throw f12Error(err)
  }
}

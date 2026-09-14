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

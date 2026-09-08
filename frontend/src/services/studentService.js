import api from './api';

/**
 * Crée un nouvel élève.
 *
 * @param {FormData} formData - Données du formulaire (multipart pour la photo).
 * @returns {Promise<Object>} Réponse de l'API.
 */
export async function createStudent(formData) {
  const response = await api.post('/students', formData);
  return response.data;
}

/**
 * Récupère un élève par son identifiant (pour préremplir le formulaire).
 *
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export async function getStudent(id) {
  const response = await api.get(`/students/${id}`);
  return response.data;
}

/**
 * Met à jour un élève.
 *
 * On envoie un POST avec `_method=PUT` (method spoofing, ajouté par l'appelant)
 * car PHP ne parse pas le corps multipart/form-data d'une vraie requête PUT.
 *
 * @param {number|string} id
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export async function updateStudent(id, formData) {
  const response = await api.post(`/students/${id}`, formData);
  return response.data;
}

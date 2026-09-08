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

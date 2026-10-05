import api from './api'

// Même convention que dashboardService : mock tant que le backend F14 n'est pas
// dans dev. Passer VITE_USE_MOCKS=true en local pour travailler sur les mocks ;
// avec false, les appels partent vers la vraie API (GET/POST/PUT/DELETE /classes).
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// --- Données mock (en mémoire, mutables pour simuler le CRUD) ---
const MOCK_ENSEIGNANTS = [
  { id_personnel: 1, nom: 'Mwamba', prenom: 'Grâce' },
  { id_personnel: 2, nom: 'Kabeya', prenom: 'Patrick' },
  { id_personnel: 3, nom: 'Ilunga', prenom: 'Nadine' },
]

let MOCK_CLASSES = [
  { id_classe: 1, code_classe: '6A-2025', nom_classe: '6ème A', niveau: '6ème', annee_scolaire: '2025-2026', id_enseignant: 1, statut: 'active' },
  { id_classe: 2, code_classe: '6B-2025', nom_classe: '6ème B', niveau: '6ème', annee_scolaire: '2025-2026', id_enseignant: 2, statut: 'active' },
  { id_classe: 3, code_classe: '5A-2025', nom_classe: '5ème A', niveau: '5ème', annee_scolaire: '2025-2026', id_enseignant: 3, statut: 'active' },
]

const withEnseignant = (c) => ({
  ...c,
  enseignant: MOCK_ENSEIGNANTS.find((e) => e.id_personnel === Number(c.id_enseignant)) || null,
})

/** Liste des classes. → { success, message, data:[...] } */
export async function getClasses(params = {}) {
  if (USE_MOCKS) {
    await delay(300)
    return { success: true, message: 'Liste des classes récupérée.', data: MOCK_CLASSES.map(withEnseignant) }
  }
  const res = await api.get('/classes', { params })
  return res.data
}

/** Liste des enseignants (pour le sélecteur du formulaire). */
export async function getEnseignants() {
  if (USE_MOCKS) {
    await delay(200)
    return { success: true, data: MOCK_ENSEIGNANTS }
  }
  // À ajuster selon l'endpoint réel fourni par le back (ex. /personnels?role=enseignant)
  const res = await api.get('/personnels', { params: { role: 'enseignant' } })
  return res.data
}

/** Crée une classe. */
export async function createClasse(payload) {
  if (USE_MOCKS) {
    await delay(400)
    const created = { id_classe: Date.now(), statut: 'active', ...payload, id_enseignant: Number(payload.id_enseignant) }
    MOCK_CLASSES = [created, ...MOCK_CLASSES]
    return { success: true, message: 'Classe créée avec succès.', data: withEnseignant(created) }
  }
  const res = await api.post('/classes', payload)
  return res.data
}

/** Met à jour une classe. */
export async function updateClasse(id, payload) {
  if (USE_MOCKS) {
    await delay(400)
    MOCK_CLASSES = MOCK_CLASSES.map((c) =>
      c.id_classe === id ? { ...c, ...payload, id_enseignant: Number(payload.id_enseignant) } : c,
    )
    return { success: true, message: 'Classe modifiée avec succès.', data: withEnseignant(MOCK_CLASSES.find((c) => c.id_classe === id)) }
  }
  const res = await api.put(`/classes/${id}`, payload)
  return res.data
}

/** Supprime (soft delete côté back) une classe. */
export async function deleteClasse(id) {
  if (USE_MOCKS) {
    await delay(400)
    MOCK_CLASSES = MOCK_CLASSES.filter((c) => c.id_classe !== id)
    return { success: true, message: 'Classe supprimée.' }
  }
  const res = await api.delete(`/classes/${id}`)
  return res.data
}

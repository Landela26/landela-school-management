import api from './api'

// Mock via VITE_USE_MOCKS tant que le backend F08 (POST/GET /api/attendances)
// n'est pas dans dev. Avec false, appelle la vraie API.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// Historique mock (snapshot figé nom + classe, comme exigé par le contrat).
const MOCK_ATTENDANCES = [
  { id_presence: 1, nom_eleve_snapshot: 'Bondo Kisinza Josué', classe_snapshot: '6ème A', statut_presence: 'present', date_heure: '2026-09-17T07:52:00', source_pointage: 'nfc' },
  { id_presence: 2, nom_eleve_snapshot: 'Mukendi Ilunga Grace', classe_snapshot: '6ème A', statut_presence: 'retard', date_heure: '2026-09-17T08:21:00', source_pointage: 'nfc' },
  { id_presence: 3, nom_eleve_snapshot: 'Kabila Tshala Jean', classe_snapshot: '6ème B', statut_presence: 'absent', date_heure: '2026-09-17T09:05:00', source_pointage: 'manuel' },
  { id_presence: 4, nom_eleve_snapshot: 'Nkulu Mwamba Sarah', classe_snapshot: '5ème A', statut_presence: 'present', date_heure: '2026-09-17T07:48:00', source_pointage: 'nfc' },
  { id_presence: 5, nom_eleve_snapshot: 'Kasongo Beya Paul', classe_snapshot: '6ème B', statut_presence: 'present', date_heure: '2026-09-17T07:59:00', source_pointage: 'manuel' },
  { id_presence: 6, nom_eleve_snapshot: 'Tshimanga Lea', classe_snapshot: '5ème A', statut_presence: 'retard', date_heure: '2026-09-17T08:34:00', source_pointage: 'nfc' },
  { id_presence: 7, nom_eleve_snapshot: 'Bondo Kisinza Josué', classe_snapshot: '6ème A', statut_presence: 'present', date_heure: '2026-09-16T07:55:00', source_pointage: 'nfc' },
  { id_presence: 8, nom_eleve_snapshot: 'Kabila Tshala Jean', classe_snapshot: '6ème B', statut_presence: 'present', date_heure: '2026-09-16T07:50:00', source_pointage: 'nfc' },
  { id_presence: 9, nom_eleve_snapshot: 'Nkulu Mwamba Sarah', classe_snapshot: '5ème A', statut_presence: 'absent', date_heure: '2026-09-16T09:10:00', source_pointage: 'manuel' },
  { id_presence: 10, nom_eleve_snapshot: 'Mukendi Ilunga Grace', classe_snapshot: '6ème A', statut_presence: 'present', date_heure: '2026-09-16T07:47:00', source_pointage: 'nfc' },
  { id_presence: 11, nom_eleve_snapshot: 'Kasongo Beya Paul', classe_snapshot: '6ème B', statut_presence: 'retard', date_heure: '2026-09-16T08:15:00', source_pointage: 'nfc' },
  { id_presence: 12, nom_eleve_snapshot: 'Tshimanga Lea', classe_snapshot: '5ème A', statut_presence: 'present', date_heure: '2026-09-15T07:58:00', source_pointage: 'nfc' },
]

// Roster mock : élèves par classe (pour l'écran de pointage manuel).
const MOCK_ROSTER = {
  '6ème A': [
    { id_eleve: 1, nom: 'Bondo', postnom: 'Kisinza', prenom: 'Josué' },
    { id_eleve: 2, nom: 'Mukendi', postnom: 'Ilunga', prenom: 'Grace' },
    { id_eleve: 3, nom: 'Ngoy', postnom: 'Kalala', prenom: 'David' },
  ],
  '6ème B': [
    { id_eleve: 4, nom: 'Kabila', postnom: 'Tshala', prenom: 'Jean' },
    { id_eleve: 5, nom: 'Kasongo', postnom: 'Beya', prenom: 'Paul' },
  ],
  '5ème A': [
    { id_eleve: 6, nom: 'Nkulu', postnom: 'Mwamba', prenom: 'Sarah' },
    { id_eleve: 7, nom: 'Tshimanga', postnom: '', prenom: 'Lea' },
    { id_eleve: 8, nom: 'Mbayo', postnom: 'Kabongo', prenom: 'Chris' },
  ],
}

const fullName = (e) => [e.nom, e.postnom, e.prenom].filter(Boolean).join(' ')

/**
 * Élèves d'une classe pour le pointage, avec le statut déjà pointé ce jour (le cas échéant).
 * @param {Object} params - { classe, date }
 */
export async function getRoster({ classe, date } = {}) {
  if (USE_MOCKS) {
    await delay(300)
    const eleves = MOCK_ROSTER[classe] || []
    const data = eleves.map((e) => {
      const deja = MOCK_ATTENDANCES.find(
        (a) => a.nom_eleve_snapshot === fullName(e) && a.classe_snapshot === classe && a.date_heure.slice(0, 10) === date,
      )
      return { ...e, statut_actuel: deja?.statut_presence || null }
    })
    return { success: true, data }
  }
  // À ajuster selon l'endpoint réel (ex. GET /api/students?classe=... + statut du jour)
  const response = await api.get('/students', { params: { classe, per_page: 200 } })
  return response.data
}

/**
 * Enregistre un pointage. Le back remplit le snapshot (nom/classe) ; ici on le
 * fournit pour le mock. Doublon (déjà pointé ce jour) → erreur 409 simulée.
 */
export async function createAttendance(payload) {
  if (USE_MOCKS) {
    await delay(350)
    const deja = MOCK_ATTENDANCES.find(
      (a) => a.nom_eleve_snapshot === payload.nom_eleve_snapshot && a.classe_snapshot === payload.classe_snapshot && a.date_heure.slice(0, 10) === payload.date,
    )
    if (deja) {
      const err = new Error('Déjà pointé')
      err.response = { status: 409, data: { success: false, message: 'Cet élève a déjà été pointé aujourd’hui.' } }
      throw err
    }
    const rec = {
      id_presence: Date.now(),
      nom_eleve_snapshot: payload.nom_eleve_snapshot,
      classe_snapshot: payload.classe_snapshot,
      statut_presence: payload.statut,
      date_heure: `${payload.date}T${new Date().toTimeString().slice(0, 8)}`,
      source_pointage: 'manuel',
    }
    MOCK_ATTENDANCES.push(rec)
    return { success: true, message: 'Pointage enregistré.', data: rec }
  }
  const response = await api.post('/attendances', payload)
  return response.data
}

/**
 * Historique paginé des pointages.
 * @param {Object} params - { date, classe, statut, page, per_page }
 * @returns {Promise<Object>} { success, message, data:[...], pagination:{...} }
 */
export async function getAttendances(params = {}) {
  if (USE_MOCKS) {
    await delay(350)
    const perPage = Number(params.per_page) || 10
    const page = Number(params.page) || 1

    let rows = [...MOCK_ATTENDANCES]
    if (params.date) rows = rows.filter((r) => r.date_heure.slice(0, 10) === params.date)
    if (params.classe) rows = rows.filter((r) => r.classe_snapshot === params.classe)
    if (params.statut) rows = rows.filter((r) => r.statut_presence === params.statut)
    rows.sort((a, b) => new Date(b.date_heure) - new Date(a.date_heure))

    const total = rows.length
    const derniere = Math.max(1, Math.ceil(total / perPage))
    const courante = Math.min(page, derniere)
    const slice = rows.slice((courante - 1) * perPage, courante * perPage)

    return {
      success: true,
      message: 'Historique des pointages récupéré.',
      data: slice,
      pagination: {
        page_courante: courante,
        derniere_page: derniere,
        par_page: perPage,
        total,
        de: total ? (courante - 1) * perPage + 1 : 0,
        a: (courante - 1) * perPage + slice.length,
      },
    }
  }
  const response = await api.get('/attendances', { params })
  return response.data
}

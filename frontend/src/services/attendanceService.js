import api from './api'

// Mock via VITE_USE_MOCKS tant que le backend F09 (GET /api/attendances)
// n'est pas dans dev. Avec false, appelle la vraie API.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// Historique mock. Le back renvoie un snapshot figé du nom + de la classe
// (nom_eleve_snapshot / classe_snapshot) ; id_classe sert au filtre class_id.
const MOCK_ATTENDANCES = [
  { id_presence: 1, id_classe: 1, nom_eleve_snapshot: 'Bondo Kisinza Josué', classe_snapshot: '6ème A', statut_presence: 'present', date_heure: '2026-09-17T07:52:00', source_pointage: 'nfc' },
  { id_presence: 2, id_classe: 1, nom_eleve_snapshot: 'Mukendi Ilunga Grace', classe_snapshot: '6ème A', statut_presence: 'retard', date_heure: '2026-09-17T08:21:00', source_pointage: 'nfc' },
  { id_presence: 3, id_classe: 2, nom_eleve_snapshot: 'Kabila Tshala Jean', classe_snapshot: '6ème B', statut_presence: 'absent', date_heure: '2026-09-17T09:05:00', source_pointage: 'manuel' },
  { id_presence: 4, id_classe: 3, nom_eleve_snapshot: 'Nkulu Mwamba Sarah', classe_snapshot: '5ème A', statut_presence: 'present', date_heure: '2026-09-17T07:48:00', source_pointage: 'nfc' },
  { id_presence: 5, id_classe: 2, nom_eleve_snapshot: 'Kasongo Beya Paul', classe_snapshot: '6ème B', statut_presence: 'present', date_heure: '2026-09-17T07:59:00', source_pointage: 'manuel' },
  { id_presence: 6, id_classe: 3, nom_eleve_snapshot: 'Tshimanga Lea', classe_snapshot: '5ème A', statut_presence: 'retard', date_heure: '2026-09-17T08:34:00', source_pointage: 'nfc' },
  { id_presence: 7, id_classe: 1, nom_eleve_snapshot: 'Bondo Kisinza Josué', classe_snapshot: '6ème A', statut_presence: 'present', date_heure: '2026-09-16T07:55:00', source_pointage: 'nfc' },
  { id_presence: 8, id_classe: 2, nom_eleve_snapshot: 'Kabila Tshala Jean', classe_snapshot: '6ème B', statut_presence: 'present', date_heure: '2026-09-16T07:50:00', source_pointage: 'nfc' },
  { id_presence: 9, id_classe: 3, nom_eleve_snapshot: 'Nkulu Mwamba Sarah', classe_snapshot: '5ème A', statut_presence: 'absent', date_heure: '2026-09-16T09:10:00', source_pointage: 'manuel' },
  { id_presence: 10, id_classe: 1, nom_eleve_snapshot: 'Mukendi Ilunga Grace', classe_snapshot: '6ème A', statut_presence: 'present', date_heure: '2026-09-16T07:47:00', source_pointage: 'nfc' },
  { id_presence: 11, id_classe: 2, nom_eleve_snapshot: 'Kasongo Beya Paul', classe_snapshot: '6ème B', statut_presence: 'retard', date_heure: '2026-09-16T08:15:00', source_pointage: 'nfc' },
  { id_presence: 12, id_classe: 3, nom_eleve_snapshot: 'Tshimanga Lea', classe_snapshot: '5ème A', statut_presence: 'present', date_heure: '2026-09-15T07:58:00', source_pointage: 'nfc' },
]

/**
 * Historique paginé des pointages, filtrable.
 * Contrat : GET /api/attendances?date=&class_id=&statut=
 * @param {Object} params - { date, class_id, statut, page, per_page }
 * @returns {Promise<Object>} { success, message, data:[...], pagination:{...} }
 */
export async function getAttendances(params = {}) {
  if (USE_MOCKS) {
    await delay(350)
    const perPage = Number(params.per_page) || 10
    const page = Number(params.page) || 1

    let rows = [...MOCK_ATTENDANCES]
    if (params.date) rows = rows.filter((r) => r.date_heure.slice(0, 10) === params.date)
    if (params.class_id) rows = rows.filter((r) => String(r.id_classe) === String(params.class_id))
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

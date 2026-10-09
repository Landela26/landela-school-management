// Contraintes métier sur la date de naissance d'un élève.
// L'école accepte les enfants à partir de la maternelle (4 ans).
export const MIN_AGE = 4

const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Date de naissance maximale autorisée (aujourd'hui - MIN_AGE ans), pour l'attribut `max` de l'input. */
export function maxBirthDate() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - MIN_AGE)
  return toISO(d)
}

/** Âge (en années révolues) à partir d'une date ISO (yyyy-mm-dd). */
export function computeAge(isoDate) {
  if (!isoDate) return null
  const birth = new Date(isoDate)
  if (Number.isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1
  return age
}

/**
 * Valide la date de naissance d'un élève.
 * @returns {string|null} message d'erreur, ou null si valide.
 */
export function validateBirthDate(isoDate) {
  if (!isoDate) return 'La date de naissance est obligatoire.'
  const birth = new Date(isoDate)
  if (Number.isNaN(birth.getTime())) return 'Date de naissance invalide.'
  const now = new Date()
  if (birth > now) return 'La date de naissance ne peut pas être dans le futur.'
  const age = computeAge(isoDate)
  if (age === null) return 'Date de naissance invalide.'
  if (age < MIN_AGE) return `L'élève doit avoir au moins ${MIN_AGE} ans.`
  if (age > 100) return 'Date de naissance invalide.'
  return null
}

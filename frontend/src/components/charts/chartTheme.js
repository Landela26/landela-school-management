// Thème partagé des graphiques ApexCharts (tableau de bord + page Classes).
//
// Statuts dans un ordre FIXE : la couleur suit le statut, jamais le rang.
// Teintes = pastilles déjà utilisées dans l'app. Palette validée avec
// dataviz/scripts/validate_palette.js (surface #ffffff) : CVD ΔE 8.9 (≥ 8),
// vision normale ΔE 21.6. Vert/ambre < 3:1 sur blanc → valeurs écrites
// (tuiles, légendes chiffrées) + vue tableau, comme l'exige la règle.
export const STATUTS = [
  { key: 'present', label: 'Présents', color: '#10b981' },
  { key: 'retard', label: 'Retards', color: '#f59e0b' },
  { key: 'absent', label: 'Absents', color: '#f43f5e' },
  { key: 'non_pointe', label: 'Non pointés', color: '#e2e8f0' },
]

export const BRAND = '#0b2b4a' // navy de l'app (taux de présence)

// Encres : le texte ne prend jamais la couleur d'une série.
export const INK = {
  primary: '#0f172a',
  secondary: '#475569',
  muted: '#94a3b8',
  grid: '#eef2f6',
  axis: '#e2e8f0',
}

const pad = (n) => String(n).padStart(2, '0')

/** Date locale yyyy-mm-dd (évite le décalage UTC autour de minuit). */
export const toLocalISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const localToday = () => toLocalISO(new Date())

export const isSchoolDay = (d) => d.getDay() !== 0 && d.getDay() !== 6

/** Les `count` derniers jours de classe (lun–ven), du plus ancien au plus récent. */
export function lastSchoolDays(count, from = new Date()) {
  const days = []
  const d = new Date(from)
  d.setHours(12, 0, 0, 0)
  while (days.length < count) {
    if (isSchoolDay(d)) days.unshift(new Date(d))
    d.setDate(d.getDate() - 1)
  }
  return days
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Options communes : police de l'app, pas de barre d'outils, animation courte (Emil : < 300 ms). */
export function baseChart(extra = {}) {
  const reduced = prefersReducedMotion()
  return {
    fontFamily: 'inherit',
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: {
      enabled: !reduced,
      speed: 240,
      animateGradually: { enabled: false },
      dynamicAnimation: { enabled: !reduced, speed: 200 },
    },
    ...extra,
  }
}

export const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`

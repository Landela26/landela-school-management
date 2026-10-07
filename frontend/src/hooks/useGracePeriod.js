import { useEffect, useState } from 'react'

import { getSettings } from '../services/settingsService'

/**
 * Période de grâce (en jours) avant suppression définitive d'un élève,
 * définie dans les Paramètres (F10). `null` si elle n'est pas disponible :
 * l'interface n'affiche alors aucune durée plutôt qu'une valeur supposée.
 */
export default function useGracePeriod() {
  const [days, setDays] = useState(null)

  useEffect(() => {
    let active = true
    getSettings()
      .then((res) => {
        const n = Number(res?.data?.delai_suppression_jours)
        if (active && Number.isInteger(n) && n > 0) setDays(n)
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return days
}

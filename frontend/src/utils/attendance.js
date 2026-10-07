/**
 * Clé d'un élève sur une ligne de pointage. Après une purge (F13), la fiche
 * élève n'existe plus et `id_eleve` vaut null : on se rabat sur le snapshot
 * (nom + classe figés au moment du pointage, F08) pour ne pas perdre la ligne.
 */
export function studentKey(row) {
  const id = row.id_eleve ?? row.eleve_id
  if (id != null) return `id:${id}`
  return `snap:${row.nom_eleve_snapshot || ''}|${row.classe_snapshot || ''}`
}

/** Un seul pointage par élève (le plus récent) parmi les lignes d'une journée. */
export function latestPerStudent(rows) {
  const latest = new Map()
  rows.forEach((a) => {
    const key = studentKey(a)
    const prev = latest.get(key)
    if (!prev || new Date(a.date_heure) > new Date(prev.date_heure)) latest.set(key, a)
  })
  return [...latest.values()]
}

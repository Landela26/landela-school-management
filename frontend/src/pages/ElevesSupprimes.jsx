import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArchiveRestore, Loader2, Trash2 } from 'lucide-react'

import SuccessBanner from '../components/ui/SuccessBanner'
import useGracePeriod from '../hooks/useGracePeriod'
import { getClasses } from '../services/classeService'
import { getDeletedStudents, restoreStudent } from '../services/studentService'

const DAY = 24 * 60 * 60 * 1000
const fmtDate = (d) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fullName = (e) => [e.nom, e.postnom, e.prenom].filter(Boolean).join(' ')
const initials = (e) => ((e.nom?.[0] || '') + (e.prenom?.[0] || '')).toUpperCase() || '?'

/** Échéance de suppression définitive : date de suppression + période de grâce. */
function echeance(deletedAt, graceDays) {
  if (!graceDays || !deletedAt) return null
  const d = new Date(deletedAt)
  if (Number.isNaN(d.getTime())) return null
  const fin = new Date(d.getTime() + graceDays * DAY)
  const restant = Math.ceil((fin.getTime() - Date.now()) / DAY)
  return { fin, restant }
}

export default function ElevesSupprimes() {
  const navigate = useNavigate()
  const graceDays = useGracePeriod()

  const [eleves, setEleves] = useState([])
  const [classesById, setClassesById] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [restoring, setRestoring] = useState(null) // id en cours de réintégration
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState(null) // { message, id }

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [res, cls] = await Promise.all([
        getDeletedStudents(),
        getClasses().then((r) => r?.data || []).catch(() => []),
      ])
      const list = Array.isArray(res?.data) ? res.data : res?.data?.data || []
      list.sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at))
      setEleves(list)
      setClassesById(Object.fromEntries(cls.map((c) => [String(c.id_classe), c.nom_classe])))
    } catch (err) {
      console.error('Erreur élèves supprimés :', err)
      setError(err.response?.data?.message || err.message || 'Impossible de charger les élèves supprimés.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const nomClasse = (e) => e.classe?.nom_classe || classesById[String(e.classe_id)] || null

  const handleRestore = async (e) => {
    setRestoring(e.id_eleve); setActionError(''); setSuccess(null)
    try {
      await restoreStudent(e.id_eleve)
      setEleves((list) => list.filter((x) => x.id_eleve !== e.id_eleve)) // retrait immédiat
      const classe = nomClasse(e)
      setSuccess({
        id: e.id_eleve,
        message: `${fullName(e)} a été réintégré${classe ? ` dans la classe ${classe}` : ''}.`,
      })
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'La réintégration a échoué.')
    } finally {
      setRestoring(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-8">
      <button type="button" onClick={() => navigate('/eleves')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800">
        <ArrowLeft size={16} />Toutes les classes
      </button>

      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Gestion des élèves</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Élèves supprimés</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          {graceDays
            ? `Un élève supprimé peut être réintégré pendant ${graceDays} jours. Passé ce délai, la suppression est définitive.`
            : 'Un élève supprimé peut être réintégré pendant la période définie dans les Paramètres.'}
        </p>
      </div>

      <SuccessBanner message={success?.message} onClose={() => setSuccess(null)}
        action={success ? { label: 'Voir la fiche', onClick: () => navigate(`/eleves/eleve/${success.id}`) } : null} />

      {actionError && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />{actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <AlertCircle className="mb-4 h-11 w-11 text-rose-500" />
            <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">{error}</p>
            <button onClick={load} className="rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark">Réessayer</button>
          </div>
        ) : loading ? (
          <div className="divide-y divide-slate-100" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
                <div className="ml-auto h-9 w-28 animate-pulse rounded-md bg-slate-100" />
              </div>
            ))}
          </div>
        ) : eleves.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Trash2 size={24} strokeWidth={1.6} /></div>
            <h2 className="mb-1 text-base font-semibold text-slate-900">Aucun élève supprimé</h2>
            <p className="max-w-sm text-sm leading-6 text-slate-500">Les élèves retirés de la liste apparaissent ici tant qu'ils peuvent être réintégrés.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {eleves.map((e) => {
              const ech = echeance(e.deleted_at, graceDays)
              const classe = nomClasse(e)
              const busy = restoring === e.id_eleve
              return (
                <li key={e.id_eleve} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">{initials(e)}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{fullName(e)}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {classe ? `${classe} · ` : ''}Supprimé le {e.deleted_at ? fmtDate(new Date(e.deleted_at)) : '—'}
                        {ech && (
                          <span className={ech.restant <= 3 ? 'font-medium text-rose-600' : ''}>
                            {' · '}{ech.restant > 0
                              ? `suppression définitive le ${fmtDate(ech.fin)} (dans ${ech.restant} jour${ech.restant > 1 ? 's' : ''})`
                              : 'suppression définitive imminente'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleRestore(e)} disabled={restoring !== null}
                    className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-navy transition hover:border-navy hover:bg-navy/5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto">
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <ArchiveRestore size={15} />}
                    {busy ? 'Réintégration…' : 'Réintégrer'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

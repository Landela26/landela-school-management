import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ChevronRight, Plus, Search, Users } from 'lucide-react'

import SuccessBanner from '../components/ui/SuccessBanner'
import { getClasses } from '../services/classeService'
import { getStudents } from '../services/studentService'
import { computeAge } from '../utils/studentValidation'

const initials = (e) => ((e.nom?.[0] || '') + (e.prenom?.[0] || '')).toUpperCase() || '?'

export default function ClasseEleves() {
  const navigate = useNavigate()
  const location = useLocation()
  const { classeId } = useParams()

  // Message transmis après une action (ex. suppression d'un élève), affiché une seule fois.
  const [flash, setFlash] = useState(location.state?.flash || '')
  useEffect(() => {
    if (location.state?.flash) navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [classe, setClasse] = useState(null)
  const [eleves, setEleves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [clsRes, stuRes] = await Promise.all([
        getClasses(),
        getStudents({ per_page: 1000 }),
      ])
      const cls = (clsRes?.data || []).find((c) => String(c.id_classe) === String(classeId)) || null
      const mine = (stuRes?.data || []).filter(
        (s) => String(s.classe_id ?? s.classe?.id_classe) === String(classeId),
      )
      setClasse(cls)
      setEleves(mine)
    } catch (err) {
      console.error('Erreur chargement élèves de la classe :', err)
      setError(err.response?.data?.message || 'Impossible de charger les élèves de la classe.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() /* eslint-disable-next-line */ }, [classeId])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return eleves
    return eleves.filter((e) => [e.nom, e.postnom, e.prenom].filter(Boolean).join(' ').toLowerCase().includes(term))
  }, [eleves, q])

  const classeNom = classe?.nom_classe || 'Classe'

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-8">
      {/* En-tête */}
      <div className="mb-6">
        <button type="button" onClick={() => navigate('/eleves')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800">
          <ArrowLeft size={16} />Toutes les classes
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Classe</p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{classeNom}</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {[classe?.niveau, classe?.annee_scolaire].filter(Boolean).join(' • ')}
              {classe ? ` • ${eleves.length} élève${eleves.length > 1 ? 's' : ''}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => navigate(`/eleves/nouveau?classe_id=${classeId}`)}
              className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark active:scale-[0.98]">
              <Plus size={16} />Ajouter un élève
            </button>
          </div>
        </div>
      </div>

      <SuccessBanner message={flash} onClose={() => setFlash('')}
        action={{ label: 'Voir les élèves supprimés', onClick: () => navigate('/eleves/supprimes') }} />

      {/* Recherche */}
      {!loading && !error && eleves.length > 0 && (
        <div className="mb-4 relative max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un élève…"
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10" />
        </div>
      )}

      {/* Carte liste */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <AlertCircle className="mb-4 h-11 w-11 text-rose-500" />
            <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">{error}</p>
            <button onClick={load} className="rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark">Réessayer</button>
          </div>
        ) : loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Users size={26} strokeWidth={1.6} /></div>
            <h2 className="mb-1 text-base font-semibold text-slate-900">{eleves.length === 0 ? 'Aucun élève dans cette classe' : 'Aucun résultat'}</h2>
            <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">
              {eleves.length === 0 ? 'Ajoutez le premier élève de cette classe.' : 'Aucun élève ne correspond à votre recherche.'}
            </p>
            {eleves.length === 0 && (
              <button onClick={() => navigate(`/eleves/nouveau?classe_id=${classeId}`)} className="rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark">Ajouter un élève</button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((e) => {
              const age = computeAge(e.date_naissance ? new Date(e.date_naissance).toISOString().slice(0, 10) : null)
              return (
                <li key={e.id_eleve}>
                  <button type="button" onClick={() => navigate(`/eleves/eleve/${e.id_eleve}`)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-semibold text-navy">{initials(e)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{e.nom} {e.postnom} {e.prenom}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {e.sexe === 'M' ? 'Masculin' : e.sexe === 'F' ? 'Féminin' : '—'}{age != null ? ` • ${age} ans` : ''}
                      </p>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-slate-300" />
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

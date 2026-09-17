import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Clock, History, Loader2, Users, XCircle } from 'lucide-react'

import { getClasses } from '../services/classeService'
import { getRoster, createAttendance } from '../services/attendanceService'

const today = () => new Date().toISOString().slice(0, 10)
const fullName = (e) => [e.nom, e.postnom, e.prenom].filter(Boolean).join(' ')
const initials = (e) => ((e.nom?.[0] || '') + (e.prenom?.[0] || '')).toUpperCase() || '?'

const STATUTS = [
  { value: 'present', label: 'Présent', icon: CheckCircle2, on: 'bg-emerald-600 text-white border-emerald-600', off: 'text-emerald-700 hover:bg-emerald-50 border-slate-200' },
  { value: 'retard', label: 'Retard', icon: Clock, on: 'bg-amber-500 text-white border-amber-500', off: 'text-amber-700 hover:bg-amber-50 border-slate-200' },
  { value: 'absent', label: 'Absent', icon: XCircle, on: 'bg-rose-600 text-white border-rose-600', off: 'text-rose-700 hover:bg-rose-50 border-slate-200' },
]

export default function PointagePage() {
  const navigate = useNavigate()

  const [classesList, setClassesList] = useState([])
  const [classe, setClasse] = useState('')
  const [date, setDate] = useState(today())

  const [roster, setRoster] = useState([])
  const [loadingRoster, setLoadingRoster] = useState(false)
  const [rosterError, setRosterError] = useState('')
  // état par élève : { statut, status: 'idle'|'saving'|'saved'|'locked'|'error', error }
  const [rows, setRows] = useState({})

  useEffect(() => {
    getClasses().then((r) => setClassesList(r?.data || [])).catch(() => setClassesList([]))
  }, [])

  const loadRoster = useCallback(async () => {
    if (!classe) { setRoster([]); setRows({}); return }
    setLoadingRoster(true); setRosterError('')
    try {
      const res = await getRoster({ classe, date })
      const eleves = res?.data || []
      setRoster(eleves)
      const initial = {}
      eleves.forEach((e) => {
        initial[e.id_eleve] = e.statut_actuel
          ? { statut: e.statut_actuel, status: 'locked' }
          : { statut: null, status: 'idle' }
      })
      setRows(initial)
    } catch (err) {
      console.error('Erreur roster :', err)
      setRosterError(err.response?.data?.message || err.message || 'Impossible de charger la liste des élèves.')
      setRoster([])
    } finally {
      setLoadingRoster(false)
    }
  }, [classe, date])

  useEffect(() => { loadRoster() }, [loadRoster])

  const mark = async (eleve, statut) => {
    const id = eleve.id_eleve
    if (rows[id]?.status === 'locked' || rows[id]?.status === 'saving') return
    setRows((p) => ({ ...p, [id]: { statut, status: 'saving' } }))
    try {
      await createAttendance({
        id_eleve: id,
        statut,
        date,
        nom_eleve_snapshot: fullName(eleve),
        classe_snapshot: classe,
      })
      setRows((p) => ({ ...p, [id]: { statut, status: 'saved' } }))
    } catch (err) {
      if (err.response?.status === 409) {
        setRows((p) => ({ ...p, [id]: { statut, status: 'locked', error: 'Déjà pointé aujourd’hui' } }))
      } else {
        setRows((p) => ({ ...p, [id]: { statut, status: 'error', error: err.response?.data?.message || 'Échec de l’enregistrement.' } }))
      }
    }
  }

  const pointesCount = Object.values(rows).filter((r) => r.status === 'saved' || r.status === 'locked').length

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-8">
      {/* En-tête */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Suivi des présences</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Faire le pointage</h1>
        </div>
        <button type="button" onClick={() => navigate('/presences')}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
          <History size={16} />Voir l'historique
        </button>
      </div>

      {/* Sélection classe + date */}
      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="p-classe" className="text-xs font-medium text-slate-500">Classe</label>
          <select id="p-classe" value={classe} onChange={(e) => setClasse(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10">
            <option value="">Sélectionner une classe</option>
            {classesList.map((c) => <option key={c.id_classe} value={c.nom_classe}>{c.nom_classe}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="p-date" className="text-xs font-medium text-slate-500">Date</label>
          <input id="p-date" type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10" />
        </div>
        {classe && roster.length > 0 && (
          <div className="rounded-md bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <span className="font-semibold text-slate-900 tabular-nums">{pointesCount}</span> / {roster.length} pointé{roster.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Roster */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {!classe ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Users size={26} strokeWidth={1.6} /></div>
            <h2 className="mb-1 text-base font-semibold text-slate-900">Sélectionnez une classe</h2>
            <p className="max-w-sm text-sm leading-6 text-slate-500">Choisissez une classe ci-dessus pour afficher la liste des élèves à pointer.</p>
          </div>
        ) : rosterError ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <AlertCircle className="mb-4 h-11 w-11 text-rose-500" />
            <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">{rosterError}</p>
            <button onClick={loadRoster} className="rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark">Réessayer</button>
          </div>
        ) : loadingRoster ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
                <div className="ml-auto h-8 w-52 animate-pulse rounded-md bg-slate-100" />
              </div>
            ))}
          </div>
        ) : roster.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Users size={26} strokeWidth={1.6} /></div>
            <h2 className="mb-1 text-base font-semibold text-slate-900">Aucun élève</h2>
            <p className="max-w-sm text-sm leading-6 text-slate-500">Cette classe n'a pas encore d'élèves assignés.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {roster.map((e) => {
              const st = rows[e.id_eleve] || { statut: null, status: 'idle' }
              return (
                <li key={e.id_eleve} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-semibold text-navy">{initials(e)}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{e.nom} {e.postnom}</p>
                      <p className="text-xs text-slate-500">{e.prenom}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Feedback immédiat */}
                    <div className="min-w-[92px] text-right text-xs">
                      {st.status === 'saving' && <span className="inline-flex items-center gap-1 text-slate-500"><Loader2 size={13} className="animate-spin" />Enreg.…</span>}
                      {st.status === 'saved' && <span className="inline-flex items-center gap-1 font-medium text-emerald-600"><CheckCircle2 size={14} />Enregistré</span>}
                      {st.status === 'locked' && <span className="inline-flex items-center gap-1 font-medium text-slate-500"><CheckCircle2 size={14} />Déjà pointé</span>}
                      {st.status === 'error' && <span className="inline-flex items-center gap-1 font-medium text-rose-600" title={st.error}><AlertCircle size={14} />Erreur</span>}
                    </div>

                    {/* Boutons statut */}
                    <div className="flex items-center gap-1.5">
                      {STATUTS.map((s) => {
                        const active = st.statut === s.value
                        const disabled = st.status === 'saving' || st.status === 'locked'
                        const Icon = s.icon
                        return (
                          <button key={s.value} type="button" onClick={() => mark(e, s.value)} disabled={disabled}
                            aria-pressed={active}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition active:scale-[0.97] disabled:cursor-not-allowed ${active ? s.on : `bg-white ${s.off}`} ${disabled && !active ? 'opacity-40' : ''}`}>
                            <Icon size={13} />{s.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

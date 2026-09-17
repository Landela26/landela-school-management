import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, ClipboardCheck, Cpu, Hand, X } from 'lucide-react'

import { getAttendances } from '../services/attendanceService'
import { getClasses } from '../services/classeService'

const PER_PAGE = 10

const STATUT_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'present', label: 'Présent' },
  { value: 'retard', label: 'Retard' },
  { value: 'absent', label: 'Absent' },
]

function StatutBadge({ statut }) {
  const map = {
    present: { label: 'Présent', className: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    retard: { label: 'Retard', className: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
    absent: { label: 'Absent', className: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  }
  const it = map[statut] || { label: '—', className: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${it.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${it.dot}`} />{it.label}
    </span>
  )
}

function SourceBadge({ source }) {
  const nfc = source === 'nfc'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${nfc ? 'bg-navy/10 text-navy' : 'bg-slate-100 text-slate-600'}`}>
      {nfc ? <Cpu size={12} /> : <Hand size={12} />}{nfc ? 'NFC' : 'Manuel'}
    </span>
  )
}

function fmtDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtHeure(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function SkeletonRows() {
  return Array.from({ length: 6 }).map((_, i) => (
    <tr key={i} className="border-t border-slate-100">
      <td className="px-5 py-4"><div className="h-3 w-40 animate-pulse rounded bg-slate-100" /></td>
      <td className="px-5 py-4"><div className="h-3 w-16 animate-pulse rounded bg-slate-100" /></td>
      <td className="px-5 py-4"><div className="h-5 w-20 animate-pulse rounded-md bg-slate-100" /></td>
      <td className="px-5 py-4"><div className="h-3 w-20 animate-pulse rounded bg-slate-100" /></td>
      <td className="px-5 py-4"><div className="h-3 w-12 animate-pulse rounded bg-slate-100" /></td>
      <td className="px-5 py-4"><div className="h-5 w-16 animate-pulse rounded-md bg-slate-100" /></td>
    </tr>
  ))
}

export default function PresencesList() {
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [classesList, setClassesList] = useState([])
  const [date, setDate] = useState('')
  const [classe, setClasse] = useState('')
  const [statut, setStatut] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    getClasses().then((r) => setClassesList(r?.data || [])).catch(() => setClassesList([]))
  }, [])

  useEffect(() => { setPage(1) }, [date, classe, statut])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = { page, per_page: PER_PAGE }
      if (date) params.date = date
      if (classe) params.classe = classe
      if (statut) params.statut = statut
      const res = await getAttendances(params)
      if (!res?.success) throw new Error(res?.message || 'Réponse inattendue.')
      setRows(res.data || [])
      setPagination(res.pagination || null)
    } catch (err) {
      console.error('Erreur historique pointages :', err)
      setError(err.response?.data?.message || err.message || 'Impossible de charger l’historique des pointages.')
      setRows([]); setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [page, date, classe, statut])

  useEffect(() => { load() }, [load])

  const hasFilters = Boolean(date || classe || statut)
  const total = pagination?.total ?? 0
  const currentPage = pagination?.page_courante ?? page
  const lastPage = pagination?.derniere_page ?? 1
  const from = pagination?.de ?? 0
  const to = pagination?.a ?? 0

  const resetFilters = () => { setDate(''); setClasse(''); setStatut('') }

  const filterInput = 'rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10'

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-8">
      {/* En-tête */}
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Suivi des présences</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Historique des pointages</h1>
      </div>

      {/* Filtres */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-date" className="text-xs font-medium text-slate-500">Date</label>
          <input id="f-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={filterInput} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-classe" className="text-xs font-medium text-slate-500">Classe</label>
          <select id="f-classe" value={classe} onChange={(e) => setClasse(e.target.value)} className={filterInput}>
            <option value="">Toutes les classes</option>
            {classesList.map((c) => (
              <option key={c.id_classe} value={c.nom_classe}>{c.nom_classe}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-statut" className="text-xs font-medium text-slate-500">Statut</label>
          <select id="f-statut" value={statut} onChange={(e) => setStatut(e.target.value)} className={filterInput}>
            {STATUT_FILTERS.map((s) => <option key={s.value || 'all'} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button type="button" onClick={resetFilters}
            className="inline-flex h-[38px] items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            <X size={15} />Réinitialiser
          </button>
        )}
      </div>

      {/* Carte tableau */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <AlertCircle className="mb-4 h-11 w-11 text-rose-500" />
            <h2 className="mb-1 text-base font-semibold text-slate-900">Erreur de chargement</h2>
            <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">{error}</p>
            <button onClick={load} className="rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark">Réessayer</button>
          </div>
        ) : !loading && rows.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"><ClipboardCheck size={26} strokeWidth={1.6} /></div>
            <h2 className="mb-1 text-base font-semibold text-slate-900">Aucun pointage</h2>
            <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">
              {hasFilters ? 'Aucun pointage ne correspond à ces filtres.' : 'Aucun pointage enregistré pour le moment.'}
            </p>
            {hasFilters && (
              <button onClick={resetFilters} className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Réinitialiser les filtres</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <th className="px-5 py-3.5">Élève</th>
                  <th className="px-5 py-3.5">Classe</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Heure</th>
                  <th className="px-5 py-3.5">Source</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <SkeletonRows /> : rows.map((r) => (
                  <tr key={r.id_presence} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">{r.nom_eleve_snapshot}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{r.classe_snapshot || '—'}</td>
                    <td className="px-5 py-4"><StatutBadge statut={r.statut_presence} /></td>
                    <td className="px-5 py-4 text-sm tabular-nums text-slate-600">{fmtDate(r.date_heure)}</td>
                    <td className="px-5 py-4 text-sm tabular-nums text-slate-600">{fmtHeure(r.date_heure)}</td>
                    <td className="px-5 py-4"><SourceBadge source={r.source_pointage} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!error && (loading || rows.length > 0) && (
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {loading ? 'Chargement…' : (
                <>Affichage de <span className="font-medium text-slate-900 tabular-nums">{from}</span>
                {' '}à <span className="font-medium text-slate-900 tabular-nums">{to}</span>
                {' '}sur <span className="font-medium text-slate-900 tabular-nums">{total}</span> pointages</>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={loading || currentPage <= 1}
                className="flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronLeft size={16} />Précédent
              </button>
              <span className="px-2 text-sm tabular-nums text-slate-500">{currentPage} / {lastPage}</span>
              <button type="button" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={loading || currentPage >= lastPage}
                className="flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                Suivant<ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ChevronRight, GraduationCap, Plus, School, Trash2, Users } from 'lucide-react'

import { getClasses } from '../services/classeService'
import { getStudents } from '../services/studentService'

export default function EleveClasses() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [clsRes, stuRes] = await Promise.all([
        getClasses(),
        getStudents({ per_page: 1000 }),
      ])
      const byClasse = {}
      ;(stuRes?.data || []).forEach((s) => {
        const id = s.classe_id ?? s.classe?.id_classe
        if (id != null) byClasse[id] = (byClasse[id] || 0) + 1
      })
      setClasses(clsRes?.data || [])
      setCounts(byClasse)
    } catch (err) {
      console.error('Erreur chargement classes :', err)
      setError(err.response?.data?.message || 'Impossible de charger les classes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-8">
      {/* En-tête */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Gestion des élèves</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Élèves par classe</h1>
          <p className="mt-1.5 text-sm text-slate-500">Choisissez une classe pour consulter ses élèves.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate('/eleves/supprimes')}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-[0.97]">
            <Trash2 size={16} />Élèves supprimés
          </button>
          <button type="button" onClick={() => navigate('/eleves/nouveau')}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark active:scale-[0.97]">
            <Plus size={17} />Ajouter un élève
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-center shadow-sm">
          <AlertCircle className="mb-4 h-11 w-11 text-rose-500" />
          <h2 className="mb-1 text-base font-semibold text-slate-900">Erreur de chargement</h2>
          <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">{error}</p>
          <button onClick={load} className="rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark">Réessayer</button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"><School size={26} strokeWidth={1.6} /></div>
          <h2 className="mb-1 text-base font-semibold text-slate-900">Aucune classe</h2>
          <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">Créez d'abord une classe dans la section « Classes » pour pouvoir y inscrire des élèves.</p>
          <button onClick={() => navigate('/classes')} className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Aller aux classes</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => {
            const n = counts[c.id_classe] || 0
            return (
              <button key={c.id_classe} type="button" onClick={() => navigate(`/eleves/classe/${c.id_classe}`)}
                className="group flex flex-col items-start gap-3 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-navy/30 hover:shadow-md active:scale-[0.99]">
                <div className="flex w-full items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy/10 text-navy"><GraduationCap size={22} /></div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    <Users size={13} />{n} élève{n > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="w-full">
                  <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">{c.nom_classe}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {[c.niveau, c.annee_scolaire].filter(Boolean).join(' • ') || '—'}
                  </p>
                </div>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-navy">
                  Voir les élèves
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

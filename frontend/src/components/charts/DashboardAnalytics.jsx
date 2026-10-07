import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, GraduationCap, RotateCw, School, TrendingUp, XCircle } from 'lucide-react'

import { getClasses } from '../../services/classeService'
import { getStudents } from '../../services/studentService'
import { getAttendances } from '../../services/attendanceService'
import { BRAND, STATUTS, localToday } from './chartTheme'
import { latestPerStudent } from '../../utils/attendance'
import KpiTile from './KpiTile'
import ClassesPointageChart from './ClassesPointageChart'

const color = (key) => STATUTS.find((s) => s.key === key).color

/** Statuts du jour : un seul pointage (le plus récent) par élève, y compris les élèves purgés. */
function countDay(rows) {
  const c = { present: 0, retard: 0, absent: 0 }
  latestPerStudent(rows).forEach((a) => {
    if (c[a.statut_presence] !== undefined) c[a.statut_presence] += 1
  })
  return c
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  )
}

function Skeleton() {
  return (
    <div className="space-y-8" aria-hidden="true">
      {[2, 4].map((n, s) => (
        <div key={s} className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${n === 4 ? 'lg:grid-cols-4' : ''}`}>
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} className="h-[118px] animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm" />
          ))}
        </div>
      ))}
      <div className="h-[260px] animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm" />
    </div>
  )
}

/** Tableau de bord : un miroir des menus Élèves, Classes et Présences. */
export default function DashboardAnalytics() {
  const [classes, setClasses] = useState([])
  const [eleves, setEleves] = useState([])
  const [jour, setJour] = useState({ present: 0, retard: 0, absent: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [clsRes, stuRes, attRes] = await Promise.all([
        getClasses(),
        getStudents({ per_page: 1000 }),
        getAttendances({ date: localToday(), per_page: 100 }),
      ])
      setClasses(clsRes?.data || [])
      setEleves(stuRes?.data || [])
      setJour(countDay(attRes?.data || []))
    } catch (err) {
      console.error('Erreur tableau de bord :', err)
      setError(err.response?.data?.message || 'Impossible de charger le tableau de bord.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-lg border border-rose-200 bg-rose-50/60 p-6 text-center">
        <AlertCircle size={22} className="mb-2 text-rose-600" />
        <p className="text-sm font-medium text-rose-800">{error}</p>
        <button onClick={load}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 active:scale-[0.97]">
          <RotateCw size={14} />Réessayer
        </button>
      </div>
    )
  }

  const effectif = eleves.length
  const actifs = eleves.filter((e) => e.statut === 'actif').length
  const annees = [...new Set(classes.map((c) => c.annee_scolaire).filter(Boolean))]
  const taux = effectif ? Math.min(100, Math.round(((jour.present + jour.retard) / effectif) * 100)) : 0

  return (
    <div className="space-y-8">
      <Section title="Vue d'ensemble">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <KpiTile label="Élèves" value={effectif} icon={GraduationCap} color={BRAND} to="/eleves"
            caption={`${actifs} actif${actifs > 1 ? 's' : ''}`} />
          <KpiTile label="Classes" value={classes.length} icon={School} color={BRAND} to="/classes"
            caption={annees.length === 1 ? `Année ${annees[0]}` : ''} />
        </div>
      </Section>

      <Section title="Pointage du jour">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="Présents" value={jour.present} icon={CheckCircle2} color={color('present')} to="/presences" />
          <KpiTile label="Retards" value={jour.retard} icon={Clock} color={color('retard')} to="/presences" />
          <KpiTile label="Absents" value={jour.absent} icon={XCircle} color={color('absent')} to="/presences" />
          <KpiTile label="Taux de présence" value={`${taux}%`} icon={TrendingUp} color={BRAND} to="/presences"
            caption="Présents et retards" />
        </div>
      </Section>

      <ClassesPointageChart classes={classes} showClassesLink />
    </div>
  )
}

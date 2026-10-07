import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Chart from 'react-apexcharts'
import { BarChart3, ChevronRight, Table2 } from 'lucide-react'

import { getStudents } from '../../services/studentService'
import { getAttendances } from '../../services/attendanceService'
import { INK, STATUTS, baseChart, localToday } from './chartTheme'
import { latestPerStudent } from '../../utils/attendance'

export default function ClassesPointageChart({ classes, showClassesLink = false }) {
  const navigate = useNavigate()
  const [date, setDate] = useState(localToday())
  const [effectifs, setEffectifs] = useState({})   // id_classe -> nb élèves
  const [statsByClasse, setStatsByClasse] = useState({}) // nom_classe -> {present, retard, absent}
  const [loading, setLoading] = useState(true)     // 1er chargement : squelette
  const [refreshing, setRefreshing] = useState(false) // changement de date : on garde le rendu
  const [error, setError] = useState('')
  const [showTable, setShowTable] = useState(false)

  // Effectifs : une seule fois.
  useEffect(() => {
    getStudents({ per_page: 1000 })
      .then((res) => {
        const byClasse = {}
        ;(res?.data || []).forEach((s) => {
          const id = s.classe_id ?? s.classe?.id_classe
          if (id != null) byClasse[id] = (byClasse[id] || 0) + 1
        })
        setEffectifs(byClasse)
      })
      .catch(() => setEffectifs({}))
  }, [])

  // Pointages de la date choisie.
  const loadAttendances = useCallback(async (d, first) => {
    if (first) setLoading(true); else setRefreshing(true)
    setError('')
    try {
      const res = await getAttendances({ date: d, per_page: 100 })
      // Un statut par élève et par jour (le plus récent), y compris les élèves purgés (F13).
      const agg = {}
      latestPerStudent(res?.data || []).forEach((a) => {
        const k = a.classe_snapshot || '—'
        agg[k] = agg[k] || { present: 0, retard: 0, absent: 0 }
        if (agg[k][a.statut_presence] !== undefined) agg[k][a.statut_presence] += 1
      })
      setStatsByClasse(agg)
    } catch (err) {
      console.error('Erreur pointage par classe :', err)
      setError(err.response?.data?.message || 'Impossible de charger le pointage.')
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [])

  const didLoad = useRef(false)
  useEffect(() => {
    loadAttendances(date, !didLoad.current)
    didLoad.current = true
  }, [date, loadAttendances])

  // Lignes du graphique / du tableau.
  const rows = useMemo(() => (classes || []).map((c) => {
    const eff = effectifs[c.id_classe] || 0
    const s = statsByClasse[c.nom_classe] || { present: 0, retard: 0, absent: 0 }
    const pointes = s.present + s.retard + s.absent
    return {
      id: c.id_classe,
      nom: c.nom_classe,
      effectif: eff,
      present: s.present,
      retard: s.retard,
      absent: s.absent,
      non_pointe: Math.max(eff - pointes, 0),
      pointes,
      // Plafonné : sur une date passée, des élèves purgés (F13) ne sont plus dans l’effectif actuel.
      taux: eff ? Math.min(100, Math.round((pointes / eff) * 100)) : 0,
    }
  }), [classes, effectifs, statsByClasse])

  const totalEff = rows.reduce((t, r) => t + r.effectif, 0)
  const totalPointes = rows.reduce((t, r) => t + Math.min(r.pointes, r.effectif), 0)

  const series = useMemo(
    () => STATUTS.map((st) => ({ name: st.label, data: rows.map((r) => r[st.key]) })),
    [rows],
  )

  const options = useMemo(() => {
    return {
      chart: {
        ...baseChart({ type: 'bar', stacked: true, stackType: '100%' }),
        events: {
          // Clic sur une classe → écran de pointage de cette classe.
          click: (_e, _ctx, cfg) => {
            const row = cfg?.dataPointIndex >= 0 ? rows[cfg.dataPointIndex] : null
            if (row) navigate(`/presences/pointage?classe=${encodeURIComponent(row.nom)}`)
          },
        },
      },
      colors: STATUTS.map((s) => s.color),
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '46%',
          borderRadius: 4,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last',
        },
      },
      stroke: { width: 2, colors: ['#ffffff'] }, // 2px d'espace « surface » entre segments
      dataLabels: {
        enabled: true,
        // Valeur brute (nb d'élèves), seulement si le segment est assez large.
        formatter: (val, opts) => {
          const raw = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex]
          return raw && val >= 9 ? String(raw) : ''
        },
        style: { fontSize: '12px', fontWeight: 600, colors: [INK.primary] },
        dropShadow: { enabled: false },
      },
      xaxis: {
        categories: rows.map((r) => r.nom),
        min: 0,
        max: 100,
        tickAmount: 4,
        labels: { formatter: (v) => `${Math.round(v)}%`, style: { colors: INK.muted, fontSize: '11px' } },
        axisBorder: { show: true, color: INK.axis },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: INK.secondary, fontSize: '13px', fontWeight: 500 }, maxWidth: 160 },
      },
      grid: {
        borderColor: INK.grid,
        strokeDashArray: 0,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
        padding: { left: 4, right: 12, top: -8, bottom: 0 },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '12px',
        labels: { colors: INK.secondary },
        markers: { size: 6, shape: 'circle', strokeWidth: 0 },
        itemMargin: { horizontal: 10, vertical: 4 },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: 'light',
        y: {
          formatter: (_val, { seriesIndex, dataPointIndex, w }) => {
            const raw = w.config.series[seriesIndex].data[dataPointIndex] || 0
            const eff = rows[dataPointIndex]?.effectif || 0
            const pct = eff ? Math.round((raw / eff) * 100) : 0
            return `${raw} élève${raw > 1 ? 's' : ''} · ${pct}%`
          },
        },
      },
      states: {
        hover: { filter: { type: 'darken', value: 0.92 } },
        active: { filter: { type: 'none' } },
      },
    }
  }, [rows, navigate])

  if (!classes || classes.length === 0) return null

  const height = Math.max(170, rows.length * 56 + 96)

  return (
    <section className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* En-tête + filtres (une seule rangée au-dessus du graphique) */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">Pointage par classe</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{totalPointes}</span> / {totalEff} élève{totalEff > 1 ? 's' : ''} pointé{totalPointes > 1 ? 's' : ''}
            {' · '}Cliquez sur une classe pour la pointer.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showClassesLink && (
            <button type="button" onClick={() => navigate('/classes')}
              className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-navy transition hover:bg-navy/5">
              Voir les classes<ChevronRight size={15} />
            </button>
          )}
          <label htmlFor="pc-date" className="sr-only">Date</label>
          <input id="pc-date" type="date" value={date} max={localToday()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10" />
          <button type="button" onClick={() => setShowTable((v) => !v)} aria-pressed={showTable}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-[0.97]">
            {showTable ? <BarChart3 size={15} /> : <Table2 size={15} />}
            {showTable ? 'Graphique' : 'Données'}
          </button>
        </div>
      </div>

      <div className="px-3 pb-3 pt-2">
        {error ? (
          <p className="px-2 py-10 text-center text-sm text-rose-600">{error}</p>
        ) : loading ? (
          <div className="space-y-5 px-2 py-6" aria-hidden="true">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-4">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                <div className="h-5 flex-1 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : totalEff === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-slate-500">Aucun élève inscrit dans les classes pour le moment.</p>
        ) : showTable ? (
          /* Vue tableau : l'équivalent accessible du graphique */
          <div className="overflow-x-auto px-2 py-2">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <th className="px-3 py-2.5">Classe</th>
                  <th className="px-3 py-2.5 text-right">Présents</th>
                  <th className="px-3 py-2.5 text-right">Retards</th>
                  <th className="px-3 py-2.5 text-right">Absents</th>
                  <th className="px-3 py-2.5 text-right">Non pointés</th>
                  <th className="px-3 py-2.5 text-right">Effectif</th>
                  <th className="px-3 py-2.5 text-right">Pointés</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{r.nom}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{r.present}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{r.retard}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{r.absent}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">{r.non_pointe}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{r.effectif}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-900">{r.taux}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`transition-opacity duration-200 [&_.apexcharts-bar-area]:cursor-pointer ${refreshing ? 'opacity-50' : 'opacity-100'}`}>
            <Chart type="bar" series={series} options={options} height={height} />
          </div>
        )}
      </div>
    </section>
  )
}

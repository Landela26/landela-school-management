import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ClipboardList, Cpu, Hand, Loader2, MapPin, Pencil, Trash2 } from 'lucide-react'

import Modal from '../components/ui/Modal'
import useGracePeriod from '../hooks/useGracePeriod'
import { deleteStudent, getStudent } from '../services/studentService'
import { getClasses } from '../services/classeService'
import { getAttendances } from '../services/attendanceService'
import { computeAge } from '../utils/studentValidation'

const fmtDate = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
const fmtHeure = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
const initials = (e) => ((e?.nom?.[0] || '') + (e?.prenom?.[0] || '')).toUpperCase() || '?'

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

function StatTile({ label, value, tone }) {
  const tones = {
    present: 'text-emerald-700', retard: 'text-amber-700', absent: 'text-rose-700', taux: 'text-navy',
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className={`font-display text-2xl font-bold tabular-nums ${tones[tone] || 'text-slate-900'}`}>{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  )
}

export default function EleveDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [eleve, setEleve] = useState(null)
  const [classeNom, setClasseNom] = useState('—')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // F12 : suppression (soft delete) avec confirmation
  const graceDays = useGracePeriod()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async () => {
    setDeleting(true); setDeleteError('')
    try {
      await deleteStudent(eleve.id_eleve)
      const nomComplet = [eleve.nom, eleve.postnom, eleve.prenom].filter(Boolean).join(' ')
      navigate(eleve.classe_id ? `/eleves/classe/${eleve.classe_id}` : '/eleves', {
        replace: true,
        state: { flash: `${nomComplet} a été retiré de la liste des élèves.` },
      })
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || 'La suppression a échoué.')
      setDeleting(false)
    }
  }

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await getStudent(id)
      const student = res?.data || res
      if (!student) throw new Error('Élève introuvable.')
      setEleve(student)

      // GET /students/{id} ne renvoie pas la relation classe : on la résout depuis classe_id.
      let nom = student.classe?.nom_classe || null
      if (!nom && student.classe_id) {
        const cls = await getClasses().then((r) => r?.data || []).catch(() => [])
        nom = cls.find((c) => String(c.id_classe) === String(student.classe_id))?.nom_classe || null
      }
      setClasseNom(nom || '—')

      // Historique : on filtre par classe (supporté par l'API) puis par élève côté client.
      // per_page plafonné à 100 côté back (IndexAttendanceRequest).
      const params = { per_page: 100 }
      if (student.classe_id) params.class_id = student.classe_id
      const attRes = await getAttendances(params)
      const rows = (attRes?.data || []).filter(
        (r) => String(r.id_eleve ?? r.eleve_id) === String(student.id_eleve),
      )
      rows.sort((a, b) => new Date(b.date_heure) - new Date(a.date_heure))
      setHistory(rows)
    } catch (err) {
      console.error('Erreur chargement fiche élève :', err)
      setError(err.response?.data?.message || err.message || 'Impossible de charger la fiche de l’élève.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() /* eslint-disable-next-line */ }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-navy" />
          <p className="text-sm text-slate-500">Chargement de la fiche…</p>
        </div>
      </div>
    )
  }

  if (error || !eleve) {
    return (
      <div className="mx-auto max-w-3xl p-6 md:p-8">
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-center shadow-sm">
          <AlertCircle className="mb-4 h-11 w-11 text-rose-500" />
          <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">{error || 'Élève introuvable.'}</p>
          <button onClick={() => navigate('/eleves')} className="rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark">Retour aux classes</button>
        </div>
      </div>
    )
  }

  const age = computeAge(eleve.date_naissance ? new Date(eleve.date_naissance).toISOString().slice(0, 10) : null)
  const present = history.filter((r) => r.statut_presence === 'present').length
  const retard = history.filter((r) => r.statut_presence === 'retard').length
  const absent = history.filter((r) => r.statut_presence === 'absent').length
  const total = history.length
  const taux = total ? Math.round(((present + retard) / total) * 100) : null

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-8">
      <button type="button" onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800">
        <ArrowLeft size={16} />Retour
      </button>

      {/* Carte identité */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div className="flex items-center gap-4">
            {eleve.photo ? (
              <img src={eleve.photo} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xl font-bold text-navy">{initials(eleve)}</div>
            )}
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">{eleve.nom} {eleve.postnom} {eleve.prenom}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-md bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy">{classeNom}</span>
                <span>{eleve.sexe === 'M' ? 'Masculin' : eleve.sexe === 'F' ? 'Féminin' : '—'}</span>
                {age != null && <span>• {age} ans</span>}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => navigate(`/eleves/${eleve.id_eleve}/modifier`)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-[0.97]">
              <Pencil size={15} />Modifier
            </button>
            <button type="button" onClick={() => { setDeleteError(''); setConfirmOpen(true) }}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 active:scale-[0.97]">
              <Trash2 size={15} />Supprimer
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-2">
          <div className="bg-white p-4 md:px-8">
            <p className="text-xs font-medium text-slate-500">Date de naissance</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{eleve.date_naissance ? fmtDate(eleve.date_naissance) : '—'}</p>
          </div>
          <div className="bg-white p-4 md:px-8">
            <p className="text-xs font-medium text-slate-500">Adresse</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-900"><MapPin size={14} className="text-slate-400" />{eleve.adresse || '—'}</p>
          </div>
        </div>
      </div>

      {/* Résumé présences */}
      <div className="mt-6 mb-3 flex items-center gap-2">
        <ClipboardList size={18} className="text-slate-500" />
        <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">Présences</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Présents" value={present} tone="present" />
        <StatTile label="Retards" value={retard} tone="retard" />
        <StatTile label="Absents" value={absent} tone="absent" />
        <StatTile label="Taux de présence" value={taux != null ? `${taux}%` : '—'} tone="taux" />
      </div>

      {/* Historique */}
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {history.length === 0 ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><ClipboardList size={22} strokeWidth={1.6} /></div>
            <p className="text-sm text-slate-500">Aucun pointage enregistré pour cet élève.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Heure</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => {
                  const nfc = r.source_pointage === 'nfc'
                  return (
                    <tr key={r.id_presence} className="border-t border-slate-100">
                      <td className="px-5 py-3.5 text-sm tabular-nums text-slate-700">{fmtDate(r.date_heure)}</td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-slate-600">{fmtHeure(r.date_heure)}</td>
                      <td className="px-5 py-3.5"><StatutBadge statut={r.statut_presence} /></td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${nfc ? 'bg-navy/10 text-navy' : 'bg-slate-100 text-slate-600'}`}>
                          {nfc ? <Cpu size={12} /> : <Hand size={12} />}{nfc ? 'NFC' : 'Manuel'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation de suppression (F12) */}
      <Modal open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)} title="Supprimer cet élève ?" maxWidth="max-w-md">
        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-6 text-slate-600">
            <span className="font-semibold text-slate-900">{eleve.nom} {eleve.postnom} {eleve.prenom}</span> sera retiré
            de la liste des élèves. Son historique de présence est conservé.
          </p>
          <p className="rounded-md bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-600">
            Vous pourrez le réintégrer depuis « Élèves supprimés »
            {graceDays
              ? <> pendant <span className="font-semibold text-slate-900">{graceDays} jours</span>. Passé ce délai, la suppression sera définitive.</>
              : <>, pendant la période définie dans les Paramètres.</>}
          </p>
          {deleteError && (
            <p className="flex items-start gap-2 rounded-md bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />{deleteError}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setConfirmOpen(false)} disabled={deleting}
              className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
              Annuler
            </button>
            <button type="button" onClick={handleDelete} disabled={deleting}
              className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 active:scale-[0.97] disabled:opacity-60">
              {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              {deleting ? 'Suppression…' : 'Supprimer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

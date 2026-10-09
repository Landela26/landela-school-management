import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, Loader2, RotateCcw, Save, Trash2 } from 'lucide-react'

import { getSettings, updateSettings, DEFAULT_SETTINGS } from '../services/settingsService'

const emptyForm = { seuil_retard: '', delai_suppression_jours: '' }

export default function ParametresPage() {
  const [form, setForm] = useState(emptyForm)
  const [baseline, setBaseline] = useState(emptyForm) // valeurs enregistrées, pour détecter les changements
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const load = async () => {
    setLoading(true); setLoadError('')
    try {
      const res = await getSettings()
      if (!res?.success) throw new Error(res?.message || 'Réponse inattendue.')
      const data = {
        seuil_retard: res.data?.seuil_retard ?? DEFAULT_SETTINGS.seuil_retard,
        delai_suppression_jours: String(res.data?.delai_suppression_jours ?? DEFAULT_SETTINGS.delai_suppression_jours),
      }
      setForm(data)
      setBaseline(data)
    } catch (err) {
      console.error('Erreur chargement paramètres :', err)
      setLoadError(err.response?.data?.message || err.message || 'Impossible de charger les paramètres.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }))
    setSaved(false)
    setSaveError('')
  }

  const validate = () => {
    const errors = {}
    if (!/^\d{2}:\d{2}$/.test(form.seuil_retard)) {
      errors.seuil_retard = 'Heure invalide (format HH:MM).'
    }
    const jours = Number(form.delai_suppression_jours)
    if (!Number.isInteger(jours) || jours < 1) {
      errors.delai_suppression_jours = 'Indiquez un nombre de jours ≥ 1.'
    } else if (jours > 3650) {
      errors.delai_suppression_jours = 'Maximum 3650 jours (10 ans).'
    }
    return errors
  }

  const dirty = form.seuil_retard !== baseline.seuil_retard
    || form.delai_suppression_jours !== baseline.delai_suppression_jours

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaveError(''); setSaved(false)
    const errors = validate()
    if (Object.keys(errors).length) { setFieldErrors(errors); return }
    setFieldErrors({})
    setSaving(true)
    try {
      const res = await updateSettings({
        seuil_retard: form.seuil_retard,
        delai_suppression_jours: Number(form.delai_suppression_jours),
      })
      if (!res?.success) throw new Error(res?.message || 'Réponse inattendue.')
      const data = {
        seuil_retard: res.data?.seuil_retard ?? form.seuil_retard,
        delai_suppression_jours: String(res.data?.delai_suppression_jours ?? form.delai_suppression_jours),
      }
      setForm(data)
      setBaseline(data)
      setSaved(true)
    } catch (err) {
      console.error('Erreur sauvegarde paramètres :', err)
      setSaveError(err.response?.data?.message || err.message || 'Échec de l’enregistrement.')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    setForm({
      seuil_retard: DEFAULT_SETTINGS.seuil_retard,
      delai_suppression_jours: String(DEFAULT_SETTINGS.delai_suppression_jours),
    })
    setFieldErrors({}); setSaved(false); setSaveError('')
  }

  const inputClass = (hasError) =>
    `rounded-md border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
      hasError
        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
        : 'border-slate-200 focus:border-navy focus:ring-navy/10'
    }`

  return (
    <div className="mx-auto max-w-3xl p-6 md:p-8">
      {/* En-tête */}
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Configuration</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Paramètres de l'établissement</h1>
        <p className="mt-1.5 text-sm text-slate-500">Ces règles s'appliquent au pointage et à la gestion des élèves.</p>
      </div>

      {loadError ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-center shadow-sm">
          <AlertCircle className="mb-4 h-11 w-11 text-rose-500" />
          <h2 className="mb-1 text-base font-semibold text-slate-900">Erreur de chargement</h2>
          <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">{loadError}</p>
          <button onClick={load} className="rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark">Réessayer</button>
        </div>
      ) : loading ? (
        <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
              <div className="h-11 w-full animate-pulse rounded-md bg-slate-100" />
              <div className="h-3 w-64 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {/* Seuil de retard */}
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3 sm:max-w-sm">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy/10 text-navy"><Clock size={18} /></div>
                <div>
                  <label htmlFor="seuil_retard" className="text-sm font-semibold text-slate-900">Seuil de retard</label>
                  <p className="mt-0.5 text-sm leading-6 text-slate-500">Tout pointage effectué après cette heure est compté comme un <span className="font-medium text-amber-700">retard</span>.</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 sm:w-44">
                <input id="seuil_retard" name="seuil_retard" type="time" value={form.seuil_retard} onChange={onChange}
                  disabled={saving} className={inputClass(fieldErrors.seuil_retard)} />
                {fieldErrors.seuil_retard && <p className="text-xs text-rose-600">{fieldErrors.seuil_retard}</p>}
              </div>
            </div>

            {/* Délai de suppression */}
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3 sm:max-w-sm">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-600"><Trash2 size={18} /></div>
                <div>
                  <label htmlFor="delai_suppression_jours" className="text-sm font-semibold text-slate-900">Délai de suppression définitive</label>
                  <p className="mt-0.5 text-sm leading-6 text-slate-500">Nombre de jours avant qu'un élève supprimé (corbeille) ne soit purgé définitivement.</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 sm:w-44">
                <div className="flex items-center gap-2">
                  <input id="delai_suppression_jours" name="delai_suppression_jours" type="number" min="1" max="3650" step="1"
                    value={form.delai_suppression_jours} onChange={onChange} disabled={saving}
                    className={`w-24 ${inputClass(fieldErrors.delai_suppression_jours)}`} />
                  <span className="text-sm text-slate-500">jours</span>
                </div>
                {fieldErrors.delai_suppression_jours && <p className="text-xs text-rose-600">{fieldErrors.delai_suppression_jours}</p>}
              </div>
            </div>
          </div>

          {/* Pied : feedback + actions */}
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-[20px] text-sm">
              {saved && <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600"><CheckCircle2 size={16} />Paramètres enregistrés.</span>}
              {saveError && <span className="inline-flex items-center gap-1.5 font-medium text-rose-600"><AlertCircle size={16} />{saveError}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={resetToDefaults} disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
                <RotateCcw size={15} />Valeurs par défaut
              </button>
              <button type="submit" disabled={saving || !dirty}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

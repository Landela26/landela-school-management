import {
  CalendarDays,
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  UserPlus,
  X,
} from 'lucide-react'

const labelClass = 'mb-2 block text-sm font-medium text-slate-700'

function inputClass(invalid) {
  return `w-full rounded-md border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
    invalid
      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
      : 'border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10'
  }`
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-rose-600">{message}</p>
}

function Required() {
  return <span className="text-rose-500">*</span>
}

export default function StudentForm({
  form,
  fieldErrors,
  loading,
  success,
  error,
  onChange,
  onSubmit,
  onCancel,
  onDismissSuccess,
  successTitle = 'Élève enregistré',
  errorTitle = 'Impossible d’enregistrer l’élève',
  submitLabel = 'Enregistrer l’élève',
  submittingLabel = 'Enregistrement...',
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {success && (
          <div className="flex items-start gap-3 border-b border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800">{successTitle}</p>
              <p className="mt-1 text-sm text-emerald-700">{success}</p>
            </div>
            <button
              type="button"
              onClick={onDismissSuccess}
              className="text-emerald-600 transition hover:text-emerald-800"
              aria-label="Fermer le message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {error && (
          <div className="border-b border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-800">{errorTitle}</p>
            <p className="mt-1 text-sm text-rose-700">{error}</p>
          </div>
        )}

        {/* Informations personnelles */}
        <section className="p-6 md:p-8">
          <h2 className="text-base font-semibold text-slate-900">Informations personnelles</h2>
          <p className="mt-1.5 text-sm text-slate-500">Renseignez les informations d’identité de l’élève.</p>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
            <div>
              <label htmlFor="nom" className={labelClass}>Nom <Required /></label>
              <input id="nom" name="nom" type="text" value={form.nom} onChange={onChange}
                placeholder="Ex. Kabila" disabled={loading} className={inputClass(fieldErrors.nom)} />
              <FieldError message={fieldErrors.nom} />
            </div>

            <div>
              <label htmlFor="postnom" className={labelClass}>Postnom <Required /></label>
              <input id="postnom" name="postnom" type="text" value={form.postnom} onChange={onChange}
                placeholder="Ex. Mukendi" disabled={loading} className={inputClass(fieldErrors.postnom)} />
              <FieldError message={fieldErrors.postnom} />
            </div>

            <div>
              <label htmlFor="prenom" className={labelClass}>Prénom <Required /></label>
              <input id="prenom" name="prenom" type="text" value={form.prenom} onChange={onChange}
                placeholder="Ex. Jean" disabled={loading} className={inputClass(fieldErrors.prenom)} />
              <FieldError message={fieldErrors.prenom} />
            </div>

            <div>
              <label htmlFor="matricule" className={labelClass}>
                Matricule <span className="text-xs font-normal text-slate-400">(facultatif)</span>
              </label>
              <input id="matricule" name="matricule" type="text" value={form.matricule} onChange={onChange}
                placeholder="Ex. ELV-001" disabled={loading} className={inputClass(fieldErrors.matricule)} />
              <FieldError message={fieldErrors.matricule} />
            </div>

            <div>
              <label htmlFor="sexe" className={labelClass}>Sexe <Required /></label>
              <select id="sexe" name="sexe" value={form.sexe} onChange={onChange}
                disabled={loading} className={inputClass(fieldErrors.sexe)}>
                <option value="">Sélectionner le sexe</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
              <FieldError message={fieldErrors.sexe} />
            </div>

            <div>
              <label htmlFor="dateNaissance" className={labelClass}>Date de naissance <Required /></label>
              <div className="relative">
                <CalendarDays size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="dateNaissance" name="dateNaissance" type="date" value={form.dateNaissance} onChange={onChange}
                  disabled={loading} className={`${inputClass(fieldErrors.dateNaissance)} pl-10`} />
              </div>
              <FieldError message={fieldErrors.dateNaissance} />
            </div>
          </div>
        </section>

        {/* Coordonnées */}
        <section className="border-t border-slate-200 p-6 md:p-8">
          <h2 className="text-base font-semibold text-slate-900">Coordonnées</h2>
          <p className="mt-1.5 text-sm text-slate-500">Indiquez l’adresse de résidence de l’élève.</p>

          <div className="mt-6">
            <label htmlFor="adresse" className={labelClass}>Adresse <Required /></label>
            <div className="relative">
              <MapPin size={18} className="pointer-events-none absolute left-3.5 top-3 text-slate-400" />
              <textarea id="adresse" name="adresse" rows="3" value={form.adresse} onChange={onChange}
                placeholder="Ex. Avenue Kasa-Vubu, Lubumbashi" disabled={loading}
                className={`${inputClass(fieldErrors.adresse)} resize-none pl-10`} />
            </div>
            <FieldError message={fieldErrors.adresse} />
          </div>
        </section>

        {/* Photo */}
        <section className="border-t border-slate-200 p-6 md:p-8">
          <h2 className="text-base font-semibold text-slate-900">Photo</h2>
          <p className="mt-1.5 text-sm text-slate-500">Ajoutez une photo de l’élève si nécessaire.</p>

          <label htmlFor="photo"
            className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center transition ${
              fieldErrors.photo ? 'border-rose-300 bg-rose-50' : 'border-slate-200 hover:border-navy hover:bg-slate-50'
            }`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white text-navy">
              <ImagePlus size={20} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-900">
              {form.photo ? form.photo.name : 'Sélectionner une photo'}
            </p>
            <p className="mt-1 text-xs text-slate-500">JPG, JPEG, PNG ou WEBP — maximum 2 Mo</p>
            <input id="photo" name="photo" type="file" accept=".jpg,.jpeg,.png,.webp"
              onChange={onChange} className="sr-only" disabled={loading} />
          </label>
          <FieldError message={fieldErrors.photo} />
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:justify-end md:px-8">
          <button type="button" onClick={onCancel} disabled={loading}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
            Annuler
          </button>
          <button type="submit" disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-navy px-5 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? (<><Loader2 size={17} className="animate-spin" />{submittingLabel}</>)
              : (<><UserPlus size={17} />{submitLabel}</>)}
          </button>
        </div>
      </div>
    </form>
  )
}

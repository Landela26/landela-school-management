import {
  CalendarDays,
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  UserPlus,
  X,
} from 'lucide-react';

import Button from '../ui/Button';
import FormActions from '../ui/FormActions';
import FormSection from '../ui/FormSection';
import Input from '../ui/Input';
import Select from '../ui/Select';

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
  const labelClass = 'mb-2 block text-sm font-medium text-landela-text';

  const fieldError = (field) =>
    fieldErrors[field] ? (
      <p className="mt-1.5 text-xs text-red-600">{fieldErrors[field]}</p>
    ) : null;

  return (
    <form onSubmit={onSubmit}>
      <div className="overflow-hidden rounded-landela-card border border-landela-border bg-landela-surface shadow-sm">
        {success && (
          <div className="flex items-start gap-3 border-b border-green-200 bg-green-50 p-4">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-green-600" />

            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">{successTitle}</p>
              <p className="mt-1 text-sm text-green-700">{success}</p>
            </div>

            <button
              type="button"
              onClick={onDismissSuccess}
              className="text-green-600 transition hover:text-green-800"
              aria-label="Fermer le message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {error && (
          <div className="border-b border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">{errorTitle}</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        <FormSection
          title="Informations personnelles"
          description="Renseignez les informations d’identité de l’élève."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="nom" className={labelClass}>
                Nom <span className="text-red-500">*</span>
              </label>

              <Input
                id="nom"
                name="nom"
                type="text"
                value={form.nom}
                onChange={onChange}
                placeholder="Ex. Kabila"
                invalid={Boolean(fieldErrors.nom)}
                disabled={loading}
              />

              {fieldError('nom')}
            </div>

            <div>
              <label htmlFor="postnom" className={labelClass}>
                Postnom <span className="text-red-500">*</span>
              </label>

              <Input
                id="postnom"
                name="postnom"
                type="text"
                value={form.postnom}
                onChange={onChange}
                placeholder="Ex. Mukendi"
                invalid={Boolean(fieldErrors.postnom)}
                disabled={loading}
              />

              {fieldError('postnom')}
            </div>

            <div>
              <label htmlFor="prenom" className={labelClass}>
                Prénom <span className="text-red-500">*</span>
              </label>

              <Input
                id="prenom"
                name="prenom"
                type="text"
                value={form.prenom}
                onChange={onChange}
                placeholder="Ex. Jean"
                invalid={Boolean(fieldErrors.prenom)}
                disabled={loading}
              />

              {fieldError('prenom')}
            </div>

            <div>
              <label htmlFor="matricule" className={labelClass}>
                Matricule
                <span className="ml-1 text-xs font-normal text-landela-text-light">
                  (facultatif)
                </span>
              </label>

              <Input
                id="matricule"
                name="matricule"
                type="text"
                value={form.matricule}
                onChange={onChange}
                placeholder="Ex. ELV-001"
                invalid={Boolean(fieldErrors.matricule)}
                disabled={loading}
              />

              {fieldError('matricule')}
            </div>

            <div>
              <label htmlFor="sexe" className={labelClass}>
                Sexe <span className="text-red-500">*</span>
              </label>

              <Select
                id="sexe"
                name="sexe"
                value={form.sexe}
                onChange={onChange}
                invalid={Boolean(fieldErrors.sexe)}
                disabled={loading}
              >
                <option value="">Sélectionner le sexe</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </Select>

              {fieldError('sexe')}
            </div>

            <div>
              <label htmlFor="dateNaissance" className={labelClass}>
                Date de naissance <span className="text-red-500">*</span>
              </label>

              <Input
                id="dateNaissance"
                name="dateNaissance"
                type="date"
                value={form.dateNaissance}
                onChange={onChange}
                invalid={Boolean(fieldErrors.dateNaissance)}
                disabled={loading}
                iconLeft={<CalendarDays size={18} />}
              />

              {fieldError('dateNaissance')}
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Coordonnées"
          description="Indiquez l’adresse de résidence de l’élève."
          className="border-t border-landela-border"
        >
          <div>
            <label htmlFor="adresse" className={labelClass}>
              Adresse <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <MapPin
                size={18}
                className="pointer-events-none absolute left-4 top-3.5 text-landela-text-light"
              />

              <textarea
                id="adresse"
                name="adresse"
                rows="3"
                value={form.adresse}
                onChange={onChange}
                placeholder="Ex. Avenue Kasa-Vubu, Lubumbashi"
                disabled={loading}
                className={`w-full resize-none rounded-lg border bg-white px-4 py-3 pl-11 text-sm text-landela-text outline-none transition placeholder:text-landela-text-light ${
                  fieldErrors.adresse
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-landela-border focus:border-landela-blue focus:ring-2 focus:ring-landela-blue/10'
                }`}
              />
            </div>

            {fieldError('adresse')}
          </div>
        </FormSection>

        <FormSection
          title="Photo"
          description="Ajoutez une photo de l’élève si nécessaire."
          className="border-t border-landela-border"
        >
          <label
            htmlFor="photo"
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition ${
              fieldErrors.photo
                ? 'border-red-300 bg-red-50'
                : 'border-landela-border hover:border-landela-blue hover:bg-landela-blue-light/30'
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-landela-blue-light text-landela-blue">
              <ImagePlus size={22} />
            </div>

            <p className="mt-3 text-sm font-medium text-landela-text">
              {form.photo ? form.photo.name : 'Sélectionner une photo'}
            </p>

            <p className="mt-1 text-xs text-landela-text-secondary">
              JPG, JPEG, PNG ou WEBP — maximum 2 Mo
            </p>

            <input
              id="photo"
              name="photo"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={onChange}
              className="sr-only"
              disabled={loading}
            />
          </label>

          {fieldError('photo')}
        </FormSection>

        <FormActions>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                {submittingLabel}
              </>
            ) : (
              <>
                <UserPlus size={17} />
                {submitLabel}
              </>
            )}
          </Button>
        </FormActions>
      </div>
    </form>
  );
}

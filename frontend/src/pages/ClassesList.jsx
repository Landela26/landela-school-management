import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  School,
  Trash2,
  X,
} from "lucide-react";

import {
  getClasses,
  getEnseignants,
  createClasse,
  updateClasse,
  deleteClasse,
} from "../services/classeService";
import Modal from "../components/ui/Modal";

const EMPTY_FORM = {
  code_classe: "",
  nom_classe: "",
  niveau: "",
  annee_scolaire: "",
  id_enseignant: "",
};

const labelClass = "mb-2 block text-sm font-medium text-slate-700";
const inputClass = (invalid) =>
  `w-full rounded-md border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
    invalid
      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
      : "border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10"
  }`;

function StatutBadge({ statut }) {
  const map = {
    active: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },
    fusionnee: {
      label: "Fusionnée",
      className: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },
    supprimee: {
      label: "Supprimée",
      className: "bg-slate-100 text-slate-500",
      dot: "bg-slate-400",
    },
  };
  const it = map[statut] || map.active;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${it.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${it.dot}`} />
      {it.label}
    </span>
  );
}

function enseignantLabel(c) {
  const e = c.enseignant;
  return e ? [e.nom, e.postnom, e.prenom].filter(Boolean).join(" ") : "—";
}

export default function ClassesList() {
  const [classes, setClasses] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modale formulaire
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Suppression
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cl, ens] = await Promise.all([getClasses(), getEnseignants()]);
      if (!cl?.success) throw new Error(cl?.message || "Réponse inattendue.");
      setClasses(cl.data || []);
      setEnseignants(ens?.data || []);
    } catch (err) {
      console.error("Erreur chargement classes :", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible de charger les classes.",
      );
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-dismiss du message de succès
  useEffect(() => {
    if (!success) return undefined;
    const t = setTimeout(() => setSuccess(""), 3500);
    return () => clearTimeout(t);
  }, [success]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError("");
    setFormOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code_classe: c.code_classe || "",
      nom_classe: c.nom_classe || "",
      niveau: c.niveau || "",
      annee_scolaire: c.annee_scolaire || "",
      id_enseignant: c.id_enseignant ? String(c.id_enseignant) : "",
    });
    setFieldErrors({});
    setFormError("");
    setFormOpen(true);
  };
  const closeForm = () => {
    if (!submitting) setFormOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: "" }));
    setFormError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.code_classe.trim()) errs.code_classe = "Le code est obligatoire.";
    if (!form.nom_classe.trim()) errs.nom_classe = "Le nom est obligatoire.";
    if (!form.niveau.trim()) errs.niveau = "Le niveau est obligatoire.";
    if (!form.annee_scolaire.trim())
      errs.annee_scolaire = "L'année scolaire est obligatoire.";
    else if (!/^\d{4}-\d{4}$/.test(form.annee_scolaire.trim()))
      errs.annee_scolaire = "Format attendu : AAAA-AAAA (ex. 2025-2026).";
    if (!form.id_enseignant)
      errs.id_enseignant = "L'enseignant est obligatoire.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        code_classe: form.code_classe.trim(),
        nom_classe: form.nom_classe.trim(),
        niveau: form.niveau.trim(),
        annee_scolaire: form.annee_scolaire.trim(),
        id_enseignant: Number(form.id_enseignant),
      };
      const res = editing
        ? await updateClasse(editing.id_classe, payload)
        : await createClasse(payload);
      setFormOpen(false);
      setSuccess(
        res?.message || (editing ? "Classe modifiée." : "Classe créée."),
      );
      await load();
    } catch (err) {
      console.error("Erreur enregistrement classe :", err);
      if (err.response?.status === 422) {
        const be = err.response?.data?.errors || {};
        const mapped = {};
        Object.entries(be).forEach(([f, m]) => {
          mapped[f] = Array.isArray(m) ? m[0] : m;
        });
        setFieldErrors(mapped);
        setFormError(
          err.response?.data?.message || "Veuillez corriger les informations.",
        );
      } else {
        setFormError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteClasse(deleteTarget.id_classe);
      setDeleteTarget(null);
      setSuccess(res?.message || "Classe supprimée.");
      await load();
    } catch (err) {
      console.error("Erreur suppression classe :", err);
      setError(
        err.response?.data?.message || "Impossible de supprimer la classe.",
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-8">
      {/* En-tête */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Gestion scolaire
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Classes
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark active:scale-[0.98]"
        >
          <Plus size={17} />
          Ajouter une classe
        </button>
      </div>

      {/* Message de succès */}
      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3.5">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
          <p className="flex-1 text-sm text-emerald-800">{success}</p>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="text-emerald-600 hover:text-emerald-800"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Carte liste */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <AlertCircle className="mb-4 h-11 w-11 text-rose-500" />
            <h2 className="mb-1 text-base font-semibold text-slate-900">
              Erreur de chargement
            </h2>
            <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">
              {error}
            </p>
            <button
              onClick={load}
              className="rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark"
            >
              Réessayer
            </button>
          </div>
        ) : !loading && classes.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <School size={26} strokeWidth={1.6} />
            </div>
            <h2 className="mb-1 text-base font-semibold text-slate-900">
              Aucune classe
            </h2>
            <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">
              Créez la première classe de l'établissement.
            </p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark"
            >
              <Plus size={17} />
              Ajouter une classe
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Classe</th>
                  <th className="px-5 py-3.5">Niveau</th>
                  <th className="px-5 py-3.5">Année</th>
                  <th className="px-5 py-3.5">Enseignant</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : classes.map((c) => (
                      <tr
                        key={c.id_classe}
                        className="border-t border-slate-100 transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4 text-sm font-medium tabular-nums text-slate-700">
                          {c.code_classe}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                          {c.nom_classe}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {c.niveau}
                        </td>
                        <td className="px-5 py-4 text-sm tabular-nums text-slate-600">
                          {c.annee_scolaire}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {enseignantLabel(c)}
                        </td>
                        <td className="px-5 py-4">
                          <StatutBadge statut={c.statut} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              aria-label={`Modifier ${c.nom_classe}`}
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-navy hover:bg-navy/5 hover:text-navy"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(c)}
                              aria-label={`Supprimer ${c.nom_classe}`}
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale création / édition */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Modifier la classe" : "Ajouter une classe"}
      >
        <form onSubmit={submitForm}>
          <div className="space-y-5 p-5">
            {formError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
                <p className="text-sm text-rose-700">{formError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
              <div>
                <label htmlFor="code_classe" className={labelClass}>
                  Code <span className="text-rose-500">*</span>
                </label>
                <input
                  id="code_classe"
                  name="code_classe"
                  value={form.code_classe}
                  onChange={handleChange}
                  placeholder="Ex. 6A-2025"
                  disabled={submitting}
                  className={inputClass(fieldErrors.code_classe)}
                />
                {fieldErrors.code_classe && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {fieldErrors.code_classe}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="nom_classe" className={labelClass}>
                  Nom <span className="text-rose-500">*</span>
                </label>
                <input
                  id="nom_classe"
                  name="nom_classe"
                  value={form.nom_classe}
                  onChange={handleChange}
                  placeholder="Ex. 6ème A"
                  disabled={submitting}
                  className={inputClass(fieldErrors.nom_classe)}
                />
                {fieldErrors.nom_classe && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {fieldErrors.nom_classe}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="niveau" className={labelClass}>
                  Niveau <span className="text-rose-500">*</span>
                </label>
                <input
                  id="niveau"
                  name="niveau"
                  value={form.niveau}
                  onChange={handleChange}
                  placeholder="Ex. 6ème"
                  disabled={submitting}
                  className={inputClass(fieldErrors.niveau)}
                />
                {fieldErrors.niveau && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {fieldErrors.niveau}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="annee_scolaire" className={labelClass}>
                  Année scolaire <span className="text-rose-500">*</span>
                </label>
                <input
                  id="annee_scolaire"
                  name="annee_scolaire"
                  value={form.annee_scolaire}
                  onChange={handleChange}
                  placeholder="2025-2026"
                  disabled={submitting}
                  className={inputClass(fieldErrors.annee_scolaire)}
                />
                {fieldErrors.annee_scolaire && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {fieldErrors.annee_scolaire}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="id_enseignant" className={labelClass}>
                Enseignant titulaire <span className="text-rose-500">*</span>
              </label>
              <select
                id="id_enseignant"
                name="id_enseignant"
                value={form.id_enseignant}
                onChange={handleChange}
                disabled={submitting}
                className={inputClass(fieldErrors.id_enseignant)}
              >
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map((e) => (
                  <option key={e.id_personnel} value={e.id_personnel}>
                    {e.nom} {e.prenom}
                  </option>
                ))}
              </select>
              {fieldErrors.id_enseignant && (
                <p className="mt-1.5 text-xs text-rose-600">
                  {fieldErrors.id_enseignant}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeForm}
              disabled={submitting}
              className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-navy px-5 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enregistrement…
                </>
              ) : editing ? (
                "Enregistrer"
              ) : (
                "Créer la classe"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modale confirmation suppression */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        title="Supprimer la classe"
        maxWidth="max-w-md"
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-700">
                Voulez-vous vraiment supprimer la classe{" "}
                <span className="font-semibold text-slate-900">
                  {deleteTarget?.nom_classe}
                </span>{" "}
                ?
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Elle ne pourra plus être assignée à un élève. Les élèves déjà
                assignés conservent l'information.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={doDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Suppression…
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Supprimer
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}

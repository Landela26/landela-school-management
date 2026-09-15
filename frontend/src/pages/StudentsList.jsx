import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  PencilLine,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { getStudents } from "../services/studentService";

const PER_PAGE = 10;

const SEXE_FILTERS = [
  { value: "", label: "Tous" },
  { value: "M", label: "Masculin" },
  { value: "F", label: "Féminin" },
];

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function initials(student) {
  return (
    (
      (student?.nom?.charAt(0) || "") + (student?.prenom?.charAt(0) || "")
    ).toUpperCase() || "?"
  );
}

function SexeBadge({ sexe }) {
  const map = {
    M: { label: "Masculin", className: "bg-sky-50 text-sky-700" },
    F: { label: "Féminin", className: "bg-violet-50 text-violet-700" },
  };
  const item = map[sexe] || {
    label: "—",
    className: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function StatutBadge({ statut }) {
  const isActif = (statut || "").toLowerCase() === "actif";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
        isActif
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActif ? "bg-emerald-500" : "bg-slate-400"}`}
      />
      {statut ? statut.charAt(0).toUpperCase() + statut.slice(1) : "—"}
    </span>
  );
}

function SkeletonRows() {
  return Array.from({ length: 6 }).map((_, i) => (
    <tr key={i} className="border-t border-slate-100">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
          <div className="space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
      </td>
      <td className="px-5 py-4">
        <div className="h-5 w-20 animate-pulse rounded-md bg-slate-100" />
      </td>
      <td className="px-5 py-4">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
      </td>
      <td className="px-5 py-4">
        <div className="h-5 w-16 animate-pulse rounded-md bg-slate-100" />
      </td>
      <td className="px-5 py-4">
        <div className="ml-auto h-9 w-9 animate-pulse rounded-md bg-slate-100" />
      </td>
    </tr>
  ));
}

export default function StudentsList() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sexe, setSexe] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debounced, sexe]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, per_page: PER_PAGE };
      if (debounced) params.search = debounced;
      if (sexe) params.sexe = sexe;
      const res = await getStudents(params);
      if (!res?.success)
        throw new Error(res?.message || "Réponse inattendue du serveur.");
      setStudents(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      console.error("Erreur liste élèves :", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible de charger la liste des élèves.",
      );
      setStudents([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, debounced, sexe]);

  useEffect(() => {
    load();
  }, [load]);

  const hasFilters = Boolean(debounced || sexe);
  const total = pagination?.total ?? 0;
  const currentPage = pagination?.page_courante ?? page;
  const lastPage = pagination?.derniere_page ?? 1;
  const from = pagination?.de ?? 0;
  const to = pagination?.a ?? 0;

  const resetFilters = () => {
    setSearch("");
    setSexe("");
  };

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-8">
      {/* En-tête */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Gestion des élèves
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Élèves
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate("/eleves/nouveau")}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark"
        >
          <UserPlus size={17} />
          Ajouter un élève
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, prénom ou matricule…"
            aria-label="Rechercher un élève par nom, prénom ou matricule"
            className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Effacer la recherche"
              className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
          {SEXE_FILTERS.map((opt) => (
            <button
              key={opt.value || "all"}
              type="button"
              onClick={() => setSexe(opt.value)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                sexe === opt.value
                  ? "bg-navy text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Carte principale */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <AlertCircle className="mb-4 h-11 w-11 text-rose-500" />
            <h2 className="mb-1 text-base font-semibold text-slate-900">
              Erreur de chargement
            </h2>
            <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">
              {error}
            </p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark"
            >
              Réessayer
            </button>
          </div>
        ) : !loading && students.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Users size={26} strokeWidth={1.6} />
            </div>
            <h2 className="mb-1 text-base font-semibold text-slate-900">
              {hasFilters ? "Aucun résultat" : "Aucun élève"}
            </h2>
            <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">
              {hasFilters
                ? "Aucun élève ne correspond à votre recherche. Essayez d’autres critères."
                : "Commencez par enregistrer un premier élève dans le système."}
            </p>
            {hasFilters ? (
              <button
                onClick={resetFilters}
                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Réinitialiser les filtres
              </button>
            ) : (
              <button
                onClick={() => navigate("/eleves/nouveau")}
                className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-dark"
              >
                <UserPlus size={17} />
                Ajouter un élève
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  <th className="px-5 py-3.5">Élève</th>
                  <th className="px-5 py-3.5">Matricule</th>
                  <th className="px-5 py-3.5">Sexe</th>
                  <th className="px-5 py-3.5">Naissance</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows />
                ) : (
                  students.map((s) => (
                    <tr
                      key={s.id_eleve}
                      className="border-t border-slate-100 transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-semibold text-navy">
                            {initials(s)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {s.nom} {s.postnom}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {s.prenom}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm tabular-nums text-slate-500">
                        {s.matricule || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <SexeBadge sexe={s.sexe} />
                      </td>
                      <td className="px-5 py-4 text-sm tabular-nums text-slate-500">
                        {formatDate(s.date_naissance)}
                      </td>
                      <td className="px-5 py-4">
                        <StatutBadge statut={s.statut} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/eleves/${s.id_eleve}/modifier`)
                            }
                            aria-label={`Modifier ${s.nom} ${s.prenom}`}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-navy hover:bg-navy/5 hover:text-navy"
                          >
                            <PencilLine size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!error && (loading || students.length > 0) && (
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {loading ? (
                "Chargement…"
              ) : (
                <>
                  Affichage de{" "}
                  <span className="font-medium text-slate-900 tabular-nums">
                    {from}
                  </span>{" "}
                  à{" "}
                  <span className="font-medium text-slate-900 tabular-nums">
                    {to}
                  </span>{" "}
                  sur{" "}
                  <span className="font-medium text-slate-900 tabular-nums">
                    {total}
                  </span>{" "}
                  élèves
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={loading || currentPage <= 1}
                className="flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Précédent
              </button>
              <span className="px-2 text-sm tabular-nums text-slate-500">
                {currentPage} / {lastPage}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={loading || currentPage >= lastPage}
                className="flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

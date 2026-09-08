import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  PencilLine,
  Search,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

import { getStudents } from '../services/studentService';
import Button from '../components/ui/Button';

const PER_PAGE = 10;

const SEXE_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function initials(student) {
  const first = student?.nom?.charAt(0) || '';
  const second = student?.prenom?.charAt(0) || '';
  return (first + second).toUpperCase() || '?';
}

function SexeBadge({ sexe }) {
  const map = {
    M: { label: 'Masculin', className: 'bg-landela-blue-light text-landela-blue' },
    F: { label: 'Féminin', className: 'bg-violet-50 text-violet-700' },
  };
  const item = map[sexe] || { label: '—', className: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}>
      {item.label}
    </span>
  );
}

function StatutBadge({ statut }) {
  const isActif = (statut || '').toLowerCase() === 'actif';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isActif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActif ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {statut ? statut.charAt(0).toUpperCase() + statut.slice(1) : '—'}
    </span>
  );
}

function SkeletonRows() {
  return Array.from({ length: 6 }).map((_, i) => (
    <tr key={i} className="border-t border-landela-border">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
          <div className="space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </td>
      <td className="px-5 py-4"><div className="h-3 w-16 animate-pulse rounded bg-slate-100" /></td>
      <td className="px-5 py-4"><div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" /></td>
      <td className="px-5 py-4"><div className="h-3 w-20 animate-pulse rounded bg-slate-100" /></td>
      <td className="px-5 py-4"><div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" /></td>
      <td className="px-5 py-4"><div className="ml-auto h-9 w-9 animate-pulse rounded-lg bg-slate-100" /></td>
    </tr>
  ));
}

export default function StudentsList() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sexe, setSexe] = useState('');
  const [page, setPage] = useState(1);

  // Debounce du champ de recherche (évite un appel API à chaque frappe).
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Un changement de filtre ramène à la première page.
  useEffect(() => {
    setPage(1);
  }, [debounced, sexe]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, per_page: PER_PAGE };
      if (debounced) params.nom = debounced;
      if (sexe) params.sexe = sexe;

      const res = await getStudents(params);
      if (!res?.success) {
        throw new Error(res?.message || 'Réponse inattendue du serveur.');
      }
      setStudents(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      console.error('Erreur liste élèves :', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Impossible de charger la liste des élèves.',
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
    setSearch('');
    setSexe('');
  };

  return (
    <div className="min-h-screen bg-landela-background">
      <header className="border-b border-landela-border bg-landela-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-landela-blue-light text-landela-blue shadow-sm sm:flex">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-landela-blue">
                Gestion des élèves
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-landela-text">
                Élèves
              </h1>
            </div>
          </div>

          <Button onClick={() => navigate('/students/create')}>
            <UserPlus size={17} />
            Ajouter un élève
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 lg:px-8 lg:py-10">
        {/* TOOLBAR : recherche + filtre */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-landela-text-light"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par nom…"
              aria-label="Rechercher un élève par nom"
              className="w-full rounded-lg border border-landela-border bg-landela-surface py-3 pl-11 pr-10 text-sm text-landela-text outline-none transition placeholder:text-landela-text-light focus:border-landela-blue focus:ring-2 focus:ring-landela-blue/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Effacer la recherche"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-landela-text-light transition hover:bg-landela-background hover:text-landela-text"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-landela-border bg-landela-surface p-1">
            {SEXE_FILTERS.map((option) => (
              <button
                key={option.value || 'all'}
                type="button"
                onClick={() => setSexe(option.value)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  sexe === option.value
                    ? 'bg-landela-blue text-white'
                    : 'text-landela-text-secondary hover:bg-landela-background'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* CARTE PRINCIPALE */}
        <div className="overflow-hidden rounded-landela-card border border-landela-border bg-landela-surface shadow-sm">
          {error ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
              <h2 className="mb-1 text-lg font-semibold text-landela-text">Erreur de chargement</h2>
              <p className="mb-6 max-w-sm text-sm leading-6 text-landela-text-secondary">{error}</p>
              <Button onClick={load}>Réessayer</Button>
            </div>
          ) : !loading && students.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-landela-background text-landela-text-light">
                <Users size={26} strokeWidth={1.6} />
              </div>
              <h2 className="mb-1 text-lg font-semibold text-landela-text">
                {hasFilters ? 'Aucun résultat' : 'Aucun élève'}
              </h2>
              <p className="mb-6 max-w-sm text-sm leading-6 text-landela-text-secondary">
                {hasFilters
                  ? 'Aucun élève ne correspond à votre recherche. Essayez d’autres critères.'
                  : 'Commencez par enregistrer un premier élève dans le système.'}
              </p>
              {hasFilters ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              ) : (
                <Button onClick={() => navigate('/students/create')}>
                  <UserPlus size={17} />
                  Ajouter un élève
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="bg-landela-background/60 text-xs font-semibold uppercase tracking-wide text-landela-text-secondary">
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
                    students.map((student) => (
                      <tr
                        key={student.id_eleve}
                        className="border-t border-landela-border transition hover:bg-landela-background/50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-landela-blue-light text-sm font-semibold text-landela-blue">
                              {initials(student)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-landela-text">
                                {student.nom} {student.postnom}
                              </p>
                              <p className="truncate text-xs text-landela-text-secondary">
                                {student.prenom}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm tabular-nums text-landela-text-secondary">
                          {student.matricule || '—'}
                        </td>
                        <td className="px-5 py-4">
                          <SexeBadge sexe={student.sexe} />
                        </td>
                        <td className="px-5 py-4 text-sm tabular-nums text-landela-text-secondary">
                          {formatDate(student.date_naissance)}
                        </td>
                        <td className="px-5 py-4">
                          <StatutBadge statut={student.statut} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => navigate(`/students/${student.id_eleve}/edit`)}
                              aria-label={`Modifier ${student.nom} ${student.prenom}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-landela-border text-landela-text-secondary transition hover:border-landela-blue hover:bg-landela-blue-light/40 hover:text-landela-blue"
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

          {/* PIED : pagination */}
          {!error && (loading || students.length > 0) && (
            <div className="flex flex-col gap-3 border-t border-landela-border bg-landela-background/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-landela-text-secondary">
                {loading ? (
                  'Chargement…'
                ) : (
                  <>
                    Affichage de <span className="font-medium text-landela-text tabular-nums">{from}</span>
                    {' '}à <span className="font-medium text-landela-text tabular-nums">{to}</span>
                    {' '}sur <span className="font-medium text-landela-text tabular-nums">{total}</span> élèves
                  </>
                )}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={loading || currentPage <= 1}
                  className="flex h-9 items-center gap-1 rounded-lg border border-landela-border bg-landela-surface px-3 text-sm font-medium text-landela-text-secondary transition hover:bg-landela-background disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Précédent
                </button>
                <span className="px-2 text-sm tabular-nums text-landela-text-secondary">
                  {currentPage} / {lastPage}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={loading || currentPage >= lastPage}
                  className="flex h-9 items-center gap-1 rounded-lg border border-landela-border bg-landela-surface px-3 text-sm font-medium text-landela-text-secondary transition hover:bg-landela-background disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

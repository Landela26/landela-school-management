import { useEffect, useState, useCallback, useMemo } from "react";
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCw,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import StatCard from "../components/ui/StatCard";
import { getDashboard } from "../services/dashboardService";

const TODAY = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchDashboardData = useCallback(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError("");

    getDashboard({ signal: controller.signal })
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError(
            "Impossible de charger le tableau de bord. Vérifiez votre connexion.",
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cleanup = fetchDashboardData();
    return cleanup;
  }, [fetchDashboardData]);

  const filteredClasses = useMemo(() => {
    const pointageParClasse = data?.pointage_par_classe ?? [];

    return pointageParClasse
      .map((row, index) => {
        const nomClasse = row.nom_classe ?? row.classe ?? "Classe sans nom";
        const total = row.total_eleves || 0;
        const pointes = row.pointes ?? row.eleves_pointes ?? 0;
        const ratio = total > 0 ? Math.round((pointes / total) * 100) : 0;
        return {
          ...row,
          classeKey: row.id_classe ?? `${nomClasse}-${index}`,
          nom_classe: nomClasse,
          pointes,
          ratio,
        };
      })
      .filter((row) => {
        const matchesSearch = row.nom_classe
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (statusFilter === "completed") return row.ratio === 100;
        if (statusFilter === "in_progress")
          return row.ratio >= 50 && row.ratio < 100;
        if (statusFilter === "critical") return row.ratio < 50;
        return true;
      })
      .sort((a, b) =>
        a.nom_classe.localeCompare(b.nom_classe, "fr", { numeric: true }),
      );
  }, [data?.pointage_par_classe, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

  const handleClasseClick = (classeData) => {
    console.log("Classe cliquée :", classeData);
  };

  const totalItems = filteredClasses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded border border-rose-200 bg-rose-50/50 p-6 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded bg-rose-100 text-rose-600">
            <AlertCircle size={20} />
          </div>
          <p className="text-sm font-medium text-rose-800">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 inline-flex items-center gap-2 rounded bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
          >
            <RotateCw size={14} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { indicateurs_generaux, pointage_du_jour } = data || {};

  const totalEleves = indicateurs_generaux?.total_eleves || 1;
  const totalPresents = pointage_du_jour?.presents || 0;
  const tauxAssiduite = Math.round((totalPresents / totalEleves) * 100);

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* En-tête */}
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Tableau de bord
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Bienvenue, Admin <span className="mx-1 text-slate-300">•</span>{" "}
            <span className="capitalize">{TODAY}</span>
          </p>
        </header>

        {/* Section 1 : Vue d'ensemble Élèves (Sans doublon) */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total élèves"
            value={indicateurs_generaux?.total_eleves ?? 0}
            icon={GraduationCap}
            tone="default"
          />
          <StatCard
            label="Élèves actifs"
            value={
              indicateurs_generaux?.total_eleves_actifs ??
              indicateurs_generaux?.total_eleves ??
              0
            }
            icon={UserCheck}
            tone="default"
          />
          <StatCard
            label="Taux d'assiduité"
            value={`${tauxAssiduite}%`}
            icon={TrendingUp}
            tone="gold"
          />
        </section>

        {/* Section 2 : Détail du pointage du jour */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Pointage du jour
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Présents"
              value={pointage_du_jour?.presents ?? 0}
              tone="success"
              icon={CheckCircle2}
            />
            <StatCard
              label="Retards"
              value={pointage_du_jour?.retards ?? 0}
              tone="warning"
              icon={Clock}
            />
            <StatCard
              label="Absents"
              value={pointage_du_jour?.absents ?? 0}
              tone="danger"
              icon={XCircle}
            />
          </div>
        </section>

        {/* Section 3 : Pointage par classe */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Pointage par classe
              </h2>
              <p className="text-sm text-slate-500">
                Sélectionnez une classe pour en afficher les détails
              </p>
            </div>

            {/* Filtres et recherche */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-80">
                <input
                  type="text"
                  placeholder="Rechercher une classe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Complété (100%)</option>
                <option value="in_progress">En cours (50-99%)</option>
                <option value="critical">Critique (&lt; 50%)</option>
              </select>
            </div>
          </div>

          {filteredClasses.length === 0 ? (
            <div className="rounded border border-dashed border-slate-200 bg-white p-16 text-center text-base text-slate-400">
              Aucune classe ne correspond à vos critères.
            </div>
          ) : (
            <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-xs">
              {/* Vue Tableau */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-8 py-4.5">Classe</th>
                      <th className="px-8 py-4.5">Élèves</th>
                      <th className="px-8 py-4.5">Pointage</th>
                      <th className="px-8 py-4.5">Statut</th>
                      <th className="px-8 py-4.5 text-right">Progression</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedClasses.map((row) => (
                      <tr
                        key={row.classeKey}
                        onClick={() => handleClasseClick(row)}
                        className="cursor-pointer transition-colors hover:bg-indigo-50/40 active:bg-indigo-50/80"
                      >
                        <td className="px-8 py-6 font-bold text-slate-900 text-lg">
                          <span className="inline-flex items-center gap-3">
                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                            {row.nom_classe}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-slate-700 font-medium tabular-nums text-base">
                          {row.total_eleves}
                        </td>
                        <td className="px-8 py-6 text-slate-700 tabular-nums text-base">
                          <span className="font-semibold text-slate-900">
                            {row.pointes}
                          </span>
                          <span className="text-slate-400">
                            {" "}
                            / {row.total_eleves}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <StatusBadge ratio={row.ratio} />
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-4">
                            <ProgressBar ratio={row.ratio} />
                            <span className="w-12 text-right font-bold text-slate-800 tabular-nums text-base">
                              {row.ratio}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vue Mobile */}
              <div className="grid grid-cols-1 divide-y divide-slate-100 md:hidden">
                {paginatedClasses.map((row) => (
                  <div
                    key={row.classeKey}
                    onClick={() => handleClasseClick(row)}
                    className="p-6 space-y-4 cursor-pointer active:bg-indigo-50/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-lg">
                        Classe {row.nom_classe}
                      </span>
                      <StatusBadge ratio={row.ratio} />
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>
                        Effectif:{" "}
                        <strong className="text-slate-900">
                          {row.total_eleves}
                        </strong>
                      </span>
                      <span>
                        Émargés:{" "}
                        <strong className="text-slate-900">
                          {row.pointes} / {row.total_eleves}
                        </strong>
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>Progression</span>
                        <span>{row.ratio}%</span>
                      </div>
                      <ProgressBar ratio={row.ratio} size="lg" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Barre de Pagination */}
              <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/50 px-8 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>
                    Affichage de{" "}
                    <strong className="text-slate-900">
                      {Math.min(startIndex + 1, totalItems)}
                    </strong>{" "}
                    à{" "}
                    <strong className="text-slate-900">
                      {Math.min(endIndex, totalItems)}
                    </strong>{" "}
                    sur <strong className="text-slate-900">{totalItems}</strong>{" "}
                    classes
                  </span>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="itemsPerPage"
                      className="text-xs text-slate-500"
                    >
                      Afficher :
                    </label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Précédent
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`h-9 w-9 rounded text-sm font-semibold transition-colors ${
                            currentPage === page
                              ? "bg-indigo-600 text-white"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Suivant
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Badge de Statut
function StatusBadge({ ratio }) {
  if (ratio === 100) {
    return (
      <span className="inline-flex items-center gap-2 rounded bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
        <CheckCircle size={15} />
        Complet
      </span>
    );
  }
  if (ratio >= 50) {
    return (
      <span className="inline-flex items-center gap-2 rounded bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
        <Clock size={15} />
        En cours
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800">
      <AlertTriangle size={15} />
      Incomplet
    </span>
  );
}

function ProgressBar({ ratio, size = "sm" }) {
  const heightClass = size === "lg" ? "h-3.5" : "h-3";

  const colorClass =
    ratio === 100
      ? "bg-emerald-500"
      : ratio >= 50
        ? "bg-amber-500"
        : "bg-rose-500";

  return (
    <div
      className={`w-full max-w-[140px] rounded bg-slate-100 overflow-hidden ${heightClass}`}
    >
      <div
        className={`h-full rounded transition-all duration-500 ${colorClass}`}
        style={{ width: `${Math.min(ratio, 100)}%` }}
      />
    </div>
  );
}

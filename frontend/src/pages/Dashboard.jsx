import { lazy, Suspense } from "react";

import { useAuth } from "../context/useAuth";

// ApexCharts est lourd : le bloc statistiques est chargé à la demande.
const DashboardAnalytics = lazy(() => import("../components/charts/DashboardAnalytics"));

function AnalyticsFallback() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[118px] animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm" />
        ))}
      </div>
      <div className="h-[390px] animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Admin";

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Tableau de bord
          </h1>
          <p className="text-sm font-medium text-slate-500">Bienvenue, {name}</p>
        </header>

        <Suspense fallback={<AnalyticsFallback />}>
          <DashboardAnalytics />
        </Suspense>
      </div>
    </div>
  );
}

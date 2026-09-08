import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
  UserCog,
  UserX,
  Users,
  UserPlus,
  GraduationCap,
  Clock3,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/useAuth';
import { getDashboard } from '../services/dashboardService';
import logo from '../assets/logo-landela.png';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import SectionCard from '../components/ui/SectionCard';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Le backend renvoie `username` (pas `name`) via /auth/me.
  const displayName = user?.username || user?.name || 'Utilisateur';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getDashboard();

      if (!result?.success) {
        throw new Error(
          result?.message ||
            'Impossible de charger le tableau de bord.'
        );
      }

      setDashboard(result.data);
    } catch (err) {
      console.error('Erreur Dashboard:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Impossible de charger le tableau de bord.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-landela-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-landela-border border-t-landela-blue" />

          <p className="text-sm text-landela-text-secondary">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-landela-background px-6">
        <div className="w-full max-w-md rounded-[14px] border border-landela-border bg-landela-surface p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />

          <h2 className="mb-2 text-xl font-semibold text-landela-text">
            Erreur de chargement
          </h2>

          <p className="mb-6 text-sm leading-6 text-landela-text-secondary">
            {error}
          </p>

          <Button onClick={loadDashboard}>Réessayer</Button>
        </div>
      </div>
    );
  }

  const indicateurs = dashboard?.indicateurs_generaux || {};
  const pointage = dashboard?.pointage_du_jour || {};
  const pointageParClasse =
    dashboard?.pointage_par_classe || [];

  const totalEleves = indicateurs.total_eleves ?? 0;
  const totalPersonnel = indicateurs.total_personnel ?? 0;
  const totalPresences = indicateurs.total_presences ?? 0;

  const presents = pointage.presents ?? 0;
  const retards = pointage.retards ?? 0;
  const absents = pointage.absents ?? 0;

  const navigation = [
    {
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      active: true,
    },
    {
      label: 'Élèves',
      icon: Users,
      to: '/students',
    },
    {
      label: 'Présences',
      icon: ClipboardCheck,
    },
    {
      label: 'Cartes NFC',
      icon: CreditCard,
    },
    {
      label: 'Personnel',
      icon: UserCog,
    },
    {
      label: 'Paramètres',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-landela-background">
      {/* SIDEBAR */}
      <aside
        className="
          relative w-full bg-landela-blue text-white
          md:fixed md:inset-y-0 md:left-0 md:z-30
          md:w-[270px] md:overflow-y-auto
          lg:w-[300px]
        "
      >
        {/* BRAND */}
        <div
          className="
            flex min-h-[100px] items-center gap-4
            border-b border-white/10
            px-6 py-5
          "
        >
          <img
            src={logo}
            alt="LANDELA"
            className="h-20 w-20 shrink-0 object-contain"
          />

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              LANDELA
            </h1>

            <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-white/65">
              School Management
            </p>
          </div>

          {/* HAMBURGER (mobile only) */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/20 text-white transition hover:bg-white/10 md:hidden"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className={`${mobileOpen ? 'block' : 'hidden'} px-5 py-8 md:block`}>
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
            Navigation
          </p>

          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    if (item.to) navigate(item.to);
                  }}
                  className={`
                    flex w-full items-center gap-4 rounded-[10px]
                    px-4 py-3.5 text-left text-[15px] font-medium
                    transition
                    ${
                      item.active
                        ? 'bg-white text-landela-blue shadow-sm'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon
                    className="h-5 w-5 shrink-0"
                    strokeWidth={1.9}
                  />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* USER / LOGOUT */}
        <div className={`${mobileOpen ? 'block' : 'hidden'} border-t border-white/10 px-5 py-6 md:block`}>
          <div className="mb-5 flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>

              <p className="truncate text-xs text-white/55">
                {user?.email || ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full items-center justify-center gap-2
              rounded-[10px] border border-white/20
              px-4 py-3 text-sm font-medium
              text-white/90 transition
              hover:bg-white/10 hover:text-white
            "
          >
            <LogOut className="h-4 w-4" />

            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="min-h-screen md:ml-[270px] lg:ml-[300px]">
        {/* HEADER */}
        <header
          className="
            sticky top-0 z-20 flex min-h-[82px] items-center
            border-b border-landela-border
            bg-landela-surface/95 px-6 shadow-sm backdrop-blur
            lg:px-10
          "
        >
          <div>
            <p className="mb-1 text-sm font-medium text-landela-text-secondary">
              Administration
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-landela-text">
              Tableau de bord
            </h2>
          </div>
        </header>

        {/* CONTENT */}
        <div className="px-6 py-8 lg:px-10 lg:py-10">
          {/* WELCOME */}
          <Card className="mb-8 p-7 lg:mb-10 lg:p-8">
            <p className="mb-2 text-sm font-medium text-landela-blue">
              Bienvenue
            </p>

            <h3 className="text-2xl font-bold text-landela-text lg:text-[28px]">
              Bonjour {displayName}
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-landela-text-secondary">
              Voici un aperçu des activités et des statistiques
              de votre établissement.
            </p>

            <button
              type="button"
              onClick={() => navigate('/students/create')}
              className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-landela-blue px-5 py-3 text-sm font-medium text-white transition hover:bg-landela-blue-dark"
            >
              <UserPlus className="h-4 w-4" strokeWidth={2} />
              Ajouter un élève
            </button>
          </Card>

          {/* GENERAL STATS */}
          <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:mb-10 xl:grid-cols-3">
            {/* STUDENTS */}
            <StatCard
              label="Total élèves"
              value={totalEleves}
              hint="Élèves enregistrés"
              icon={<GraduationCap className="h-7 w-7" strokeWidth={1.8} />}
              iconClassName="bg-landela-blue-light text-landela-blue"
            />

            {/* STAFF */}
            <StatCard
              label="Total personnel"
              value={totalPersonnel}
              hint="Membres du personnel"
              icon={<BriefcaseBusiness className="h-7 w-7" strokeWidth={1.8} />}
              iconClassName="bg-emerald-50 text-emerald-600"
            />

            {/* ATTENDANCE */}
            <StatCard
              label="Présences enregistrées"
              value={totalPresences}
              hint="Total des pointages"
              icon={<ClipboardCheck className="h-7 w-7" strokeWidth={1.8} />}
              iconClassName="bg-violet-50 text-violet-600"
            />
          </section>

          {/* DAILY STATUS */}
          <section className="mb-8 grid grid-cols-1 gap-6 xl:mb-10 xl:grid-cols-[2fr_1fr]">
            {/* STATUS */}
            <SectionCard
              title="Pointage du jour"
              subtitle="Situation actuelle des présences"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* PRESENTS */}
                <div className="min-h-[90px] rounded-[12px] bg-emerald-50 p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />

                    <span className="text-sm font-medium text-emerald-800">
                      Présents
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-bold text-emerald-700">
                    {presents}
                  </p>
                </div>

                {/* LATE */}
                <div className="min-h-[90px] rounded-[12px] bg-orange-50 p-5">
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-6 w-6 text-orange-600" />

                    <span className="text-sm font-medium text-orange-800">
                      Retards
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-bold text-orange-700">
                    {retards}
                  </p>
                </div>

                {/* ABSENT */}
                <div className="min-h-[90px] rounded-[12px] bg-red-50 p-5">
                  <div className="flex items-center gap-3">
                    <UserX className="h-6 w-6 text-red-600" />

                    <span className="text-sm font-medium text-red-800">
                      Absents
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-bold text-red-700">
                    {absents}
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* CLASS ATTENDANCE */}
            <SectionCard
              title="Pointage par classe"
              subtitle="Suivi des élèves pointés"
            >
              {pointageParClasse.length > 0 ? (
                <div className="space-y-3">
                  {pointageParClasse.map((classe) => (
                    <div
                      key={classe.id_classe}
                      className="flex items-center justify-between rounded-[10px] border border-landela-border bg-landela-background p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-landela-text">
                          {classe.nom_classe}
                        </p>

                        <p className="mt-1 text-xs text-landela-text-secondary">
                          {classe.eleves_pointes} /{' '}
                          {classe.total_eleves} pointés
                        </p>
                      </div>

                      <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-landela-blue-light px-2 text-sm font-semibold text-landela-blue">
                        {classe.eleves_pointes}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <LayoutDashboard
                    className="mb-4 h-12 w-12 text-landela-border"
                    strokeWidth={1.5}
                  />

                  <p className="text-sm font-semibold text-landela-text-secondary">
                    Aucune donnée disponible
                  </p>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-landela-text-light">
                    Les données de pointage par classe
                    apparaîtront ici.
                  </p>
                </div>
              )}
            </SectionCard>
          </section>

          {/* RECENT ACTIVITIES */}
          <section className="mb-10">
            <SectionCard
              title="Dernières activités"
              subtitle="Activités récentes de l’établissement"
            >
              <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                <ClipboardCheck
                  className="mb-4 h-12 w-12 text-landela-border"
                  strokeWidth={1.5}
                />

                <p className="text-sm font-semibold text-landela-text-secondary">
                  Aucune activité récente
                </p>

                <p className="mt-1 max-w-sm text-xs leading-5 text-landela-text-light">
                  Les dernières activités de
                  l’établissement apparaîtront ici.
                </p>
              </div>
            </SectionCard>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-landela-border bg-landela-surface px-6 py-6 text-center lg:px-10">
          <p className="text-xs text-landela-text-light">
            © 2026 LANDELA Technologies. Tous droits réservés.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;
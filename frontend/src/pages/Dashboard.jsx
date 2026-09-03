import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { getDashboard } from '../services/dashboardService';
import logo from '../assets/logo-landela.png';
import './Dashboard.css';

import {
  LayoutGrid,
  GraduationCap,
  CheckCircle,
  Nfc,
  Users,
  Cog,
  LogOut,
  ChevronDown,
  Clock,
} from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');

      const result = await getDashboard();

      if (!result?.success) {
        throw new Error(
          result?.message || 'Impossible de charger le tableau de bord.'
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
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
   * État de chargement
   */
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  /*
   * État d'erreur
   */
  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Impossible de charger le tableau de bord</h2>

        <p>{error}</p>

        <button onClick={loadDashboard}>
          Réessayer
        </button>
      </div>
    );
  }

  /*
   * Données du dashboard
   */
  const indicateurs = dashboard?.indicateurs_generaux || {};
  const pointage = dashboard?.pointage_du_jour || {};
  const pointageParClasse = dashboard?.pointage_par_classe || [];

  const totalEleves = indicateurs.total_eleves ?? 0;
  const totalPersonnel = indicateurs.total_personnel ?? 0;
  const totalPresences = indicateurs.total_presences ?? 0;

  const presents = pointage.presents ?? 0;
  const retards = pointage.retards ?? 0;
  const absents = pointage.absents ?? 0;

  return (
    <div className="dashboard-layout">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside className="sidebar">

        {/* LOGO LANDELA */}
        <div className="brand">
          <img
            src={logo}
            alt="LANDELA"
            className="brand-logo"
          />

          <div className="brand-text">
            <h1>LANDELA</h1>
            <p>School Management</p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="navigation">

          <p className="nav-title">
            NAVIGATION
          </p>

          <ul>

            <li className="active">
              <a href="#">
                <LayoutGrid size={26} strokeWidth={2} />
                <span>Tableau de bord</span>
              </a>
            </li>

            <li>
              <a href="#">
                <GraduationCap size={26} strokeWidth={2} />
                <span>Élèves</span>
              </a>
            </li>

            <li>
              <a href="#">
                <CheckCircle size={26} strokeWidth={2} />
                <span>Présences</span>
              </a>
            </li>

            <li>
              <a href="#">
                <Nfc size={26} strokeWidth={2} />
                <span>Cartes NFC</span>
              </a>
            </li>

            <li>
              <a href="#">
                <Users size={26} strokeWidth={2} />
                <span>Personnel</span>
              </a>
            </li>

            <li>
              <a href="#">
                <Cog size={26} strokeWidth={2} />
                <span>Paramètres</span>
              </a>
            </li>

          </ul>
        </nav>

        {/* =================================================
            PROFIL UTILISATEUR
        ================================================== */}
        <div className="sidebar-footer">

          <div className="user-info">

            <div className="avatar">
              {(user?.username || user?.name || 'A')
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-text">

              <strong>
                {user?.username ||
                  user?.name ||
                  'Administrateur'}
              </strong>

              <p>
                {user?.email ||
                  'admin@landela.com'}
              </p>

            </div>

            <ChevronDown
              size={20}
              className="dropdown-icon"
            />

          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >
            <LogOut
              size={21}
              strokeWidth={2}
            />

            <span>Se déconnecter</span>
          </button>

        </div>
      </aside>

      {/* =====================================================
          CONTENU PRINCIPAL
      ====================================================== */}
      <main className="dashboard-main">

        {/* HEADER */}
        <header className="main-header">

          <h2>
            Tableau de bord
          </h2>

        </header>

        {/* =================================================
            CORPS
        ================================================== */}
        <div className="dashboard-body">

          {/* BIENVENUE */}
          <section className="welcome-section">

            <div className="welcome-card">

              <h3>
                Bonjour,{' '}
                {user?.username ||
                  user?.name ||
                  'Administrateur'}
              </h3>

              <p>
                Voici un aperçu de l'activité
                de votre établissement.
              </p>

            </div>

          </section>

          {/* =================================================
              STATISTIQUES
          ================================================== */}
          <section className="stats-grid">

            {/* TOTAL ÉLÈVES */}
            <div className="stat-card blue">

              <div className="stat-card-icon-wrapper">
                <GraduationCap
                  size={32}
                  strokeWidth={2}
                  className="stat-card-icon"
                />
              </div>

              <div className="stat-value">

                <p>
                  Total élèves
                </p>

                <strong>
                  {totalEleves}
                </strong>

                <p className="sub-text">
                  Élèves inscrits
                </p>

              </div>

            </div>

            {/* TOTAL PERSONNEL */}
            <div className="stat-card green">

              <div className="stat-card-icon-wrapper">
                <Users
                  size={32}
                  strokeWidth={2}
                  className="stat-card-icon"
                />
              </div>

              <div className="stat-value">

                <p>
                  Total personnel
                </p>

                <strong>
                  {totalPersonnel}
                </strong>

                <p className="sub-text">
                  Membres
                </p>

              </div>

            </div>

            {/* TOTAL PRÉSENCES */}
            <div className="stat-card purple">

              <div className="stat-card-icon-wrapper">
                <CheckCircle
                  size={32}
                  strokeWidth={2}
                  className="stat-card-icon"
                />
              </div>

              <div className="stat-value">

                <p>
                  Total présences
                </p>

                <strong>
                  {totalPresences}
                </strong>

                <p className="sub-text">
                  Enregistrements
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              POINTAGE DU JOUR + POINTAGE PAR CLASSE
          ================================================== */}
          <section className="daily-status-container">

            {/* POINTAGE DU JOUR */}
            <div className="panel daily-panel">

              <h4>
                Pointage du jour
              </h4>

              <div className="daily-grid">

                {/* PRÉSENTS */}
                <div className="status-item present">

                  <GraduationCap
                    size={28}
                    strokeWidth={2}
                  />

                  <span>
                    Présents
                  </span>

                  <strong>
                    {presents}
                  </strong>

                </div>

                {/* RETARDS */}
                <div className="status-item retards">

                  <Clock
                    size={28}
                    strokeWidth={2}
                  />

                  <span>
                    Retards
                  </span>

                  <strong>
                    {retards}
                  </strong>

                </div>

                {/* ABSENTS */}
                <div className="status-item absents">

                  <Users
                    size={28}
                    strokeWidth={2}
                  />

                  <span>
                    Absents
                  </span>

                  <strong>
                    {absents}
                  </strong>

                </div>

              </div>

            </div>

            {/* POINTAGE PAR CLASSE */}
            <div className="panel class-panel">

              <h4>
                Pointage par classe
              </h4>

              {pointageParClasse.length > 0 ? (

                <div className="class-list">

                  {pointageParClasse.map((classe) => (

                    <div
                      className="class-item"
                      key={classe.id_classe}
                    >

                      <div>
                        <strong>
                          {classe.nom_classe}
                        </strong>

                        <span>
                          {classe.eleves_pointes} /{' '}
                          {classe.total_eleves} pointés
                        </span>
                      </div>

                      <span className="class-count">
                        {classe.eleves_pointes}
                      </span>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="empty-state">

                  <LayoutGrid
                    size={56}
                    strokeWidth={1.5}
                    className="empty-state-icon"
                  />

                  <p>
                    Aucune donnée disponible
                  </p>

                  <span className="sub-text">
                    Les données de pointage par
                    classe apparaîtront ici.
                  </span>

                </div>

              )}

            </div>

          </section>

          {/* =================================================
              DERNIÈRES ACTIVITÉS
          ================================================== */}
          <section className="activities-panel-section">

            <div className="panel activities-panel">

              <h4>
                Dernières activités
              </h4>

              <div className="empty-state">

                <LayoutGrid
                  size={56}
                  strokeWidth={1.5}
                  className="empty-state-icon"
                />

                <p>
                  Aucune activité récente
                </p>

                <span className="sub-text">
                  Les dernières activités de
                  l'établissement apparaîtront ici.
                </span>

              </div>

            </div>

          </section>

        </div>

        {/* FOOTER */}
        <footer className="main-footer">

          <p>
            © 2026 LANDELA Technologies.
            Tous droits réservés.
          </p>

        </footer>

      </main>

    </div>
  );
}

export default Dashboard;
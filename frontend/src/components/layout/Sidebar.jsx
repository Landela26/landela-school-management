import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  School,
  ClipboardCheck,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";
import logo from "../../assets/logo-landela.png";
import { useAuth } from "../../context/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/eleves", label: "Élèves", icon: GraduationCap },
  { to: "/classes", label: "Classes", icon: School },
  { to: "/presences", label: "Présences", icon: ClipboardCheck },
  { to: "/personnel", label: "Personnel", icon: UserCog },
  { to: "/parametres", label: "Paramètres", icon: Settings },
];

function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-navy text-white">
      {/* Header / Logo */}
      <div className="flex h-16 items-center" style={{ paddingLeft: "24px", paddingRight: "24px" }}>
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="LANDELA"
            className="h-8 w-8 shrink-0 rounded-md object-contain"
          />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            LANDELA
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav 
        className="flex flex-1 flex-col gap-2 pt-4" 
        style={{ paddingLeft: "16px", paddingRight: "16px" }}
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={{ width: "100%", boxSizing: "border-box", paddingLeft: "16px", paddingRight: "16px" }}
            className={({ isActive }) =>
              `group flex h-11 items-center gap-3.5 rounded-md text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                    isActive
                      ? "bg-gold/15 text-gold"
                      : "text-white/40 group-hover:text-white/80"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <span className="leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout avec marge explicite au-dessus du bouton (mt-2) */}
      <div style={{ padding: "16px" }}>
        <div className="border-t border-white/10 pt-2">
          <button
            type="button"
            onClick={logout}
            style={{ 
              width: "100%", 
              boxSizing: "border-box", 
              paddingLeft: "16px", 
              paddingRight: "16px",
              marginTop: "8px" 
            }}
            className="group flex h-11 items-center gap-3.5 rounded-md text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/40 transition-colors group-hover:text-white/80">
              <LogOut size={18} strokeWidth={1.8} />
            </div>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
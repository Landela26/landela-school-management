import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { AlertCircle } from "lucide-react";
import logo from "../assets/logo-landela.png";

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    general: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors.general) {
      setErrors({ general: "" });
    }
  };
  const validateForm = () => {
    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setErrors({ general: "Identifiant ou mot de passe incorrect." });
      return false;
    }

    if (email.length > 254) {
      setErrors({ general: "Identifiant ou mot de passe incorrect." });
      return false;
    }

    if (/\s/.test(email)) {
      setErrors({ general: "Identifiant ou mot de passe incorrect." });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(email)) {
      setErrors({ general: "Identifiant ou mot de passe incorrect." });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrors({ general: "" });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const email = formData.email.trim();
      await login(email, formData.password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 || status === 422) {
        setErrors({ general: "Identifiant ou mot de passe incorrect." });

        setFormData((previous) => ({
          ...previous,
          password: "",
        }));
      } else {
        setErrors({ general: "Une erreur est survenue. Veuillez réessayer." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    "Suivi des présences en temps réel",
    "Données centralisées & sécurisées",
    "Fonctionnement adapté aux organisations",
    "Rapports & statistiques automatisés",
    "Gestion d'établissement",
  ];

  return (
    <main className="flex min-h-screen font-sans bg-white">
      {/* =========================
          PARTIE GAUCHE
      ========================== */}
      <section className="hidden md:flex flex-1 items-center justify-center bg-navy text-white p-12">
        <div className="max-w-[400px] w-full">
          <img
            src={logo}
            alt="LANDELA Technologies"
            className="max-w-[200px] h-auto block mb-10"
          />

          <h1 className="font-display text-[2.4rem] font-light leading-tight mb-4 text-white">
            La présence, simplement.
          </h1>

          <p className="text-white/70 leading-relaxed mb-10">
            Une gestion intelligente et centralisée de la présence pour les
            établissements et organisations.
          </p>

          <div
            className="group h-[130px] overflow-hidden relative
              [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]
              [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
          >
            <div className="flex flex-col gap-3.5 animate-scroll-vertical motion-reduce:animate-none group-hover:[animation-play-state:paused]">
              {[...features, ...features].map((feature, index) => (
                <div
                  key={`${feature}-${index}`}
                  className="flex items-center gap-3 text-[0.9rem] text-white/70"
                >
                  <span className="text-white/40" aria-hidden="true">
                    —
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          PARTIE DROITE
      ========================== */}
      <section className="flex-1 flex items-center justify-center p-8 bg-panel">
        <div className="w-full max-w-[380px] bg-[radial-gradient(circle_at_top_left,rgba(11,43,74,0.035),transparent_55%)] bg-white rounded-2xl px-9 py-11 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] flex flex-col items-center text-center">
          {/* Logo */}
          <img
            src={logo}
            alt="LANDELA"
            className="w-14 h-14 object-contain mb-6"
          />

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-medium text-slate-900 mb-1.5">
              Bienvenue
            </h2>

            <p className="text-slate-500 text-sm">
              Connectez-vous à votre compte LANDELA.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full" noValidate>
            {/* EMAIL */}
            <div className="mb-4 text-left">
              <div className="flex items-center bg-panel rounded-lg px-4 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-navy-light/30">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemple@organisation.com"
                  autoComplete="username"
                  maxLength={254}
                  inputMode="email"
                  aria-label="Adresse email"
                  aria-invalid={Boolean(errors.general)}
                  className="w-full py-3 border-none bg-transparent outline-none text-[0.9rem] text-slate-800 placeholder:text-slate-400
                    min-w-0
                    [&:-webkit-autofill]:[-webkit-text-fill-color:#1e293b]
                    [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]"
                />
              </div>
            </div>

            {/* MOT DE PASSE */}
            <div className="mb-4 text-left">
              <div className="flex items-center bg-panel rounded-lg px-4 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-navy-light/30">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Entrez votre mot de passe"
                  autoComplete="current-password"
                  aria-label="Mot de passe"
                  aria-invalid={Boolean(errors.general)}
                  className="w-full py-3 border-none bg-transparent outline-none text-[0.9rem] text-slate-800 placeholder:text-slate-400 min-w-0"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  className="bg-transparent border-none text-navy text-xs font-medium cursor-pointer pl-2 shrink-0"
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            {/* MOT DE PASSE OUBLIÉ */}
            <div className="w-full flex justify-end mb-5">
              <Link
                to="/forgot-password"
                className="text-slate-500 text-[0.78rem] font-medium no-underline hover:text-navy transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* MESSAGE GLOBAL */}
            {errors.general && (
              <div
                role="alert"
                aria-live="polite"
                className="w-full flex items-center gap-2.5 mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-[0.82rem] font-medium text-left"
              >
                <AlertCircle
                  size={18}
                  aria-hidden="true"
                  className="shrink-0"
                />
                <span>{errors.general}</span>
              </div>
            )}

            {/* BOUTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-navy text-white text-[0.95rem] font-medium cursor-pointer transition-colors hover:enabled:bg-navy-dark active:enabled:bg-navy-dark disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <p className="text-center mt-9 text-xs text-slate-400">
            LANDELA · Gestion intelligente de la présence
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;

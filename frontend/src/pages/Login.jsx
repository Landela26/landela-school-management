import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import logo from '../assets/logo-landela.png'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({
    general: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (errors.general) {
      setErrors({ general: '' })
    }
  }

  const validateForm = () => {
    const email = formData.email.trim()
    const password = formData.password


    if (!email || !password.trim()) {
      setErrors({
        general: 'Identifiant ou mot de passe incorrect.',
      })

      return false
    }


    if (email.length > 254) {
      setErrors({
        general: 'Identifiant ou mot de passe incorrect.',
      })

      return false
    }

 
    if (/\s/.test(email)) {
      setErrors({
        general: 'Identifiant ou mot de passe incorrect.',
      })

      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

    if (!emailRegex.test(email)) {
      setErrors({
        general: 'Identifiant ou mot de passe incorrect.',
      })

      return false
    }

    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setErrors({ general: '' })

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {

      const email = formData.email.trim()

      await login(email, formData.password)

      navigate('/dashboard', { replace: true })
    } catch (error) {
      const status = error?.response?.status

    
      if (status === 401 || status === 422) {
        setErrors({
          general: 'Identifiant ou mot de passe incorrect.',
        })
      } else {
        setErrors({
          general:
            'Une erreur est survenue. Veuillez réessayer.',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">

      {/* =========================
          PARTIE GAUCHE
      ========================== */}
      <section className="login-brand">
        <div className="brand-content">

          <img
            src={logo}
            alt="LANDELA Technologies"
            className="brand-logo"
          />

          <h1>
            La présence,
            <span> simplement.</span>
          </h1>

          <p className="brand-description">
            Une gestion intelligente et centralisée de la présence
            pour les établissements et organisations.
          </p>

          <div className="brand-features-carousel">
            <div className="carousel-track">

              {[
                'Suivi des présences en temps réel',
                'Données centralisées & sécurisées',
                'Fonctionnement adapté aux organisations',
                'Rapports & statistiques automatisés',
                "Gestion d'établissement",

                'Suivi des présences en temps réel',
                'Données centralisées & sécurisées',
                'Fonctionnement adapté aux organisations',
                'Rapports & statistiques automatisés',
                "Gestion d'établissement",
              ].map((feature, index) => (
                <div
                  key={`${feature}-${index}`}
                  className="feature-item"
                >
                  <span className="feature-check">
                    ✓
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
      <section className="login-panel">

        <div className="neumorphic-card">

          {/* Logo */}
          <div className="neumorphic-logo-container">
            <img
              src={logo}
              alt="LANDELA"
              className="neumorphic-logo"
            />
          </div>

          {/* Header */}
          <div className="login-header">
            <p className="eyebrow">
              ESPACE DE TRAVAIL
            </p>

            <h2>
              Bienvenue
            </h2>

            <p>
              Connectez-vous à votre compte LANDELA.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="neumorphic-form"
            noValidate
          >

            {/* EMAIL */}
            <div className="form-group">

              <div className="input-wrapper">

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
                />

              </div>

            </div>

            {/* MOT DE PASSE */}
            <div className="form-group">

              <div className="input-wrapper">

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Entrez votre mot de passe"
                  autoComplete="current-password"
                  aria-label="Mot de passe"
                  aria-invalid={Boolean(errors.general)}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label={
                    showPassword
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>

              </div>

            </div>

            {/* MOT DE PASSE OUBLIÉ */}
            <div className="forgot-password-container">

              <Link
                to="/forgot-password"
                className="forgot-password"
              >
                Mot de passe oublié ?
              </Link>

            </div>

            {/* MESSAGE GLOBAL */}
            {errors.general && (
              <div
                className="general-error"
                role="alert"
                aria-live="polite"
              >
                <span className="error-icon" aria-hidden="true">
                  !
                </span>

                <span>
                  {errors.general}
                </span>
              </div>
            )}

            {/* BOUTON */}
            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>

          </form>

          <p className="login-footer">
            LANDELA · Gestion intelligente de la présence
          </p>

        </div>

      </section>

    </main>
  )
}

export default Login

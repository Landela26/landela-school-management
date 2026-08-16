import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthProvider";
import logo from '../assets/logo-landela.png'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
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

    setErrors((previous) => ({
      ...previous,
      [name]: '',
    }))

    setGeneralError('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'L’adresse email est obligatoire.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L’adresse email n’est pas valide.'
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire.'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setGeneralError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await login(formData.email, formData.password)

      navigate('/dashboard', { replace: true })
    } catch (error) {
      const responseData = error?.response?.data

      if (error?.status === 422) {
        setErrors(responseData?.errors || {})
      } else if (error?.status === 401) {
        setGeneralError(
          responseData?.message || 'Email ou mot de passe incorrect.',
        )
      } else {
        setGeneralError(
          'Une erreur est survenue. Veuillez réessayer.',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-content">
          <img src={logo} alt="LANDELA" className="brand-logo" />

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
                "Suivi des présences en temps réel",
                "Données centralisées & sécurisées",
                "Fonctionnement adapté aux organisations",
                "Rapports & statistiques automatisés",
                "Gestion multi-établissements",
                // Duplication pour la boucle infinie sans saut
                "Suivi des présences en temps réel",
                "Données centralisées & sécurisées",
                "Fonctionnement adapté aux organisations",
                "Rapports & statistiques automatisés",
                "Gestion multi-établissements"
              ].map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-check">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
<section className="login-panel">
        <div className="neumorphic-card">
          

          {/* CERCLE NEUMORPHIQUE AVEC LE LOGO */}
          <div className="neumorphic-logo-container">
            <img src={logo} alt="LANDELA" className="neumorphic-logo" />
          </div>

          <div className="login-header">
            <p className="eyebrow">ESPACE DE TRAVAIL</p>
            <h2>Bienvenue</h2>
            <p>Connectez-vous à votre compte LANDELA.</p>
          </div>

          {generalError && (
            <div className="general-error" role="alert">
              <span>!</span>
              <p>{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="neumorphic-form" noValidate>
            {/* CHAMP EMAIL ENFONCÉ */}
            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemple@organisation.com"
                  autoComplete="email"
                  className={`neumorphic-input ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && <small className="field-error">{errors.email}</small>}
            </div>

            {/* CHAMP MOT DE PASSE ENFONCÉ */}
            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Entrez votre mot de passe"
                  autoComplete="current-password"
                  className={`neumorphic-input ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              {errors.password && <small className="field-error">{errors.password}</small>}
            </div>

            {/* BOUTON SE CONNECTER */}
            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
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
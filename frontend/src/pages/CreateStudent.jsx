import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { createStudent } from '../services/studentService'
import StudentForm from '../components/forms/StudentForm'

const emptyForm = {
  nom: '', postnom: '', prenom: '', matricule: '',
  sexe: '', dateNaissance: '', adresse: '', photo: null,
}

export default function CreateStudent() {
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value, type, files } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'file' ? files?.[0] ?? null : value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    setError('')
  }

  const validateForm = () => {
    const errors = {}
    if (!form.nom.trim()) errors.nom = 'Le nom est obligatoire.'
    if (!form.postnom.trim()) errors.postnom = 'Le postnom est obligatoire.'
    if (!form.prenom.trim()) errors.prenom = 'Le prénom est obligatoire.'
    if (!form.sexe) errors.sexe = 'Veuillez sélectionner le sexe.'
    if (!form.dateNaissance) errors.dateNaissance = 'La date de naissance est obligatoire.'
    if (!form.adresse.trim()) errors.adresse = "L'adresse est obligatoire."
    if (form.photo && form.photo.size > 2 * 1024 * 1024) errors.photo = 'La photo ne doit pas dépasser 2 Mo.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(''); setSuccess('')
    if (!validateForm()) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('nom', form.nom.trim())
      formData.append('postnom', form.postnom.trim())
      formData.append('prenom', form.prenom.trim())
      if (form.matricule.trim()) formData.append('matricule', form.matricule.trim())
      formData.append('sexe', form.sexe)
      formData.append('dateNaissance', form.dateNaissance)
      formData.append('adresse', form.adresse.trim())
      if (form.photo) formData.append('photo', form.photo)

      const response = await createStudent(formData)
      setSuccess(response?.message || 'L’élève a été créé avec succès.')
      setForm(emptyForm)
      const fileInput = document.getElementById('photo')
      if (fileInput) fileInput.value = ''
    } catch (err) {
      console.error('Erreur création élève :', err)
      if (err.response?.status === 422) {
        const backendErrors = err.response?.data?.errors || {}
        const mapped = {}
        Object.entries(backendErrors).forEach(([field, messages]) => {
          mapped[field] = Array.isArray(messages) ? messages[0] : messages
        })
        setFieldErrors(mapped)
        setError(err.response?.data?.message || 'Veuillez corriger les informations indiquées.')
      } else if (err.response?.status === 401) {
        setError('Votre session a expiré. Veuillez vous reconnecter.')
      } else if (err.response?.status >= 500) {
        setError('Une erreur serveur est survenue. Veuillez réessayer.')
      } else {
        setError('Impossible de créer l’élève. Vérifiez votre connexion et réessayez.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => navigate('/eleves')

  return (
    <div className="mx-auto max-w-3xl p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={handleCancel} aria-label="Retour à la liste"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Gestion des élèves</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Ajouter un élève</h1>
        </div>
      </div>

      <StudentForm
        form={form}
        fieldErrors={fieldErrors}
        loading={loading}
        success={success}
        error={error}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onDismissSuccess={() => setSuccess('')}
      />
    </div>
  )
}

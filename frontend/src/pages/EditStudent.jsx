import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, PencilLine } from 'lucide-react';

import { getStudent, updateStudent } from '../services/studentService';
import PageHeader from '../components/ui/PageHeader';
import StudentForm from '../components/forms/StudentForm';

const emptyForm = {
  nom: '',
  postnom: '',
  prenom: '',
  matricule: '',
  sexe: '',
  dateNaissance: '',
  adresse: '',
  photo: null,
};

export default function EditStudent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        setInitialLoading(true);
        setError('');

        const response = await getStudent(id);
        const student = response?.data || response;

        if (!student) {
          throw new Error('Étudiant introuvable.');
        }

        setForm({
          nom: student.nom || '',
          postnom: student.postnom || '',
          prenom: student.prenom || '',
          matricule: student.matricule || '',
          sexe: student.sexe || '',
          dateNaissance: student.date_naissance
            ? new Date(student.date_naissance).toISOString().slice(0, 10)
            : '',
          adresse: student.adresse || '',
          photo: null,
        });
      } catch (err) {
        console.error('Erreur lors du chargement de l’élève :', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Impossible de charger les informations de l’élève.'
        );
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      loadStudent();
    }
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === 'file' ? files?.[0] ?? null : value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: '',
    }));

    setError('');
  };

  const validateForm = () => {
    const errors = {};

    if (!form.nom.trim()) {
      errors.nom = 'Le nom est obligatoire.';
    }

    if (!form.postnom.trim()) {
      errors.postnom = 'Le postnom est obligatoire.';
    }

    if (!form.prenom.trim()) {
      errors.prenom = 'Le prénom est obligatoire.';
    }

    if (!form.sexe) {
      errors.sexe = 'Veuillez sélectionner le sexe.';
    }

    if (!form.dateNaissance) {
      errors.dateNaissance = 'La date de naissance est obligatoire.';
    }

    if (!form.adresse.trim()) {
      errors.adresse = "L'adresse est obligatoire.";
    }

    if (form.photo && form.photo.size > 2 * 1024 * 1024) {
      errors.photo = 'La photo ne doit pas dépasser 2 Mo.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('_method', 'PUT');
      formData.append('nom', form.nom.trim());
      formData.append('postnom', form.postnom.trim());
      formData.append('prenom', form.prenom.trim());

      if (form.matricule.trim()) {
        formData.append('matricule', form.matricule.trim());
      }

      formData.append('sexe', form.sexe);
      formData.append('dateNaissance', form.dateNaissance);
      formData.append('adresse', form.adresse.trim());

      if (form.photo) {
        formData.append('photo', form.photo);
      }

      const response = await updateStudent(id, formData);

      setSuccess(
        response?.message || 'Les informations de l’élève ont été mises à jour.'
      );
    } catch (err) {
      console.error('Erreur lors de la modification de l’élève :', err);

      if (err.response?.status === 422) {
        const backendErrors = err.response?.data?.errors || {};
        const mappedErrors = {};

        Object.entries(backendErrors).forEach(([field, messages]) => {
          mappedErrors[field] = Array.isArray(messages)
            ? messages[0]
            : messages;
        });

        setFieldErrors(mappedErrors);
        setError(
          err.response?.data?.message ||
            'Veuillez corriger les informations indiquées.'
        );
      } else if (err.response?.status === 401) {
        setError(
          'Votre session a expiré. Veuillez vous reconnecter.'
        );
      } else if (err.response?.status >= 500) {
        setError(
          'Une erreur serveur est survenue. Veuillez réessayer.'
        );
      } else {
        setError(
          'Impossible de modifier l’élève. Vérifiez votre connexion et réessayez.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/dashboard');

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-landela-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-landela-blue" />
          <p className="text-sm text-landela-text-secondary">
            Chargement des informations de l’élève...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-landela-background">
      <PageHeader
        eyebrow="Gestion des élèves"
        title="Modifier un élève"
        subtitle="Mettez à jour les informations de l’élève sélectionné."
        action={
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-landela-border text-landela-text-secondary transition hover:bg-landela-background hover:text-landela-text"
            aria-label="Retour au tableau de bord"
          >
            <ArrowLeft size={19} />
          </button>
        }
        icon={<PencilLine size={21} />}
      />

      <main className="mx-auto max-w-3xl px-6 py-8 lg:px-8 lg:py-10">
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
          successTitle="Élève mis à jour"
          errorTitle="Impossible de modifier l’élève"
          submitLabel="Enregistrer les modifications"
          submittingLabel="Mise à jour..."
        />
      </main>
    </div>
  );
}

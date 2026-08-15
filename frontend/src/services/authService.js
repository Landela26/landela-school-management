const MOCK_USER = {
  user_id: 1,
  name: 'Administrateur LANDELA',
  email: 'admin@landela.test',
  role: 'admin',
}

const MOCK_TOKEN = 'mock-landela-token'

export async function login(email, password) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!email || !password) {
    const error = new Error('Échec de la validation.')
    error.status = 422
    error.response = {
      data: {
        success: false,
        message: 'Échec de la validation.',
        errors: {
          ...(!email && {
            email: 'L’adresse email est obligatoire.',
          }),
          ...(!password && {
            password: 'Le mot de passe est obligatoire.',
          }),
        },
      },
    }

    throw error
  }

  if (email !== MOCK_USER.email || password !== '123456') {
    const error = new Error('Email ou mot de passe incorrect.')
    error.status = 401
    error.response = {
      data: {
        success: false,
        message: 'Email ou mot de passe incorrect.',
      },
    }

    throw error
  }

  return {
    success: true,
    message: 'Connexion réussie.',
    data: {
      user: MOCK_USER,
      token: MOCK_TOKEN,
    },
  }
}

export async function getMe() {
  const token = localStorage.getItem('token')

  if (!token) {
    const error = new Error('Utilisateur non authentifié.')
    error.status = 401
    throw error
  }

  if (token !== MOCK_TOKEN) {
    const error = new Error('Utilisateur non authentifié.')
    error.status = 401
    throw error
  }

  return {
    success: true,
    message: 'Informations de l’utilisateur récupérées avec succès.',
    data: MOCK_USER,
  }
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, login as loginService, logout as logoutService } from '../services/authService';

// Création du contexte
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurer la session au démarrage
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await getMe();
        setUser(response.data);
      } catch (error) {
        console.error('Erreur de restauration :', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  // Connexion
  const login = async (email, password) => {
    const response = await loginService(email, password);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response;
  };

  // Déconnexion
  const logout = () => {
    logoutService();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,  // ← c'est ce que Login attend
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
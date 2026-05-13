import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('logistics_token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get('/auth/me');
        setUser(response.data.data || null);
      } catch {
        localStorage.removeItem('logistics_token');
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = async ({ email, password }) => {
    setError(null);
    const response = await API.post('/auth/login', {
      correo: email,
      contrasena: password
    });
    const bearer = response.data.data?.token;
    if (!bearer) {
      throw new Error('No se recibio token de autenticacion');
    }

    localStorage.setItem('logistics_token', bearer);
    setToken(bearer);
    setUser(response.data.data?.user || null);
    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    setError(null);
    localStorage.removeItem('logistics_token');
  };

  const value = useMemo(
    () => ({ user, token, login, logout, loading, authenticated: !!user, error }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

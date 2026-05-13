import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { authenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-loading">Cargando sesión...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.rol !== 'admin') {
    return (
      <div className="page-loading">
        Acceso denegado. Esta intranet es solo para administradores.
      </div>
    );
  }

  return children;
}

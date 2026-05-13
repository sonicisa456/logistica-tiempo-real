import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, authenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (authenticated) {
      navigate(from, { replace: true });
    }
  }, [authenticated, from, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Completa correo y contraseña.');
      return;
    }

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al iniciar sesion.');
    }
  };

  return (
    <div className="page-shell login-shell">
      <div className="login-panel">
        <h1>Iniciar sesión</h1>
        <p>Accede al panel de control de logística y gestiona tus rutas.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Contraseña
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="primary-button">Ingresar</button>
        </form>
        <p className="login-note">
          ¿No tienes cuenta? <Link to="/">Regresa al sitio</Link>
        </p>
      </div>
    </div>
  );
}

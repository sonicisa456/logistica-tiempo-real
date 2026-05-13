import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { authenticated, user, logout } = useAuth();

  return (
    <header className="navbar-shell">
      <div className="navbar-brand">
        <Link to="/" className="brand-logo">
          <span className="brand-mark">LR</span>
          <div>
            <strong>Logística</strong>
            <small>en Tiempo Real</small>
          </div>
        </Link>
      </div>
      <button className="mobile-toggle" type="button" onClick={() => setMenuOpen((value) => !value)}>
        <span />
        <span />
        <span />
      </button>
      <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" end onClick={() => setMenuOpen(false)}>
          Inicio
        </NavLink>
        <a href="#services" onClick={() => setMenuOpen(false)}>
          Servicios
        </a>
        <a href="#stats" onClick={() => setMenuOpen(false)}>
          Resultados
        </a>
        <a href="#tracking" onClick={() => setMenuOpen(false)}>
          Rastreo
        </a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>
          Contacto
        </a>
        {authenticated ? (
          <>
            <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>
            <button className="nav-cta" type="button" onClick={logout}>
              Salir
            </button>
          </>
        ) : (
          <NavLink to="/login" className="nav-cta" onClick={() => setMenuOpen(false)}>
            Iniciar sesión
          </NavLink>
        )}
      </nav>
      {authenticated && user && <span className="navbar-user">Bienvenido, {user.nombre || user.name}</span>}
    </header>
  );
}

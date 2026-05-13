import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const privateUrl = import.meta.env.VITE_PRIVATE_URL || 'http://localhost:3001/login';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar-shell">
      <div className="navbar-brand">
        <Link to="/" className="brand-logo">
          <span className="brand-mark">LR</span>
          <div>
            <strong>Logistica</strong>
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
        <a href="#products" onClick={() => setMenuOpen(false)}>
          Productos
        </a>
        <a href="#tracking" onClick={() => setMenuOpen(false)}>
          Rastreo
        </a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>
          Contacto
        </a>
        <a href={privateUrl} className="nav-cta" onClick={() => setMenuOpen(false)}>
          Intranet empleados
        </a>
      </nav>
    </header>
  );
}

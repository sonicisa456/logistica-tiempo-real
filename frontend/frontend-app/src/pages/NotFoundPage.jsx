import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-shell notfound-shell">
      <section className="notfound-card">
        <span className="eyebrow">404</span>
        <h1>Página no encontrada</h1>
        <p>La ruta solicitada no existe. Regresa al inicio o revisa el enlace.</p>
        <Link to="/" className="primary-button">Volver a inicio</Link>
      </section>
    </div>
  );
}

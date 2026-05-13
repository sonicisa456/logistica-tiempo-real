import { NavLink } from 'react-router-dom';

const menuItems = [
  { label: 'Resumen', id: 'overview' },
  { label: 'Pedidos', id: 'orders' },
  { label: 'Rutas', id: 'routes' },
  { label: 'Conductores', id: 'drivers' },
  { label: 'Productos', id: 'products' },
  { label: 'Incidencias', id: 'incidents' }
];

export default function DashboardSidebar() {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <strong>Centro de control</strong>
        <p>Operaciones 360°</p>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <a key={item.id} href={`#${item.id}`} className="sidebar-link">
            {item.label}
          </a>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>Panel de logística profesional para monitoreo de envíos, rutas y entregas.</p>
      </div>
    </aside>
  );
}

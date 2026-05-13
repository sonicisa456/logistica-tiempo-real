import { useEffect, useMemo, useState } from 'react';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import DeliveryChart from '../components/DeliveryChart';
import RouteMap from '../components/RouteMap';
import API from '../services/api';

const statusOptions = ['En preparacion', 'En camino', 'Entregado', 'Incidencia'];

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setError('');
    try {
      const [ordersResponse, driversResponse, incidentsResponse, productsResponse] = await Promise.all([
        API.get('/pedidos'),
        API.get('/conductores'),
        API.get('/incidencias'),
        API.get('/productos')
      ]);

      setOrders(ordersResponse.data.data || []);
      setDrivers(driversResponse.data.data || []);
      setIncidents(incidentsResponse.data.data || []);
      setProducts(productsResponse.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo cargar la intranet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = window.setInterval(loadDashboard, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const metrics = useMemo(() => {
    const active = orders.filter((order) => order.estado !== 'entregado').length;
    const delivered = orders.filter((order) => order.estado === 'entregado').length;
    return [
      { title: 'Pedidos activos', value: active },
      { title: 'Entregados', value: delivered },
      { title: 'Incidencias', value: incidents.length },
      { title: 'Productos', value: products.length },
      { title: 'Agotados', value: products.filter((product) => Number(product.stock) <= 0).length }
    ];
  }, [incidents.length, orders, products]);

  const updateOrderStatus = async (order, estado) => {
    const response = await API.put(`/pedidos/${order.id}`, { estado });
    setOrders((currentOrders) =>
      currentOrders.map((item) => (item.id === order.id ? response.data.data : item))
    );
  };

  const addStock = async (product, amount) => {
    const response = await API.put(`/productos/${product.id}`, {
      stock: Number(product.stock) + amount
    });
    setProducts((currentProducts) =>
      currentProducts.map((item) => (item.id === product.id ? response.data.data : item))
    );
  };

  if (loading) {
    return <div className="page-loading">Cargando intranet...</div>;
  }

  return (
    <div className="dashboard-shell">
      <DashboardSidebar />
      <main className="dashboard-main">
        <section className="dashboard-hero" id="overview">
          <div>
            <p className="section-kicker">Intranet privada</p>
            <h1>Dashboard interno para empleados.</h1>
          </div>
          <div className="dashboard-hero-actions">
            <a href="/" className="secondary-button">Ver sitio publico</a>
          </div>
        </section>

        {error && <p className="form-error">{error}</p>}

        <section className="metrics-grid">
          {metrics.map((metric) => (
            <article key={metric.title} className="metric-card">
              <span>{metric.title}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </section>

        <section className="panel-grid" id="orders">
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <p className="panel-label">Pedidos reales</p>
                <h3>Solicitudes recibidas desde Internet</h3>
              </div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Guia</th>
                    <th>Cliente</th>
                    <th>Destino</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Conductor</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>LR-{String(order.id).padStart(6, '0')}</td>
                      <td>{order.cliente || 'Cliente sin nombre'}</td>
                      <td>{order.destino || 'Sin destino'}</td>
                      <td>
                        {order.productos?.length > 0
                          ? order.productos.map((item) => `${item.nombre} x${item.cantidad}`).join(', ')
                          : 'Sin productos'}
                      </td>
                      <td>${Number(order.total || 0).toFixed(2)}</td>
                      <td>
                        <select
                          className="status-select"
                          value={order.estado || 'pendiente'}
                          onChange={(event) => updateOrderStatus(order, event.target.value)}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{order.conductor || 'Sin asignar'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel-card" id="routes">
            <div className="panel-header">
              <div>
                <p className="panel-label">Rutas</p>
                <h3>Mapa operativo</h3>
              </div>
            </div>
            <RouteMap />
          </div>
        </section>

        <section className="panel-grid" id="drivers">
          <DeliveryChart />
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <p className="panel-label">Conductores</p>
                <h3>Equipo en campo</h3>
              </div>
            </div>
            <div className="driver-list">
              {drivers.length === 0 && <p>Aun no hay conductores registrados.</p>}
              {drivers.map((driver) => (
                <article key={driver.id} className="driver-card">
                  <strong>{driver.nombre}</strong>
                  <span>{driver.ruta || 'Ruta sin asignar'}</span>
                  <small>{driver.estado}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="panel-card" id="products">
          <div className="panel-header">
            <div>
              <p className="panel-label">Productos</p>
              <h3>Catalogo administrado por intranet</h3>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoria</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Disponibilidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.nombre}</td>
                    <td>{product.categoria}</td>
                    <td>${Number(product.precio).toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>
                      {Number(product.stock) > 0 ? (
                        'Disponible'
                      ) : (
                        <span className="sold-out">Agotado · vuelve en 10 dias</span>
                      )}
                    </td>
                    <td>
                      <div className="stock-actions">
                        <button type="button" className="secondary-button" onClick={() => addStock(product, 1)}>
                          +1
                        </button>
                        <button type="button" className="secondary-button" onClick={() => addStock(product, 10)}>
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="incident-grid" id="incidents">
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <p className="panel-label">Incidencias</p>
                <h3>Alertas operativas</h3>
              </div>
            </div>
            <div className="incident-list">
              {incidents.length === 0 && <p>No hay incidencias registradas.</p>}
              {incidents.map((incident) => (
                <article key={incident.id} className="incident-card">
                  <h4>{incident.descripcion}</h4>
                  <p>{incident.fecha}</p>
                  <span>{incident.prioridad}</span>
                </article>
              ))}
            </div>
          </div>
          <div className="panel-card summary-card">
            <div className="panel-header">
              <div>
                <p className="panel-label">Sincronizacion</p>
                <h3>Internet conectado con intranet</h3>
              </div>
            </div>
            <div className="summary-list">
              <div>
                <span>Origen de pedidos</span>
                <strong>Landing publica</strong>
              </div>
              <div>
                <span>Base de datos</span>
                <strong>MySQL</strong>
              </div>
              <div>
                <span>Actualizacion publica</span>
                <strong>Rastreo</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

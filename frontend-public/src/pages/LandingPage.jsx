import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import API from '../services/api';

const services = [
  { title: 'Entrega de paquetes', description: 'Recolectamos, procesamos y entregamos paquetes para clientes y negocios.' },
  { title: 'Rastreo en tiempo real', description: 'El cliente consulta el estado que actualiza el empleado desde la intranet.' },
  { title: 'Operacion interna', description: 'La empresa gestiona pedidos, rutas, conductores, estados e incidencias.' }
];

const fallbackProductImage = 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80';

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [requestForm, setRequestForm] = useState({ cliente: '', destino: '' });
  const [requestResult, setRequestResult] = useState(null);
  const [requestError, setRequestError] = useState('');
  const [contactForm, setContactForm] = useState({ nombre: '', correo: '', mensaje: '' });
  const [contactResult, setContactResult] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = () => {
      API.get('/public/productos').then((response) => {
        setProducts(response.data.data || []);
      });
    };

    loadProducts();
    const interval = window.setInterval(loadProducts, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const cartSubtotal = useMemo(
    () => cart.reduce((total, item) => total + Number(item.precio) * item.cantidad, 0),
    [cart]
  );

  const addToCart = (product) => {
    if (Number(product.stock) <= 0) return;
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cantidad >= Number(product.stock)) return currentCart;
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...currentCart, { ...product, cantidad: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  };

  const handleTrack = async (event) => {
    event.preventDefault();
    setTrackingError('');
    setTrackingResult(null);
    if (!trackingCode.trim()) return;

    try {
      const response = await API.get(`/public/rastreo/${trackingCode.trim()}`);
      setTrackingResult(response.data.data);
    } catch (error) {
      setTrackingError(error.response?.data?.message || 'No encontramos ese pedido.');
    }
  };

  const handleCreateRequest = async (event) => {
    event.preventDefault();
    setRequestError('');
    try {
      const response = await API.post('/public/pedidos', {
        ...requestForm,
        productos: cart.map((item) => ({ id: item.id, cantidad: item.cantidad }))
      });
      setRequestResult(response.data.data);
      setTrackingCode(response.data.data.trackingCode);
      setRequestForm({ cliente: '', destino: '' });
      setCart([]);
      const productsResponse = await API.get('/public/productos');
      setProducts(productsResponse.data.data || []);
    } catch (error) {
      setRequestError(error.response?.data?.message || 'No se pudo crear el pedido.');
    }
  };

  const handleContact = async (event) => {
    event.preventDefault();
    await API.post('/public/contacto', contactForm);
    setContactResult('Mensaje enviado. El equipo lo revisara internamente.');
    setContactForm({ nombre: '', correo: '', mensaje: '' });
  };

  return (
    <div className="page-shell">
      <Navbar />
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Envios nacionales</span>
          <h1>Paqueteria moderna conectada con operaciones internas.</h1>
          <p>Clientes crean y rastrean pedidos desde Internet. Empleados gestionan esos mismos pedidos desde una intranet privada conectada a MySQL.</p>
          <div className="hero-actions">
            <a href="#request" className="primary-button">Crear pedido</a>
            <button type="button" onClick={() => navigate('/login')} className="secondary-button">
              Intranet empleados
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-card">
            <span className="card-label">Sistema conectado</span>
            <p>Cliente crea pedido, backend guarda en MySQL y dashboard interno lo recibe.</p>
            <p className="hero-status">Estado: <strong>sincronizado</strong></p>
          </div>
        </div>
      </section>

      <section className="service-section" id="services">
        <div className="section-heading">
          <p className="section-kicker">Servicios</p>
          <h2>Una empresa de logistica con sitio publico e intranet privada.</h2>
        </div>
        <div className="cards-grid">
          {services.map((service) => (
            <article key={service.title} className="feature-card">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="service-section" id="products">
        <div className="section-heading">
          <p className="section-kicker">Catalogo</p>
          <h2>Productos para simular compras tipo e-commerce.</h2>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <img src={product.imagen || fallbackProductImage} alt={product.nombre} />
              <div>
                <span className="product-category">{product.categoria}</span>
                <h3>{product.nombre}</h3>
                <p>{product.descripcion}</p>
                <strong>${Number(product.precio).toFixed(2)}</strong>
                {Number(product.stock) > 0 ? (
                  <small>Stock: {product.stock}</small>
                ) : (
                  <small className="sold-out">Agotado · Disponible nuevamente en 10 dias</small>
                )}
              </div>
              <button
                type="button"
                className="primary-button"
                disabled={Number(product.stock) <= 0}
                onClick={() => addToCart(product)}
              >
                {Number(product.stock) > 0 ? 'Agregar' : 'Agotado'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" id="cart">
        <div className="section-heading">
          <p className="section-kicker">Carrito</p>
          <h2>Compra simulada conectada al backend.</h2>
        </div>
        <div className="cart-panel">
          {cart.length === 0 && <p>Tu carrito esta vacio.</p>}
          {cart.map((item) => (
            <div key={item.id} className="cart-row">
              <div>
                <strong>{item.nombre}</strong>
                <span>Cantidad: {item.cantidad}</span>
              </div>
              <div>
                <strong>${(Number(item.precio) * item.cantidad).toFixed(2)}</strong>
                <button type="button" className="secondary-button" onClick={() => removeFromCart(item.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <span>{cart.length} productos</span>
            <strong>Subtotal: ${cartSubtotal.toFixed(2)}</strong>
          </div>
        </div>
      </section>

      <section className="tracking-section" id="tracking">
        <div className="tracking-copy">
          <p className="section-kicker">Rastreo</p>
          <h2>Consulta el estado actualizado por empleados.</h2>
          <form className="tracking-form" onSubmit={handleTrack}>
            <input
              type="text"
              placeholder="Ejemplo: LR-000001"
              value={trackingCode}
              onChange={(event) => setTrackingCode(event.target.value)}
            />
            <button type="submit">Rastrear</button>
          </form>
          {trackingError && <p className="form-error">{trackingError}</p>}
          {trackingResult && (
            <div className="tracking-result">
              <span>{trackingResult.destino}</span>
              <strong>{trackingResult.estado}</strong>
              <small>Cliente: {trackingResult.cliente}</small>
              <small>Guia: {trackingResult.trackingCode}</small>
              {trackingResult.productos?.length > 0 && (
                <small>
                  Productos: {trackingResult.productos.map((item) => `${item.nombre} x${item.cantidad}`).join(', ')}
                </small>
              )}
            </div>
          )}
        </div>
        <div className="tracking-visual">
          <div className="visual-card">
            <span className="visual-badge">Internet + Intranet</span>
            <p>El cliente ve aqui el mismo estado que el empleado modifica en el sistema privado.</p>
          </div>
        </div>
      </section>

      <section className="contact-section" id="request">
        <div className="section-heading">
          <p className="section-kicker">Crear pedido</p>
          <h2>Solicitud publica conectada a la base de datos.</h2>
        </div>
        <form className="contact-form request-form" onSubmit={handleCreateRequest}>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={requestForm.cliente}
            onChange={(event) => setRequestForm({ ...requestForm, cliente: event.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Destino del paquete"
            value={requestForm.destino}
            onChange={(event) => setRequestForm({ ...requestForm, destino: event.target.value })}
            required
          />
          <button type="submit" className="primary-button" disabled={cart.length === 0}>
            Guardar pedido
          </button>
        </form>
        {requestError && <p className="form-error">{requestError}</p>}
        {requestResult && (
          <div className="tracking-result">
            <span>Pedido creado correctamente</span>
            <strong>{requestResult.trackingCode}</strong>
            <small>Ya aparece en la intranet de empleados.</small>
          </div>
        )}
      </section>

      <section className="contact-section" id="contact">
        <div className="section-heading">
          <p className="section-kicker">Contacto</p>
          <h2>Contacta a la empresa.</h2>
        </div>
        <div className="contact-grid">
          <div className="contact-card">
            <h3>Logistica en Tiempo Real</h3>
            <p>Atencion para envios, operaciones, rutas y soporte empresarial.</p>
          </div>
          <form className="contact-form" onSubmit={handleContact}>
            <input
              type="text"
              placeholder="Nombre completo"
              value={contactForm.nombre}
              onChange={(event) => setContactForm({ ...contactForm, nombre: event.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Correo"
              value={contactForm.correo}
              onChange={(event) => setContactForm({ ...contactForm, correo: event.target.value })}
              required
            />
            <textarea
              placeholder="Mensaje"
              rows="5"
              value={contactForm.mensaje}
              onChange={(event) => setContactForm({ ...contactForm, mensaje: event.target.value })}
              required
            />
            <button type="submit" className="primary-button">Enviar mensaje</button>
            {contactResult && <p>{contactResult}</p>}
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

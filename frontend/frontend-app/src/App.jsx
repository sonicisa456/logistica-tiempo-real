import { useState } from "react";
import "./App.css";

const categories = [
  "Ofertas",
  "Electrónica",
  "Videojuegos",
  "Moda",
  "Hogar",
  "Más vendidos",
  "Promociones",
  "Servicio al cliente"
];

const collections = [
  {
    title: "Productos recomendados",
    subtitle: "Selección pensada para ti",
    accent: "Tech & estilo",
    products: [
      { name: "Auriculares Pro X", price: "$1,799", discount: "15% OFF", seller: "Audio Store", shipping: "Llega hoy", image: "🎧" },
      { name: "Laptop Air 15", price: "$18,990", discount: "8% OFF", seller: "MegaTech", shipping: "2 días", image: "💻" },
      { name: "Smartwatch Nova", price: "$2,499", discount: "20% OFF", seller: "Wear Hub", shipping: "1 día", image: "⌚" },
      { name: "Silla gamer Prime", price: "$4,299", discount: "12% OFF", seller: "GameZone", shipping: "3 días", image: "🪑" }
    ]
  },
  {
    title: "Ofertas del día",
    subtitle: "Precios especiales por tiempo limitado",
    accent: "Ahorra más",
    products: [
      { name: "TV 55'' 4K", price: "$7,499", discount: "30% OFF", seller: "Vision Max", shipping: "Hoy mismo", image: "📺" },
      { name: "Cafetera deluxe", price: "$1,099", discount: "18% OFF", seller: "Home Barista", shipping: "1 día", image: "☕" },
      { name: "Tenis runner", price: "$1,299", discount: "25% OFF", seller: "Sport Lab", shipping: "2 días", image: "👟" },
      { name: "Kit escritorio", price: "$899", discount: "10% OFF", seller: "Office Pro", shipping: "3 días", image: "🖥️" }
    ]
  },
  {
    title: "Productos más vendidos",
    subtitle: "Lo más pedido por la comunidad",
    accent: "Top ventas",
    products: [
      { name: "Consola Play Nova", price: "$9,999", discount: "5% OFF", seller: "GameWorld", shipping: "2 días", image: "🎮" },
      { name: "Audífonos ANC", price: "$1,499", discount: "22% OFF", seller: "SoundLab", shipping: "Hoy", image: "🎵" },
      { name: "Bocina portátil", price: "$799", discount: "15% OFF", seller: "Party Beat", shipping: "1 día", image: "🔊" },
      { name: "Kit cocina", price: "$1,899", discount: "12% OFF", seller: "Cook House", shipping: "3 días", image: "🍳" }
    ]
  },
  {
    title: "Productos random",
    subtitle: "Explora sorpresas del marketplace",
    accent: "Descubre",
    products: [
      { name: "Lámpara neon", price: "$649", discount: "17% OFF", seller: "Light Studio", shipping: "2 días", image: "💡" },
      { name: "Mochila urbana", price: "$999", discount: "10% OFF", seller: "Street Pack", shipping: "1 día", image: "🎒" },
      { name: "Set skincare", price: "$579", discount: "14% OFF", seller: "Glow Bar", shipping: "Hoy", image: "🧴" },
      { name: "Smart speaker", price: "$1,299", discount: "16% OFF", seller: "Voice Lab", shipping: "3 días", image: "📢" }
    ]
  }
];

const trackingSteps = [
  { label: "Pedido confirmado", status: "done" },
  { label: "Paquete en origen", status: "done" },
  { label: "En ruta a tu zona", status: "active" },
  { label: "Listo para entrega", status: "pending" }
];

function App() {
  const [locationLabel, setLocationLabel] = useState("📍 Enviar a Gael");
  const [locationText, setLocationText] = useState("San Nicolás, Nuevo León");

  return (
    <div className="marketplace-shell">
      <header className="topbar">
        <div className="brand-block">
          <button className="menu-pill" type="button" aria-label="Menú de categorías">
            ☰
          </button>
          <div className="brand-mark">
            <span className="brand-icon">◆</span>
            <div>
              <p className="brand-kicker">Logística</p>
              <h1>Market Real</h1>
            </div>
          </div>
        </div>

        <label className="search-box" htmlFor="search-marketplace">
          <span className="search-icon">⌕</span>
          <input id="search-marketplace" type="search" placeholder="Buscar productos, marcas y vendedores" />
          <button type="button">Buscar</button>
        </label>

        <div className="location-card">
          <span className="location-icon">📍</span>
          <div>
            <input
              className="location-label"
              value={locationLabel}
              onChange={(event) => setLocationLabel(event.target.value)}
              aria-label="Etiqueta de ubicación"
            />
            <input
              className="location-text"
              value={locationText}
              onChange={(event) => setLocationText(event.target.value)}
              aria-label="Zona de entrega"
            />
          </div>
        </div>

        <div className="action-group">
          <button type="button" className="action-button">🛒 Carrito</button>
          <button type="button" className="action-button">📦 Mis pedidos</button>
          <button type="button" className="action-button primary">💼 Vender</button>
          <button type="button" className="action-button">👤 Cuenta</button>
        </div>
      </header>

      <nav className="category-strip" aria-label="Categorías">
        {categories.map((category) => (
          <button key={category} type="button" className="category-chip">
            {category}
          </button>
        ))}
      </nav>

      <main className="page-content">
        <section className="hero-banner">
          <div className="hero-copy">
            <span className="hero-tag">Promociones dinámicas</span>
            <h2>Todo el marketplace en un solo lugar</h2>
            <p>
              Descubre ofertas oscuras, entregas rápidas, vendedores locales y productos destacados con una
              experiencia visual tipo Amazon.
            </p>
            <div className="hero-actions">
              <button type="button" className="cta-button">Explorar ofertas</button>
              <button type="button" className="secondary-button">Ver más vendidos</button>
            </div>
            <div className="hero-flags">
              <span>Entrega rápida</span>
              <span>Pagos seguros</span>
              <span>Vendedores verificados</span>
            </div>
          </div>

          <div className="hero-panels">
            <article className="hero-stat glass-card">
              <span>🔥 Oferta flash</span>
              <strong>Hasta 40% OFF</strong>
              <small>Electrónica, moda y hogar</small>
            </article>
            <article className="hero-highlight glass-card">
              <div>
                <span>📦 Envío express</span>
                <strong>Hoy antes de las 8:00 PM</strong>
              </div>
              <div className="hero-badge">Zona: Monterrey</div>
            </article>
          </div>
        </section>

        <section className="quick-menu glass-card">
          {categories.map((category) => (
            <button key={category} type="button" className="quick-link">
              {category}
            </button>
          ))}
        </section>

        <section className="tracking-seller-grid">
          <article className="panel glass-card tracking-panel">
            <div className="panel-head">
              <div>
                <span className="section-label">Rastreo de pedidos</span>
                <h3>Visualiza el avance de tu pedido</h3>
              </div>
              <span className="tracking-badge">Tiempo restante: 2h 15m</span>
            </div>

            <div className="tracking-summary">
              <div>
                <span>Estado del pedido</span>
                <strong>En ruta</strong>
              </div>
              <div>
                <span>Ubicación actual</span>
                <strong>Centro de distribución MTY</strong>
              </div>
              <div>
                <span>Origen</span>
                <strong>Guadalajara, Jalisco</strong>
              </div>
              <div>
                <span>Destino</span>
                <strong>Monterrey, Nuevo León</strong>
              </div>
            </div>

            <div className="progress-track" aria-hidden="true">
              {trackingSteps.map((step, index) => (
                <div key={step.label} className={`progress-step ${step.status}`}>
                  <span className="step-dot">{index + 1}</span>
                  <span className="step-label">{step.label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel glass-card seller-panel">
            <div className="panel-head">
              <div>
                <span className="section-label">Sistema de vendedores</span>
                <h3>Convierte cualquier cuenta en tienda</h3>
              </div>
              <span className="tracking-badge">Administra stock y precios</span>
            </div>

            <div className="seller-actions">
              <button type="button" className="seller-card">
                <strong>Registrarse como vendedor</strong>
                <span>Activa tu perfil comercial</span>
              </button>
              <button type="button" className="seller-card">
                <strong>Subir productos</strong>
                <span>Publica imágenes, precios y stock</span>
              </button>
              <button type="button" className="seller-card">
                <strong>Editar precios</strong>
                <span>Ajusta promociones y descuentos</span>
              </button>
              <button type="button" className="seller-card">
                <strong>Administrar stock</strong>
                <span>Controla inventario en tiempo real</span>
              </button>
            </div>
          </article>
        </section>

        {collections.map((section) => (
          <section key={section.title} className="collection-block">
            <div className="collection-head">
              <div>
                <span className="section-label">{section.accent}</span>
                <h3>{section.title}</h3>
                <p>{section.subtitle}</p>
              </div>
              <button type="button" className="text-link">Ver todo</button>
            </div>

            <div className="product-grid">
              {section.products.map((product) => (
                <article key={product.name} className="product-card glass-card">
                  <div className="product-image">{product.image}</div>
                  <div className="product-body">
                    <div className="product-topline">
                      <span className="discount-pill">{product.discount}</span>
                      <span className="shipping-pill">{product.shipping}</span>
                    </div>
                    <h4>{product.name}</h4>
                    <p className="seller-name">Vendido por {product.seller}</p>
                    <div className="product-price">{product.price}</div>
                    <div className="product-actions">
                      <button type="button" className="mini-button">Agregar al carrito</button>
                      <button type="button" className="mini-button strong">Comprar ahora</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

export default App;
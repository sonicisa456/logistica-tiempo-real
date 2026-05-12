import Carrusel from "../components/Carrusel";
import ProductoCard from "../components/ProductoCard";

function Home({ offers, featured, popular, newItems, randomItems, categories, stats, addressLabel, onOpenProduct, onAddToCart, onBuyNow, onCategorySelect, onNavigate }) {
  const heroProduct = featured[0] || popular[0] || randomItems[0] || null;
  const heroHighlights = [featured[1], featured[2], popular[1], randomItems[1]].filter(Boolean).slice(0, 3);
  const emojiByCategory = {
    Audio: "🎧",
    Gaming: "🎮",
    Tecnología: "💻",
    Coleccionables: "🧸",
    Moda: "⌚",
    Hogar: "🏠",
    Accesorios: "🎒",
  };

  const renderVisual = (product, className) => {
    if (product?.imagen) {
      return <img className={className} src={product.imagen} alt={product.nombre} />;
    }

    return (
      <div className={`${className} hero-emoji-card`} aria-label={product?.nombre || "Producto"}>
        <span>{emojiByCategory[product?.categoria] || "✨"}</span>
      </div>
    );
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="page-layout">
      <section className="hero-banner">
        <div className="hero-copy">
          <p className="eyebrow">FlashGo Market</p>
          <h1>Compra todo lo que buscas en un solo lugar</h1>
          <p>Tecnología, videojuegos, ropa, accesorios y envíos rápidos con rastreo en tiempo real.</p>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={() => scrollToSection("featured-products")}>Explorar productos</button>
            <button type="button" className="ghost-button" onClick={() => scrollToSection("offers-section")}>Ver ofertas</button>
          </div>
          <div className="hero-tags">
            <span>Entregas inteligentes en tiempo real</span>
            <span>Miles de productos con envío inmediato</span>
            <span>Compra segura y vendedores verificados</span>
          </div>
        </div>
        <div className="hero-panel">
          {heroProduct ? (
            <button type="button" className="hero-preview" onClick={() => onOpenProduct(heroProduct)}>
              {renderVisual(heroProduct, "hero-preview-image")}
              <div>
                <span className="mini-label">Producto destacado</span>
                <strong>{heroProduct.nombre}</strong>
                <p>${Number(heroProduct.precio).toLocaleString("es-MX")} · Envío gratis</p>
              </div>
            </button>
          ) : (
            <div className="hero-preview hero-preview-empty">
              <span className="mini-label">Productos destacados</span>
              <strong>Catálogo listo para explorar</strong>
              <p>Pronto verás nuevos productos recomendados aquí.</p>
            </div>
          )}
          <div className="hero-mini-grid">
            {heroHighlights.map((product) => (
              <button key={product.id} type="button" className="hero-mini-card" onClick={() => onOpenProduct(product)}>
                {renderVisual(product, "hero-mini-image")}
                <div>
                  <strong>{product.nombre}</strong>
                  <span>{product.categoria} · ${Number(product.precio).toLocaleString("es-MX")}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="hero-mini-grid">
            <div>
              <span className="mini-label">Ubicación</span>
              <strong>{addressLabel}</strong>
            </div>
            <div>
              <span className="mini-label">Productos activos</span>
              <strong>{stats.products}</strong>
            </div>
            <div>
              <span className="mini-label">Pedidos</span>
              <strong>{stats.orders} registrados</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block" id="featured-products">
        <div className="section-head">
          <div>
            <p className="eyebrow">Productos destacados</p>
            <h2>Lo más buscado ahora</h2>
          </div>
        </div>
        <div className="product-grid">
          {featured.length > 0 ? featured.map((product) => (
            <ProductoCard key={product.id} product={product} onOpen={onOpenProduct} onAddToCart={onAddToCart} onBuyNow={onBuyNow} offer={offers.find((offer) => offer.producto_id === product.id)} currency={window.__marketCurrency || 'MXN'} rate={window.__marketRate || 1} />
          )) : <article className="empty-state-card">Aún no hay productos destacados para mostrar.</article>}
        </div>
      </section>

      <Carrusel offers={offers} onOpenProduct={onOpenProduct} />

      <section className="section-block">
        <div className="section-head">
          <div>
            <p className="eyebrow">Categorías</p>
            <h2>Explora por intención de compra</h2>
          </div>
          <button type="button" className="ghost-button" onClick={() => onCategorySelect("")}>Ver todo</button>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <button key={category} type="button" className="category-card" onClick={() => onCategorySelect(category)}>
              <strong>{category}</strong>
              <span>Explorar</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <p className="eyebrow">Productos recomendados</p>
            <h2>Lo destacado del marketplace</h2>
          </div>
        </div>
        <div className="product-grid">
          {featured.length > 0 ? featured.map((product) => (
            <ProductoCard key={product.id} product={product} onOpen={onOpenProduct} onAddToCart={onAddToCart} onBuyNow={onBuyNow} currency={window.__marketCurrency || 'MXN'} rate={window.__marketRate || 1} />
          )) : <article className="empty-state-card">Aun no hay productos destacados para mostrar.</article>}
        </div>
      </section>

      <section className="section-block three-columns" id="offers-section">
        <div>
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Ofertas</p>
              <h2>Del día</h2>
            </div>
          </div>
          <div className="mini-stack">
            {offers.length > 0 ? offers.map((offer) => (
              <button key={offer.id} type="button" className="mini-offer" onClick={() => onOpenProduct(offer.producto_id)}>
                <strong>{offer.nombre}</strong>
                <span>-{offer.descuento}% · {offer.titulo}</span>
              </button>
            )) : <article className="empty-state-card">En breve aparecerán nuevas ofertas especiales.</article>}
          </div>
        </div>
        <div>
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Populares</p>
              <h2>Más vendidos</h2>
            </div>
          </div>
          <div className="mini-stack">
            {popular.length > 0 ? popular.map((product) => (
              <button key={product.id} type="button" className="mini-offer" onClick={() => onOpenProduct(product)}>
                <strong>{product.nombre}</strong>
                <span>${Number(product.precio).toLocaleString("es-MX")}</span>
              </button>
            )) : <article className="empty-state-card">Pronto verás los productos más vendidos.</article>}
          </div>
        </div>
        <div>
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Nuevos</p>
              <h2>Recién publicados</h2>
            </div>
          </div>
          <div className="mini-stack">
            {newItems.length > 0 ? newItems.map((product) => (
              <button key={product.id} type="button" className="mini-offer" onClick={() => onOpenProduct(product)}>
                <strong>{product.nombre}</strong>
                <span>{product.entrega}</span>
              </button>
            )) : <article className="empty-state-card">Los nuevos lanzamientos se mostrarán aquí.</article>}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <p className="eyebrow">Random</p>
            <h2>Descubre productos por sorpresa</h2>
          </div>
        </div>
        <div className="product-grid compact-grid">
          {randomItems.length > 0 ? randomItems.map((product) => (
            <ProductoCard key={product.id} product={product} onOpen={onOpenProduct} onAddToCart={onAddToCart} onBuyNow={onBuyNow} offer={offers.find((offer) => offer.producto_id === product.id)} />
          )) : <article className="empty-state-card">Pronto aparecerán más recomendaciones para ti.</article>}
        </div>
      </section>
    </main>
  );
}

export default Home;
function Producto({ product, onAddToCart, onBuyNow, onBack }) {
  if (!product) {
    return (
      <section className="empty-page">
        <h2>Producto no encontrado</h2>
        <button type="button" className="primary-button" onClick={onBack}>Volver al inicio</button>
      </section>
    );
  }

  return (
    <main className="page-layout product-detail-layout">
      <button type="button" className="ghost-button back-button" onClick={onBack}>Volver</button>
      <section className="product-detail">
        <div className="product-gallery">
          <img src={product.imagen} alt={product.nombre} />
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow">{product.categoria}</p>
          <h1>{product.nombre}</h1>
          <p>{product.descripcion}</p>
          <div className="detail-metrics">
            <strong>${Number(product.precio).toLocaleString("es-MX")}</strong>
            <span>{product.stock} disponibles</span>
            <span>{product.entrega}</span>
          </div>
          <div className="detail-meta">
            <span>Vendedor: {product.vendedor_nombre}</span>
            <span>Reputación: {Number(product.vendedor_reputacion || 0).toFixed(1)}</span>
          </div>
          <div className="product-actions">
            <button type="button" className="ghost-button" onClick={() => onAddToCart(product)}>Agregar al carrito</button>
            <button type="button" className="primary-button" onClick={() => onBuyNow(product)}>Comprar ahora</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Producto;
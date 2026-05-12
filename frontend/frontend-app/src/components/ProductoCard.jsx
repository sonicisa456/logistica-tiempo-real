function ProductoCard({ product, onOpen, onAddToCart, onBuyNow, offer, currency = 'MXN', rate = 1 }) {
  const stock = Number(product.stock || 0);
  const stockLabel = stock <= 0 ? "Agotado" : stock <= 1 ? "Última pieza" : stock <= 3 ? `Quedan ${stock} disponibles` : `${stock} disponibles`;
  const disablePurchase = stock <= 0;
  const discountLabel = offer ? `-${Number(offer.descuento).toFixed(0)}%` : "Envío gratis";
  const emojiByCategory = {
    Audio: "🎧",
    Gaming: "🎮",
    Tecnología: "💻",
    Coleccionables: "🧸",
    Moda: "⌚",
    Hogar: "🏠",
    Accesorios: "🎒",
  };
  const fallbackEmoji = emojiByCategory[product.categoria] || "✨";

  return (
    <article className="product-card">
      <button type="button" className="product-media" onClick={() => onOpen(product)}>
        {product.imagen ? (
          <img src={product.imagen} alt={product.nombre} />
        ) : (
          <div className="product-media-fallback" aria-label={product.nombre}>
            <span>{fallbackEmoji}</span>
          </div>
        )}
      </button>
      <div className="product-info">
        <div className="tag-row">
          <span className="offer-badge">{discountLabel}</span>
          <span className="ship-badge">Envío gratis</span>
        </div>
        <h3>{product.nombre}</h3>
        <p>{product.descripcion}</p>
        <div className="price-line">
          <strong>{currency} {Number(product.precio * rate).toLocaleString(undefined, {maximumFractionDigits:2})}</strong>
          <span className={stock <= 0 ? "stock-empty" : stock <= 5 ? "stock-low" : "stock-ok"}>{stockLabel}</span>
        </div>
        <small>Vendedor verificado: {product.vendedor_nombre}</small>
        <div className="product-actions">
          <button type="button" className="ghost-button" onClick={() => onAddToCart(product)} disabled={disablePurchase}>Agregar al carrito</button>
          <button type="button" className="primary-button" onClick={() => onBuyNow(product)} disabled={disablePurchase}>Comprar ahora</button>
        </div>
      </div>
    </article>
  );
}

export default ProductoCard;
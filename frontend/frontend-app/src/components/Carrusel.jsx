function Carrusel({ offers, onOpenProduct }) {
  return (
    <section className="carousel-shell">
      <div className="carousel-copy">
        <p className="eyebrow">Ofertas del día</p>
        <h2>FlashGo Market en modo oferta</h2>
        <p>Promociones, productos nuevos y envíos rastreables en una experiencia comercial elegante.</p>
      </div>
      <div className="carousel-strip">
        {offers.slice(0, 4).map((offer) => (
          <button key={offer.id} type="button" className="carousel-card" onClick={() => onOpenProduct(offer.producto_id)}>
            <span className="carousel-tag">-{offer.descuento}%</span>
            <strong>{offer.nombre}</strong>
            <small>{offer.titulo}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

export default Carrusel;
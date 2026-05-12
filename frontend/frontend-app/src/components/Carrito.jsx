function Carrito({ items, total, onIncrease, onDecrease, onRemove, onCheckout }) {
  return (
    <section className="cart-shell">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Carrito</p>
          <h2>Tu compra está lista para confirmar</h2>
        </div>
        <strong>Total: ${Number(total || 0).toLocaleString("es-MX")}</strong>
      </div>

      <div className="cart-list">
        {items.length === 0 ? (
          <p className="empty-state">Aún no hay productos en el carrito.</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="cart-item">
              <img src={item.imagen} alt={item.nombre} />
              <div>
                <h3>{item.nombre}</h3>
                <p>{item.vendedor_nombre}</p>
                <strong>${Number(item.precio).toLocaleString("es-MX")}</strong>
              </div>
              <div className="quantity-controls">
                <button type="button" onClick={() => onDecrease(item)}>-</button>
                <span>{item.cantidad}</span>
                <button type="button" onClick={() => onIncrease(item)}>+</button>
              </div>
              <button type="button" className="ghost-button" onClick={() => onRemove(item)}>Eliminar</button>
            </article>
          ))
        )}
      </div>

      <div className="cart-footer">
        <strong>Total: ${Number(total || 0).toLocaleString("es-MX")}</strong>
        <button type="button" className="primary-button" onClick={onCheckout} disabled={items.length === 0}>Comprar productos</button>
      </div>
    </section>
  );
}

export default Carrito;
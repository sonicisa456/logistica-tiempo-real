function Pedidos({ orders, onOpenTracking }) {
  return (
    <main className="page-layout">
      <section className="section-block">
        <div className="section-head">
          <div>
            <p className="eyebrow">Pedidos</p>
            <h1>Seguimiento de compras</h1>
          </div>
        </div>
        <div className="orders-list">
          {orders.length === 0 ? (
            <p className="empty-state">Aún no tienes pedidos.</p>
          ) : (
            orders.map((order) => (
              <article key={order.id} className="order-card">
                <div>
                  <strong>Pedido #{order.id}</strong>
                  <p>{order.estado}</p>
                  <span>Total: ${Number(order.total).toLocaleString("es-MX")}</span>
                </div>
                <div>
                  <span>{order.calle}, {order.ciudad}</span>
                  <span>{order.estado_direccion}, {order.pais}</span>
                </div>
                <button type="button" className="ghost-button" onClick={() => onOpenTracking(order)}>Ver rastreo</button>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default Pedidos;
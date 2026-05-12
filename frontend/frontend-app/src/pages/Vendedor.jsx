import ProductoCard from "../components/ProductoCard";

function Vendedor({ sellerProfile, sellerProducts, sellerForm, onSellerFormChange, onCreateProduct, onRegisterSeller, onOpenProduct, onAddToCart, onBuyNow }) {
  const isSellerReady = Boolean(sellerProfile?.id);

  return (
    <main className="page-layout">
      <section className="seller-grid">
        <div className="section-block">
          <div className="section-head">
            <div>
              <p className="eyebrow">Vendedores</p>
              <h1>Panel comercial</h1>
            </div>
          </div>
          {isSellerReady ? (
            <div className="seller-profile-card">
              <strong>{sellerProfile.nombre}</strong>
              <p>{sellerProfile.correo}</p>
              <span>Reputación {Number(sellerProfile.reputacion || 0).toFixed(1)}</span>
            </div>
          ) : (
            <div className="seller-profile-card empty-state-card">
              <strong>Aún no eres vendedor</strong>
              <p>Regístrate para abrir tu panel comercial y publicar productos.</p>
            </div>
          )}
          <button type="button" className="ghost-button full-width" onClick={onRegisterSeller}>Registrar nuevo vendedor</button>
        </div>

        <div className="section-block">
          <div className="section-head">
            <div>
              <p className="eyebrow">Publicar producto</p>
              <h2>Sube tu catálogo a FlashGo</h2>
            </div>
          </div>
          <form className="seller-form" onSubmit={onCreateProduct}>
            <input name="nombre" value={sellerForm.nombre} onChange={onSellerFormChange} placeholder="Nombre del producto" />
            <input name="precio" value={sellerForm.precio} onChange={onSellerFormChange} placeholder="Precio" />
            <input name="stock" value={sellerForm.stock} onChange={onSellerFormChange} placeholder="Stock" />
            <input name="imagen" value={sellerForm.imagen} onChange={onSellerFormChange} placeholder="URL de imagen" />
            <input name="categoria" value={sellerForm.categoria} onChange={onSellerFormChange} placeholder="Categoría" />
            <input name="entrega" value={sellerForm.entrega} onChange={onSellerFormChange} placeholder="Entrega" />
            <textarea name="descripcion" value={sellerForm.descripcion} onChange={onSellerFormChange} placeholder="Descripción" />
            <label><input type="checkbox" name="popular" checked={sellerForm.popular} onChange={onSellerFormChange} /> Popular</label>
            <label><input type="checkbox" name="nuevo" checked={sellerForm.nuevo} onChange={onSellerFormChange} /> Nuevo</label>
            <button type="submit" className="primary-button" disabled={!isSellerReady}>Publicar producto</button>
          </form>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <p className="eyebrow">Inventario</p>
            <h2>Productos del vendedor</h2>
          </div>
        </div>
        <div className="product-grid">
          {sellerProducts.length === 0 ? (
            <div className="empty-state-card">Aún no hay productos publicados.</div>
          ) : (
            sellerProducts.map((product) => (
              <ProductoCard key={product.id} product={product} onOpen={onOpenProduct} onAddToCart={onAddToCart} onBuyNow={onBuyNow} currency={window.__marketCurrency || 'MXN'} rate={window.__marketRate || 1} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default Vendedor;
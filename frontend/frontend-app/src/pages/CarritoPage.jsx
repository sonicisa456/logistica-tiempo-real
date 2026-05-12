import Carrito from "../components/Carrito";

function CarritoPage({ cart, onIncrease, onDecrease, onRemove, onCheckout }) {
  return (
    <main className="page-layout">
      <Carrito items={cart.items} total={cart.total} onIncrease={onIncrease} onDecrease={onDecrease} onRemove={onRemove} onCheckout={onCheckout} />
    </main>
  );
}

export default CarritoPage;
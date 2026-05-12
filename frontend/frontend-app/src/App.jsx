import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ModalDireccion from "./components/ModalDireccion";
import ThemeToggle from "./components/ThemeToggle";
import Home from "./pages/Home";
import Producto from "./pages/Producto";
import CarritoPage from "./pages/CarritoPage";
import Pedidos from "./pages/Pedidos";
import Vendedor from "./pages/Vendedor";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import { agregarCarrito, eliminarCarrito, listarCarrito, actualizarCarrito, vaciarCarrito } from "./services/carrito";
import { actualizarTemaUsuario, cerrarSesion, convertirUsuarioVendedor, crearDireccion, listarDirecciones, loginUsuario, obtenerSesionActual, registrarUsuario } from "./services/usuarios";
import { crearPedido, listarPedidos, obtenerRastreo } from "./services/pedidos";
import { crearProducto, listarOfertas, listarProductos, obtenerProducto } from "./services/productos";

const initialSellerForm = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  imagen: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80",
  categoria: "Tecnología",
  entrega: "Llega mañana",
  popular: true,
  nuevo: true,
};

function App() {
  const [theme, setTheme] = useState("dark");
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [category, setCategory] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [message, setMessage] = useState("");
  const [authForm, setAuthForm] = useState({ nombre: "", correo: "", password: "" });
  const [sellerForm, setSellerForm] = useState(initialSellerForm);
  const sellerProfile = user?.tipo === "vendedor" ? user : null;
  const currencies = ["MXN", "USD", "EUR", "COP", "ARS", "CLP", "PEN"];
  const [currency, setCurrency] = useState("MXN");
  const [rate, setRate] = useState(1);
  const { convertir } = require("./services/currency");

  const handleCurrencyChange = async (next) => {
    setCurrency(next);
    if (next === "MXN") {
      setRate(1);
      window.__marketCurrency = 'MXN';
      window.__marketRate = 1;
      return;
    }
    try {
      const res = await convertir('MXN', next, 1);
      if (res && res.rate) setRate(Number(res.rate));
      window.__marketCurrency = next;
      window.__marketRate = res && res.rate ? Number(res.rate) : 1;
    } catch (err) {
      console.error('No se obtuvo tasa', err);
    }
  };

  const categories = useMemo(() => {
    const unique = new Set(products.map((product) => product.categoria).filter(Boolean));
    return Array.from(unique);
  }, [products]);

  const searchSuggestions = useMemo(() => {
    const staticSuggestions = [
      "Audífonos gamer",
      "Teclado mecánico",
      "Laptop gamer",
      "Figura anime",
      "Monitor 27",
      "Mouse RGB",
      "Silla gamer",
      "Ofertas FlashGo",
    ];
    const dynamicSuggestions = [
      ...products.slice(0, 6).map((product) => product.nombre),
      ...categories.slice(0, 6),
    ];
    return Array.from(new Set([...staticSuggestions, ...dynamicSuggestions].filter(Boolean))).slice(0, 12);
  }, [products, categories]);

  const defaultAddress = addresses.find((address) => address.is_default) || addresses[0];
  const addressLabel = defaultAddress
    ? `${defaultAddress.ciudad}, ${defaultAddress.estado}`
    : "Selecciona tu ubicación";

  const showMessage = (text) => {
    setMessage(text);
    window.clearTimeout(window.__marketMessageTimer);
    window.__marketMessageTimer = window.setTimeout(() => setMessage(""), 3200);
  };

  const loadCatalog = async (filters = {}) => {
    const data = await listarProductos({ search: searchValue, categoria: category, ...filters });
    setProducts(data);
  };

  const loadOffers = async () => setOffers(await listarOfertas());
  const loadCart = async () => {
    if (!user?.id) {
      setCart({ items: [], total: 0 });
      return;
    }
    setCart(await listarCarrito(user.id));
  };
  const loadOrders = async () => {
    if (!user?.id) {
      setOrders([]);
      return;
    }
    setOrders(await listarPedidos(user.id));
  };
  const loadAddresses = async () => {
    if (!user?.id) {
      setAddresses([]);
      return;
    }
    setAddresses(await listarDirecciones(user.id));
  };
  const loadSellerProducts = async () => {
    const sellerId = user?.tipo === "vendedor" ? user.id : null;
    if (!sellerId) {
      setSellerProducts([]);
      return;
    }
    setSellerProducts(await listarProductos({ vendedor_id: sellerId }));
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await obtenerSesionActual();
        setUser(session);
        setTheme(session.tema || "dark");
      } catch (error) {
        setUser(null);
        setTheme("dark");
      }
    };

    loadSession();
    loadCatalog();
    loadOffers();
    loadCart();
    loadOrders();
    loadAddresses();
    loadSellerProducts();
  }, []);

  useEffect(() => {
    loadCart();
    loadOrders();
    loadAddresses();
    loadSellerProducts();
  }, [user?.id, user?.tipo]);

  useEffect(() => {
    if (page === "seller" && sellerProfile?.id) {
      loadSellerProducts();
    }
  }, [page, sellerProfile?.id]);

  useEffect(() => {
    const persistTheme = async () => {
      if (!user?.id || user.tema === theme) {
        return;
      }
      try {
        await actualizarTemaUsuario(user.id, theme);
        const updatedUser = { ...user, tema: theme };
        setUser(updatedUser);
      } catch (error) {
        console.error("No se pudo guardar el tema del usuario", error);
      }
    };
    persistTheme();
  }, [theme, user?.id, user?.tema]);

  const handleNavigate = (nextPage) => {
    if ((nextPage === "orders" || nextPage === "cart" || nextPage === "seller") && !user?.id) {
      setAuthMode("login");
      setPage("login");
      showMessage("Inicia sesión para continuar");
      return;
    }
    setPage(nextPage);
    if (nextPage === "product" && !currentProduct) {
      setPage("home");
    }
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    await loadCatalog();
    setPage("home");
  };

  const handleCategorySelect = async (selectedCategory) => {
    setCategory(selectedCategory);
    await loadCatalog({ categoria: selectedCategory });
    setPage("home");
  };

  const handleOpenProduct = async (productOrId) => {
    const productId = typeof productOrId === "object" ? productOrId.id : productOrId;
    const product = typeof productOrId === "object" ? productOrId : await obtenerProducto(productId);
    setCurrentProduct(product);
    setPage("product");
  };

  const handleAddToCart = async (product) => {
    if (!user?.id) {
      setAuthMode("login");
      setPage("login");
      showMessage("Inicia sesión para agregar al carrito");
      return;
    }
    await agregarCarrito({ usuario_id: user.id, producto_id: product.id, cantidad: 1 });
    await loadCart();
    showMessage(`${product.nombre} agregado al carrito`);
  };

  const handleBuyNow = async (product) => {
    if (!user?.id) {
      setAuthMode("login");
      setPage("login");
      showMessage("Inicia sesión para comprar");
      return;
    }
    if (!defaultAddress) {
      setLocationOpen(true);
      showMessage("Primero selecciona tu ubicación");
      return;
    }
    await crearPedido({ usuario_id: user.id, direccion_id: defaultAddress.id, items: [{ producto_id: product.id, cantidad: 1 }] });
    await loadOrders();
    await loadCart();
    setPage("orders");
    showMessage("Compra realizada con éxito");
  };

  const handleIncrease = async (item) => {
    await actualizarCarrito(item.id, { cantidad: item.cantidad + 1 });
    await loadCart();
  };

  const handleDecrease = async (item) => {
    const nextQuantity = item.cantidad - 1;
    if (nextQuantity <= 0) {
      await eliminarCarrito(item.id);
    } else {
      await actualizarCarrito(item.id, { cantidad: nextQuantity });
    }
    await loadCart();
  };

  const handleRemove = async (item) => {
    await eliminarCarrito(item.id);
    await loadCart();
  };

  const handleCheckout = async () => {
    if (!user?.id) {
      setAuthMode("login");
      setPage("login");
      showMessage("Inicia sesión para comprar");
      return;
    }
    if (!defaultAddress) {
      setLocationOpen(true);
      showMessage("Necesitas una ubicación antes de comprar");
      return;
    }
    await crearPedido({ usuario_id: user.id, direccion_id: defaultAddress.id });
    await vaciarCarrito(user.id);
    await loadOrders();
    await loadCart();
    setPage("orders");
    showMessage("Pedido creado y enviado a rastreo");
  };

  const handleSaveAddress = async (payload) => {
    if (!user?.id) {
      setAuthMode("login");
      setPage("login");
      showMessage("Inicia sesión para guardar una ubicación");
      return;
    }
    await crearDireccion({ ...payload, usuario_id: user.id });
    await loadAddresses();
    setLocationOpen(false);
    showMessage("Dirección guardada");
  };

  const handleSellerFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSellerForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    if (!user?.id) {
      setAuthMode("login");
      setPage("login");
      showMessage("Inicia sesión para vender");
      return;
    }
    const sellerId = sellerProfile?.id || (user?.tipo === "vendedor" ? user.id : null);
    if (!sellerId) {
      showMessage("Primero regístrate como vendedor");
      return;
    }
    const payload = {
      ...sellerForm,
      precio: Number(sellerForm.precio),
      stock: Number(sellerForm.stock),
      vendedor_id: sellerId,
    };
    await crearProducto(payload);
    await loadSellerProducts();
    await loadCatalog();
    setSellerForm(initialSellerForm);
    showMessage("Producto publicado correctamente");
  };

  const handleRegisterSeller = async () => {
    if (!user?.id) {
      setAuthMode("login");
      setPage("login");
      showMessage("Inicia sesión para abrir el panel vendedor");
      return;
    }
    const updatedUser = await convertirUsuarioVendedor(user.id);
    setUser(updatedUser);
    await loadSellerProducts();
    showMessage("Tu cuenta ahora es de vendedor");
  };

  const handleOpenTracking = async (order) => {
    const tracking = await obtenerRastreo(order.id);
    setSelectedOrder({ ...order, rastreo: tracking });
    showMessage(`Pedido ${order.id} actualizado en rastreo`);
  };

  const handleAuthChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const session = await loginUsuario({ correo: authForm.correo, password: authForm.password });
    const sessionTheme = session.tema || "dark";
    setUser(session);
    setTheme(sessionTheme);
    await loadCart();
    await loadOrders();
    await loadAddresses();
    setPage("home");
    showMessage(`Bienvenido ${session.nombre}`);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const session = await registrarUsuario({ nombre: authForm.nombre, correo: authForm.correo, password: authForm.password, tipo: "cliente", tema: theme });
    setUser(session);
    setTheme(session.tema);
    setPage("home");
    showMessage("Cuenta creada y sesión iniciada");
  };

  const handleLogout = async () => {
    try {
      await cerrarSesion();
    } finally {
      setUser(null);
      setSellerProducts([]);
      setCart({ items: [], total: 0 });
      setOrders([]);
      setAddresses([]);
      setTheme("dark");
      setPage("home");
      showMessage("Sesión cerrada");
    }
  };

  const filteredProducts = useMemo(() => {
    const lowerSearch = searchValue.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !lowerSearch || [product.nombre, product.descripcion, product.categoria, product.vendedor_nombre].some((value) => value?.toLowerCase().includes(lowerSearch));
      const matchesCategory = !category || product.categoria === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchValue, category]);

  const featured = filteredProducts.slice(0, 8);
  const popular = filteredProducts.filter((product) => product.popular).slice(0, 4);
  const newItems = filteredProducts.filter((product) => product.nuevo).slice(0, 4);
  const randomItems = [...filteredProducts].sort(() => Math.random() - 0.5).slice(0, 4);
  const liveStats = {
    products: products.length,
    offers: offers.length,
    orders: orders.length,
    cartItems: cart.items.length,
  };

  let content = null;
  if (page === "product") {
    content = <Producto product={currentProduct} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} onBack={() => setPage("home")} />;
  } else if (page === "cart") {
    content = <CarritoPage cart={cart} onIncrease={handleIncrease} onDecrease={handleDecrease} onRemove={handleRemove} onCheckout={handleCheckout} />;
  } else if (page === "orders") {
    content = <Pedidos orders={selectedOrder ? [selectedOrder, ...orders.filter((order) => order.id !== selectedOrder.id)] : orders} onOpenTracking={handleOpenTracking} />;
  } else if (page === "seller") {
    content = <Vendedor sellerProfile={sellerProfile} sellerProducts={sellerProducts} sellerForm={sellerForm} onSellerFormChange={handleSellerFormChange} onCreateProduct={handleCreateProduct} onRegisterSeller={handleRegisterSeller} onOpenProduct={handleOpenProduct} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />;
  } else if (page === "login") {
    content = authMode === "login"
      ? <Login form={authForm} onChange={handleAuthChange} onSubmit={handleLogin} onToggle={() => setAuthMode("register")} />
      : <Registro form={authForm} onChange={handleAuthChange} onSubmit={handleRegister} onToggle={() => setAuthMode("login")} />;
  } else {
    content = <Home offers={offers} featured={featured} popular={popular} newItems={newItems} randomItems={randomItems} categories={categories} stats={liveStats} addressLabel={addressLabel} onOpenProduct={handleOpenProduct} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} onCategorySelect={handleCategorySelect} onNavigate={handleNavigate} />;
  }

  return (
    <div className="app-shell">
      <Header
        user={user}
        addressLabel={addressLabel}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        onNavigate={handleNavigate}
        onOpenLocation={() => setLocationOpen(true)}
        cartCount={cart.items.length}
        page={page}
        theme={theme}
        onThemeChange={setTheme}
        onLogout={handleLogout}
        searchSuggestions={searchSuggestions}
        currency={currency}
        currencies={currencies}
        onCurrencyChange={handleCurrencyChange}
      />
      <Navbar categories={categories} activeCategory={category} onCategorySelect={handleCategorySelect} onNavigate={handleNavigate} />
      {message ? <div className="toast-banner">{message}</div> : null}
      {content}
      {selectedOrder ? (
        <section className="tracking-shell page-layout">
          <div className="section-head">
            <div>
              <p className="eyebrow">Rastreo</p>
              <h2>Pedido #{selectedOrder.id}</h2>
            </div>
            <button type="button" className="ghost-button" onClick={() => setSelectedOrder(null)}>Cerrar</button>
          </div>
          <div className="tracking-grid">
            {(selectedOrder.rastreo || []).map((step) => (
              <article key={`${step.estado}-${step.fecha}`} className="tracking-card">
                <strong>{step.estado}</strong>
                <p>{step.ubicacion}</p>
                <span>{step.fecha}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <Footer />
      <ModalDireccion open={locationOpen} onClose={() => setLocationOpen(false)} onSave={handleSaveAddress} initialValue={defaultAddress} />
    </div>
  );
}

export default App;

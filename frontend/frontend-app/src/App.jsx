import { useEffect, useState } from "react";
import API from "./services/api";
import "./App.css";

const FALLBACK_LOCATION_DATA = {
  México: {
    "Nuevo León": ["Monterrey", "Guadalupe", "San Nicolás"],
    Jalisco: ["Guadalajara", "Zapopan", "Tlaquepaque"],
    "Ciudad de México": ["Coyoacán", "Polanco", "Condesa"]
  },
  Colombia: {
    "Bogotá D.C.": ["Chapinero", "Suba", "Usaquén"],
    Antioquia: ["Medellín", "Bello", "Itagüí"]
  }
};

const INITIAL_LOCATION = {
  pais: "México",
  estado: "Nuevo León",
  ciudad: "Monterrey",
  detalle: "Av. Insurgentes 1450"
};

function App() {
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchCategories, setSearchCategories] = useState([]);
  const [searchVendors, setSearchVendors] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [loginPrompt, setLoginPrompt] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [locationOptions, setLocationOptions] = useState(FALLBACK_LOCATION_DATA);
  const [location, setLocation] = useState(INITIAL_LOCATION);
  const [locationDraft, setLocationDraft] = useState(INITIAL_LOCATION);
  const [saveMessage, setSaveMessage] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sellerStage, setSellerStage] = useState("register");
  const [sellerStoreName, setSellerStoreName] = useState("");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDiscount, setProductDiscount] = useState(0);
  const [productStock, setProductStock] = useState(1);
  const [productCategory, setProductCategory] = useState("");
  const [productCondition, setProductCondition] = useState("Nuevo");
  const [productShipping, setProductShipping] = useState("");
  const [productImage, setProductImage] = useState("");
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0 });
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [orderTracking, setOrderTracking] = useState({});

  const countries = Object.keys(locationOptions);
  const states = Object.keys(locationOptions[locationDraft.pais] || {});
  const cities = locationOptions[locationDraft.pais]?.[locationDraft.estado] || [];

  const loadCategories = async () => {
    try {
      const response = await API.get("/api/categories");
      setCategories(response.data.categorias || []);
      if (!productCategory && response.data.categorias?.length) {
        setProductCategory(response.data.categorias[0].id);
      }
    } catch {
      setCategories([]);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await API.get("/api/products");
      setProducts(response.data.productos || []);
    } catch {
      setProducts([]);
    }
  };

  const loadOffers = async () => {
    try {
      const response = await API.get("/api/offers");
      setOffers(response.data.ofertas || []);
    } catch {
      setOffers([]);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await API.get("/api/locations");
      setLocationOptions(response.data.paises || FALLBACK_LOCATION_DATA);
    } catch {
      setLocationOptions(FALLBACK_LOCATION_DATA);
    }
  };

  const loadUser = async (token) => {
    try {
      const response = await API.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usuario = response.data.usuario;
      if (usuario) {
        setLoggedIn(true);
        setUser(usuario);
        setAuthToken(token);
        localStorage.setItem("profin_marketplace_token", token);
        if (usuario.direccion?.pais) {
          setLocation(usuario.direccion);
          setLocationDraft(usuario.direccion);
        }
        if (usuario.modo) {
          setTheme(usuario.modo);
        }
      } else {
        setLoggedIn(false);
        localStorage.removeItem("profin_marketplace_token");
      }
    } catch {
      setLoggedIn(false);
      setUser(null);
      localStorage.removeItem("profin_marketplace_token");
    }
  };

  const loadCart = async (tokenOverride) => {
    const token = tokenOverride || authToken;
    if (!token) return;
    try {
      const response = await API.get("/api/cart", { headers: { Authorization: `Bearer ${token}` } });
      setCart(response.data.carrito || { items: [], subtotal: 0, total: 0 });
    } catch {
      setCart({ items: [], subtotal: 0, total: 0 });
    }
  };

  useEffect(() => {
    if (authToken) {
      loadCart(authToken);
    } else {
      setCart({ items: [], subtotal: 0, total: 0 });
    }
  }, [authToken]);

  const shippingOptions = [
    { key: 'standard', label: 'Envío estándar', cost: 49, description: 'Entrega en 3-4 días' },
    { key: 'express', label: 'Envío express', cost: 99, description: 'Entrega en 24-48h' }
  ];

  const cartShippingCost = shippingOptions.find((option) => option.key === selectedShipping)?.cost || 49;
  const cartTotal = Math.round((cart.subtotal + cartShippingCost) * 100) / 100;

  const openCart = async () => {
    if (!requireLogin("ver tu carrito")) return;
    await loadCart();
    setShowCartModal(true);
  };

  const updateCartItem = async (itemId, quantity) => {
    if (quantity < 1) {
      return removeCartItem(itemId);
    }
    try {
      const response = await API.put(
        `/api/cart/item/${itemId}`,
        { cantidad: quantity },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setCart(response.data.carrito || cart);
    } catch (error) {
      setActionMessage(error.response?.data?.error || "No se pudo actualizar la cantidad");
    }
  };

  const removeCartItem = async (itemId) => {
    try {
      const response = await API.delete(`/api/cart/item/${itemId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setCart(response.data.carrito || { items: [], subtotal: 0, total: 0 });
    } catch (error) {
      setActionMessage(error.response?.data?.error || "No se pudo eliminar el producto");
    }
  };

  const handleCheckout = async () => {
    if (!requireLogin("procesar tu pedido")) return;
    if (!cart.items.length) {
      setActionMessage("El carrito está vacío");
      return;
    }
    if (!user?.direccion?.id) {
      setActionMessage("Debes guardar una dirección antes de comprar");
      return;
    }
    try {
      const response = await API.post(
        "/api/checkout",
        { direccionId: user.direccion.id, metodoEnvio: selectedShipping },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setShowCartModal(false);
      setActionMessage(`Compra completada. Guía: ${response.data.guia}`);
      await loadCart();
      openOrders();
    } catch (error) {
      setActionMessage(error.response?.data?.error || "No se pudo completar la compra");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("profin_marketplace_token");
    if (token) {
      loadUser(token);
    }
    loadLocations();
    loadCategories();
    loadProducts();
    loadOffers();
  }, []);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      setSearchCategories([]);
      setSearchVendors([]);
      return;
    }
    try {
      const response = await API.get("/api/search", { params: { q: query } });
      setSearchResults(response.data.productos || []);
      setSearchCategories(response.data.categorias || []);
      setSearchVendors(response.data.vendedores || []);
    } catch {
      setSearchResults([]);
      setSearchCategories([]);
      setSearchVendors([]);
    }
  };

  const openAuthModal = (mode = "login", prompt = "") => {
    setAuthMode(mode);
    setLoginPrompt(prompt);
    setAuthError("");
    setShowAuthModal(true);
  };

  const requireLogin = (purpose) => {
    if (!loggedIn) {
      openAuthModal("login", purpose);
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setAuthError("");
    if (!authEmail || !authPassword) {
      setAuthError("Ingresa correo y contraseña");
      return;
    }
    try {
      const response = await API.post("/api/auth/login", { email: authEmail, password: authPassword });
      const token = response.data.usuario.token;
      setShowAuthModal(false);
      setAuthEmail("");
      setAuthPassword("");
      await loadUser(token);
      setActionMessage("Sesión iniciada correctamente");
    } catch (error) {
      setAuthError(error.response?.data?.error || "Error al iniciar sesión");
    }
  };

  const handleRegister = async () => {
    setAuthError("");
    if (!authName || !authEmail || !authPassword) {
      setAuthError("Faltan datos obligatorios");
      return;
    }
    if (authPassword.length < 6) {
      setAuthError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      const response = await API.post("/api/auth/register", {
        nombre: authName,
        email: authEmail,
        password: authPassword
      });
      const token = response.data.usuario.token;
      setShowAuthModal(false);
      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");
      await loadUser(token);
      setActionMessage("Cuenta creada y sesión iniciada");
    } catch (error) {
      setAuthError(error.response?.data?.error || "Error al crear la cuenta");
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      await API.post("/api/auth/logout", {}, { headers: { Authorization: `Bearer ${authToken}` } });
    }
    localStorage.removeItem("profin_marketplace_token");
    setAuthToken(null);
    setLoggedIn(false);
    setUser(null);
    setActionMessage("Cerraste sesión correctamente");
  };

  const handleSaveLocation = async () => {
    setSaveMessage("");
    setLocation(locationDraft);
    setShowLocationModal(false);
    if (authToken) {
      try {
        await API.post(
          "/api/address",
          {
            pais: locationDraft.pais,
            estado: locationDraft.estado,
            ciudad: locationDraft.ciudad,
            detalle: locationDraft.detalle
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setSaveMessage("Dirección guardada en tu perfil");
      } catch {
        setSaveMessage("Dirección guardada localmente. Inicia sesión para sincronizarla.");
      }
    } else {
      setSaveMessage("Dirección guardada localmente. Inicia sesión para sincronizarla.");
    }
  };

  const handleThemeToggle = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (authToken) {
      try {
        await API.post(
          "/api/theme",
          { modo: nextTheme },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      } catch {
        // ignore
      }
    }
  };

  const addToCart = async (product) => {
    if (!requireLogin("añadir al carrito")) return;
    try {
      await API.post(
        "/api/cart",
        { productoId: product.id, cantidad: 1 },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setActionMessage(`Producto agregado: ${product.nombre}`);
    } catch (error) {
      setActionMessage(error.response?.data?.error || "No se pudo agregar al carrito");
    }
  };

  const openOrders = async () => {
    if (!requireLogin("ver tus pedidos")) return;
    try {
      const response = await API.get("/api/orders", { headers: { Authorization: `Bearer ${authToken}` } });
      const pedidos = response.data.pedidos || [];
      setOrders(pedidos);
      setShowOrdersModal(true);
      const trackingMap = {};
      await Promise.all(pedidos.map(async (pedido) => {
        try {
          const trackResponse = await API.get(`/api/tracking/${pedido.id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          trackingMap[pedido.id] = trackResponse.data.rastreo || [];
        } catch {
          trackingMap[pedido.id] = [];
        }
      }));
      setOrderTracking(trackingMap);
    } catch {
      setActionMessage("No fue posible cargar tus pedidos");
    }
  };

  const handleSellClick = () => {
    if (!requireLogin("vender productos")) return;
    if (!user?.esVendedor) {
      setSellerStage("register");
      setShowSellerModal(true);
      return;
    }
    setSellerStage("publish");
    setShowSellerModal(true);
  };

  const handleSellerRegister = async () => {
    if (!sellerStoreName.trim()) {
      setActionMessage("Debes ingresar un nombre de tienda");
      return;
    }
    try {
      await API.post(
        "/api/seller/register",
        { tienda: sellerStoreName },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setUser({ ...user, esVendedor: true, tienda: sellerStoreName });
      setSellerStage("publish");
      setActionMessage("Tu tienda fue activada. Ahora puedes publicar productos");
    } catch (error) {
      setActionMessage(error.response?.data?.error || "No se pudo activar la tienda");
    }
  };

  const handleProductImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProductImage(reader.result.toString());
    };
    reader.readAsDataURL(file);
  };

  const handlePublishProduct = async () => {
    if (!productName || !productDescription || !productPrice || !productShipping || !productCategory) {
      setActionMessage("Completa todos los campos del producto");
      return;
    }
    try {
      await API.post(
        "/api/seller/product",
        {
          categoriaId: productCategory,
          nombre: productName,
          descripcion: productDescription,
          precio: parseFloat(productPrice),
          descuento: parseInt(productDiscount, 10) || 0,
          stock: parseInt(productStock, 10) || 0,
          envio: productShipping,
          estado: productCondition,
          imagen: productImage
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setActionMessage("Producto publicado correctamente");
      setShowSellerModal(false);
      setProductName("");
      setProductDescription("");
      setProductPrice("");
      setProductDiscount(0);
      setProductStock(1);
      setProductShipping("");
      setProductImage("");
      await loadProducts();
      await loadOffers();
    } catch (error) {
      setActionMessage(error.response?.data?.error || "No se pudo publicar el producto");
    }
  };

  const filteredCountryOptions = countries.filter((pais) => pais.toLowerCase().includes(countryFilter.toLowerCase()));
  const filteredStateOptions = states.filter((estado) => estado.toLowerCase().includes(stateFilter.toLowerCase()));
  const filteredCityOptions = cities.filter((ciudad) => ciudad.toLowerCase().includes(cityFilter.toLowerCase()));

  const featuredProducts = products.filter((product) => product.destacado).slice(0, 6);
  const bestSelling = [...products].sort((a, b) => b.vendido - a.vendido).slice(0, 6);
  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 5).slice(0, 6);
  const soldOut = products.filter((product) => product.stock <= 0).slice(0, 6);
  const newProducts = products.filter((product) => product.estado?.toLowerCase().includes("nuevo")).slice(0, 6);
  const categoryCards = categories.slice(0, 6);

  const buildStockLabel = (product) => {
    if (product.stock <= 0) return "Agotado";
    if (product.stock <= 5) return "Últimas piezas disponibles";
    return "Stock disponible";
  };

  return (
    <div className={`marketplace-shell ${theme === "light" ? "theme-light" : "theme-dark"}`}>
      <header className="header-container">
        <div className="header-level1">
          <div className="header-logo">
            <div className="brand-mark">
              <span className="brand-icon">⚡</span>
              <div>
                <p className="brand-kicker">TurboMercado</p>
                <h1>TurboMercado</h1>
              </div>
            </div>
          </div>
          <div className="header-search">
            <label className="search-box" htmlFor="search-marketplace">
              <span className="search-icon">⌕</span>
              <input
                id="search-marketplace"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                placeholder="Buscar productos, categorías, vendedores u ofertas"
              />
              <button type="button" onClick={handleSearch}>Buscar</button>
            </label>
          </div>
          <div className="header-buttons">
            {!loggedIn ? (
              <>
                <button className="header-pill" type="button" onClick={() => openAuthModal("login", "Inicia sesión para continuar")}>Iniciar sesión</button>
                <button className="header-pill" type="button" onClick={() => openAuthModal("register", "Crea tu cuenta")}>Crear cuenta</button>
              </>
            ) : (
              <button className="header-pill" type="button" onClick={handleLogout}>Cerrar sesión</button>
            )}
            <button className="header-pill" type="button" onClick={openCart}>🛒 Carrito</button>
            <button className="theme-button" type="button" onClick={handleThemeToggle}>{theme === "dark" ? "Modo claro" : "Modo oscuro"}</button>
          </div>
        </div>
        <div className="header-level2">
          <button className="location-toggle" type="button" onClick={() => setShowLocationModal(true)}>
            <span>📍</span>
            <div>
              <strong>{location.ciudad}, {location.estado}</strong>
              <small>{location.detalle}</small>
            </div>
          </button>
          <div className="nav-buttons">
            <button className="header-pill" type="button">Todo</button>
            <button className="header-pill" type="button" onClick={openOrders}>Mis pedidos</button>
            <button className="header-pill primary" type="button" onClick={handleSellClick}>Vender</button>
          </div>
        </div>
      </header>

      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <section className="modal-card" onClick={(event) => event.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h2>Seleccionar dirección</h2>
                <p>Elige país, estado, ciudad y una dirección exacta para tus envíos.</p>
              </div>
              <button className="modal-close" type="button" onClick={() => setShowLocationModal(false)}>✕</button>
            </header>
            <div className="modal-body scrollable">
              <div className="dropdown-row">
                <div className="dropdown-panel">
                  <div className="dropdown-heading">País</div>
                  <input
                    className="filter-input"
                    placeholder="Buscar país"
                    value={countryFilter}
                    onChange={(event) => setCountryFilter(event.target.value)}
                  />
                  <div className="dropdown-options">
                    {filteredCountryOptions.map((pais) => (
                      <button
                        key={pais}
                        className={`dropdown-option ${locationDraft.pais === pais ? "selected" : ""}`}
                        type="button"
                        onClick={() => {
                          const nextStates = Object.keys(locationOptions[pais] || {});
                          setLocationDraft({
                            pais,
                            estado: nextStates[0] || "",
                            ciudad: locationOptions[pais]?.[nextStates[0]]?.[0] || "",
                            detalle: locationDraft.detalle
                          });
                          setCountryFilter("");
                          setStateFilter("");
                          setCityFilter("");
                        }}
                      >
                        {pais}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="dropdown-panel">
                  <div className="dropdown-heading">Estado</div>
                  <input
                    className="filter-input"
                    placeholder="Buscar estado"
                    value={stateFilter}
                    onChange={(event) => setStateFilter(event.target.value)}
                  />
                  <div className="dropdown-options">
                    {filteredStateOptions.map((estado) => (
                      <button
                        key={estado}
                        className={`dropdown-option ${locationDraft.estado === estado ? "selected" : ""}`}
                        type="button"
                        onClick={() => {
                          setLocationDraft({
                            ...locationDraft,
                            estado,
                            ciudad: locationOptions[locationDraft.pais]?.[estado]?.[0] || ""
                          });
                          setStateFilter("");
                          setCityFilter("");
                        }}
                      >
                        {estado}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="dropdown-panel">
                  <div className="dropdown-heading">Ciudad</div>
                  <input
                    className="filter-input"
                    placeholder="Buscar ciudad"
                    value={cityFilter}
                    onChange={(event) => setCityFilter(event.target.value)}
                  />
                  <div className="dropdown-options">
                    {filteredCityOptions.map((ciudad) => (
                      <button
                        key={ciudad}
                        className={`dropdown-option ${locationDraft.ciudad === ciudad ? "selected" : ""}`}
                        type="button"
                        onClick={() => {
                          setLocationDraft({ ...locationDraft, ciudad });
                          setCityFilter("");
                        }}
                      >
                        {ciudad}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <label>
                Dirección exacta
                <input
                  type="text"
                  value={locationDraft.detalle}
                  onChange={(event) => setLocationDraft({ ...locationDraft, detalle: event.target.value })}
                  placeholder="Av. Principal 123, Col. Centro"
                />
              </label>
            </div>
            <footer className="modal-footer">
              <button className="primary-button" type="button" onClick={handleSaveLocation}>Guardar dirección</button>
            </footer>
          </section>
        </div>
      )}

      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <section className="modal-card auth-card" onClick={(event) => event.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h2>{authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
                <p>{loginPrompt || (authMode === "login" ? "Accede para continuar con tus compras." : "Regístrate para empezar a comprar y vender.")}</p>
              </div>
              <button className="modal-close" type="button" onClick={() => setShowAuthModal(false)}>✕</button>
            </header>
            <div className="modal-body scrollable">
              {authMode === "register" && (
                <label>
                  Nombre completo
                  <input type="text" value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Tu nombre" />
                </label>
              )}
              <label>
                Correo electrónico
                <input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="correo@ejemplo.com" />
              </label>
              <label>
                Contraseña
                <input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Mínimo 6 caracteres" />
              </label>
              {authError && <p className="form-error">{authError}</p>}
            </div>
            <footer className="modal-footer auth-footer">
              <button className="primary-button" type="button" onClick={authMode === "login" ? handleLogin : handleRegister}>
                {authMode === "login" ? "Ingresar" : "Crear cuenta"}
              </button>
              <button className="text-link" type="button" onClick={() => {
                const nextMode = authMode === "login" ? "register" : "login";
                setAuthMode(nextMode);
              }}>
                {authMode === "login" ? "Crear una cuenta" : "Ya tengo cuenta"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {showSellerModal && (
        <div className="modal-overlay" onClick={() => setShowSellerModal(false)}>
          <section className="modal-card auth-card" onClick={(event) => event.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h2>{sellerStage === "register" ? "Abrir tienda" : "Publicar producto"}</h2>
                <p>{sellerStage === "register" ? "Activa tu cuenta de vendedor para publicar productos." : "Carga tu producto con imagen, precio, stock y descripción."}</p>
              </div>
              <button className="modal-close" type="button" onClick={() => setShowSellerModal(false)}>✕</button>
            </header>
            <div className="modal-body scrollable">
              {sellerStage === "register" ? (
                <label>
                  Nombre de tienda
                  <input type="text" value={sellerStoreName} onChange={(event) => setSellerStoreName(event.target.value)} placeholder="Mi tienda premium" />
                </label>
              ) : (
                <>
                  <label>
                    Nombre del producto
                    <input type="text" value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="Ej. Zapatillas de running" />
                  </label>
                  <label>
                    Descripción
                    <textarea value={productDescription} onChange={(event) => setProductDescription(event.target.value)} placeholder="Describe características y beneficios" />
                  </label>
                  <div className="form-grid">
                    <label>
                      Precio
                      <input type="number" min="0" value={productPrice} onChange={(event) => setProductPrice(event.target.value)} placeholder="999.90" />
                    </label>
                    <label>
                      Descuento
                      <input type="number" min="0" max="100" value={productDiscount} onChange={(event) => setProductDiscount(event.target.value)} placeholder="%" />
                    </label>
                  </div>
                  <div className="form-grid">
                    <label>
                      Cantidad
                      <input type="number" min="1" value={productStock} onChange={(event) => setProductStock(event.target.value)} />
                    </label>
                    <label>
                      Estado
                      <select value={productCondition} onChange={(event) => setProductCondition(event.target.value)}>
                        <option>Nuevo</option>
                        <option>Usado</option>
                        <option>Reacondicionado</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Categoría
                    <select value={productCategory} onChange={(event) => setProductCategory(event.target.value)}>
                      {categories.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Información de envío
                    <input type="text" value={productShipping} onChange={(event) => setProductShipping(event.target.value)} placeholder="Envío en 24 horas, transportadora premium" />
                  </label>
                  <label>
                    Imagen del producto
                    <input type="file" accept="image/*" onChange={handleProductImageUpload} />
                    <small>También puedes cargar una imagen desde tu dispositivo.</small>
                  </label>
                  {productImage && <div className="product-image-preview"><img src={productImage} alt="Preview" /></div>}
                </>
              )}
            </div>
            <footer className="modal-footer auth-footer">
              <button className="primary-button" type="button" onClick={sellerStage === "register" ? handleSellerRegister : handlePublishProduct}>
                {sellerStage === "register" ? "Abrir tienda" : "Publicar producto"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {showCartModal && (
        <div className="modal-overlay" onClick={() => setShowCartModal(false)}>
          <section className="modal-card auth-card" onClick={(event) => event.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h2>Tu carrito</h2>
                <p>Revisa, ajusta cantidades y selecciona tu método de envío.</p>
              </div>
              <button className="modal-close" type="button" onClick={() => setShowCartModal(false)}>✕</button>
            </header>
            <div className="modal-body scrollable">
              {cart.items.length === 0 ? (
                <p>Tu carrito está vacío. Agrega productos para continuar.</p>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.items.map((item) => (
                      <article key={item.item_id} className="cart-item">
                        <img src={item.imagen} alt={item.nombre} />
                        <div>
                          <strong>{item.nombre}</strong>
                          <span>{item.vendedor}</span>
                          <span>Precio unitario: ${item.precio}</span>
                          <span>{item.envio}</span>
                          <div className="quantity-control">
                            <button type="button" onClick={() => updateCartItem(item.item_id, item.cantidad - 1)}>-</button>
                            <span>{item.cantidad}</span>
                            <button type="button" onClick={() => updateCartItem(item.item_id, item.cantidad + 1)}>+</button>
                          </div>
                        </div>
                        <button className="text-link" type="button" onClick={() => removeCartItem(item.item_id)}>Eliminar</button>
                      </article>
                    ))}
                  </div>
                  <div className="shipping-panel">
                    <h3>Método de envío</h3>
                    <div className="shipping-grid">
                      {shippingOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          className={`shipping-option ${selectedShipping === option.key ? 'selected' : ''}`}
                          onClick={() => setSelectedShipping(option.key)}
                        >
                          <strong>{option.label}</strong>
                          <small>{option.description}</small>
                          <span>${option.cost}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="cart-summary">
                    <div>
                      <span>Subtotal</span>
                      <strong>${cart.subtotal}</strong>
                    </div>
                    <div>
                      <span>Envío</span>
                      <strong>${cartShippingCost}</strong>
                    </div>
                    <div className="cart-total">
                      <span>Total</span>
                      <strong>${cartTotal}</strong>
                    </div>
                  </div>
                </>
              )}
            </div>
            <footer className="modal-footer auth-footer">
              <button className="primary-button" type="button" onClick={handleCheckout} disabled={!cart.items.length}>Comprar ahora</button>
            </footer>
          </section>
        </div>
      )}

      {showOrdersModal && (
        <div className="modal-overlay" onClick={() => setShowOrdersModal(false)}>
          <section className="modal-card auth-card" onClick={(event) => event.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h2>Tus pedidos</h2>
                <p>Revisa tus compras recientes y el estado de entrega.</p>
              </div>
              <button className="modal-close" type="button" onClick={() => setShowOrdersModal(false)}>✕</button>
            </header>
            <div className="modal-body scrollable">
              {orders.length === 0 ? (
                <p>No hay pedidos registrados todavía.</p>
              ) : (
                orders.map((order) => (
                  <article key={order.id} className="order-card">
                    <div className="order-head">
                      <div>
                        <strong>Orden {order.guia}</strong>
                        <span>{order.estado}</span>
                      </div>
                      <div>
                        <span>{order.fecha_entrega}</span>
                        <strong>${order.total}</strong>
                      </div>
                    </div>
                    <div className="order-address">Entrega en: {order.ciudad}, {order.estado}, {order.pais}</div>
                    <div className="order-items">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.nombre}`} className="order-item">
                          <img src={item.imagen} alt={item.nombre} />
                          <div>
                            <strong>{item.nombre}</strong>
                            <span>{item.vendedor}</span>
                            <span>Cantidad: {item.cantidad}</span>
                            <span>Precio: ${item.precio_unitario}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {order.metodo_envio && <div className="order-address"><strong>Envío:</strong> {order.metodo_envio}</div>}
                    <div className="progress-track">
                      {(orderTracking[order.id] || []).map((step, index) => (
                        <div key={`${order.id}-${index}`} className={`progress-step ${step.estado}`}>
                          <div className="step-dot">{index + 1}</div>
                          <strong>{step.paso}</strong>
                          <span>{new Date(step.actualizado_en).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      <nav className="category-strip" aria-label="Categorías">
        <button type="button" className="category-chip" onClick={() => { setSearchResults(null); setSearchQuery(""); }}>
          Todos
        </button>
        {categoryCards.map((categoria) => (
          <button key={categoria.id} type="button" className="category-chip" onClick={() => { setSearchQuery(categoria.nombre); handleSearch(); }}>
            {categoria.nombre}
          </button>
        ))}
      </nav>

      <main className="page-content">
        {actionMessage && <div className="save-message">{actionMessage}</div>}
        {saveMessage && <div className="save-message">{saveMessage}</div>}

        <section className="product-suggestions">
          <h2>Sugerencias de Productos</h2>
          <div className="product-grid">
            {products.slice(0, 12).map((product) => (
              <article key={product.id} className="product-card glass-card">
                <div className="product-image"><img src={product.imagen} alt={product.nombre} /></div>
                <div className="product-body">
                  <h4>{product.nombre}</h4>
                  <p className="seller-name">{product.tienda}</p>
                  <div className="product-price">${product.precio}</div>
                  <div className="product-discount">{product.descuento ? `${product.descuento}% OFF` : ""}</div>
                  <button className="mini-button" type="button" onClick={() => addToCart(product)}>Agregar al carrito</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

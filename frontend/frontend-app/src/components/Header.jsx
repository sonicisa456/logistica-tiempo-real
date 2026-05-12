import ThemeToggle from "./ThemeToggle";

function Header({ user, addressLabel, searchValue, onSearchChange, onSearchSubmit, onNavigate, onOpenLocation, cartCount, page, theme, onThemeChange, onLogout, searchSuggestions = [], currency, currencies = [], onCurrencyChange }) {
  return (
    <header className="market-header">
      <div className="header-brand">
        <button className="icon-button" type="button" onClick={() => onNavigate("home")} aria-label="Ir al inicio">
          ◎
        </button>
        <div>
          <p className="eyebrow">Entregas inteligentes en tiempo real</p>
          <strong>FlashGo Market</strong>
        </div>
      </div>

      <form className="search-shell" onSubmit={onSearchSubmit}>
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Busca audífonos, laptop, teclado, ofertas..."
          list="search-suggestions"
        />
        <button type="submit">Buscar</button>
      </form>
      <datalist id="search-suggestions">
        {searchSuggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>

      <button className="location-pill" type="button" onClick={onOpenLocation}>
        <span>📍</span>
        <div>
          <small>{addressLabel === "Selecciona tu ubicación" ? "Ubicación" : "Enviar a"}</small>
          <strong>{addressLabel}</strong>
        </div>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)} className="header-link">
          {currencies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="header-actions">
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
        <button type="button" className={page === "orders" ? "header-link active" : "header-link"} onClick={() => onNavigate("orders")}>Mis pedidos</button>
        <button type="button" className={page === "seller" ? "header-link active" : "header-link"} onClick={() => onNavigate("seller")}>Vender</button>
        <button type="button" className={page === "cart" ? "header-link active" : "header-link"} onClick={() => onNavigate("cart")}>Carrito ({cartCount})</button>
        {user ? (
          <>
            <button type="button" className={page === "login" ? "header-link active" : "header-link"} onClick={() => onNavigate("login")}>{user.nombre}</button>
            <button type="button" className="header-link" onClick={onLogout}>Salir</button>
          </>
        ) : (
          <>
            <button type="button" className={page === "login" ? "header-link active" : "header-link"} onClick={() => onNavigate("login")}>Iniciar sesión</button>
            <button type="button" className="header-link" onClick={() => onNavigate("login")}>Crear cuenta</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
function Navbar({ categories, activeCategory, onCategorySelect, onNavigate }) {
  return (
    <nav className="category-nav" aria-label="Categorías principales">
      <button type="button" className={activeCategory === "" ? "category-chip active" : "category-chip"} onClick={() => onCategorySelect("")}>Todo</button>
      {categories.map((category) => (
        <button key={category} type="button" className={activeCategory === category ? "category-chip active" : "category-chip"} onClick={() => onCategorySelect(category)}>
          {category}
        </button>
      ))}
      <button type="button" className="category-chip featured" onClick={() => onNavigate("seller")}>Ofertas de vendedores</button>
    </nav>
  );
}

export default Navbar;
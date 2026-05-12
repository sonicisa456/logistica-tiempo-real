import { useEffect } from "react";

function ThemeToggle({ theme, onThemeChange }) {
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
      title={`Cambiar a ${theme === "dark" ? "modo claro" : "modo oscuro"}`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

export default ThemeToggle;

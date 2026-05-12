import { useMemo, useState } from "react";

const addressMap = {
  México: {
    "Nuevo León": ["Monterrey", "San Nicolás", "Guadalupe", "Apodaca"],
    Jalisco: ["Guadalajara", "Zapopan", "Tlaquepaque"],
    CDMX: ["Benito Juárez", "Coyoacán", "Miguel Hidalgo"],
  },
  "Estados Unidos": {
    Texas: ["Dallas", "Houston", "Austin"],
    California: ["Los Angeles", "San Diego", "San Jose"],
  },
  Canadá: {
    Ontario: ["Toronto", "Ottawa"],
    Quebec: ["Montreal", "Quebec City"],
  },
  Argentina: {
    "Buenos Aires": ["La Plata", "Mar del Plata"],
    Córdoba: ["Córdoba Capital", "Villa Carlos Paz"],
  },
};

function ModalDireccion({ open, onClose, onSave, initialValue }) {
  const countries = useMemo(() => Object.keys(addressMap), []);
  const [form, setForm] = useState(
    initialValue || {
      pais: "México",
      estado: "Nuevo León",
      ciudad: "San Nicolás",
      colonia: "Centro",
      calle: "Av. Universidad 123",
      codigo_postal: "66400",
      referencia: "",
      is_default: true,
    },
  );

  if (!open) {
    return null;
  }

  const states = Object.keys(addressMap[form.pais] || {});
  const cities = addressMap[form.pais]?.[form.estado] || [];

  const updateField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "pais") {
        const nextStates = Object.keys(addressMap[value] || {});
        next.estado = nextStates[0] || "";
        next.ciudad = addressMap[value]?.[next.estado]?.[0] || "";
      }
      if (field === "estado") {
        next.ciudad = addressMap[next.pais]?.[value]?.[0] || "";
      }
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Ubicación dinámica</p>
            <h2>Configura tu dirección</h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <form className="address-form" onSubmit={handleSubmit}>
          <label>
            País
            <select value={form.pais} onChange={(event) => updateField("pais", event.target.value)}>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </label>
          <label>
            Estado
            <select value={form.estado} onChange={(event) => updateField("estado", event.target.value)}>
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </label>
          <label>
            Ciudad
            <select value={form.ciudad} onChange={(event) => updateField("ciudad", event.target.value)}>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </label>
          <label>
            Colonia
            <input value={form.colonia} onChange={(event) => updateField("colonia", event.target.value)} />
          </label>
          <label>
            Calle
            <input value={form.calle} onChange={(event) => updateField("calle", event.target.value)} />
          </label>
          <label>
            Código postal
            <input value={form.codigo_postal} onChange={(event) => updateField("codigo_postal", event.target.value)} />
          </label>
          <label>
            Referencia
            <input value={form.referencia} onChange={(event) => updateField("referencia", event.target.value)} />
          </label>
          <label className="checkbox-line">
            <input type="checkbox" checked={Boolean(form.is_default)} onChange={(event) => updateField("is_default", event.target.checked)} />
            Guardar como dirección principal
          </label>
          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="primary-button">Guardar dirección</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalDireccion;
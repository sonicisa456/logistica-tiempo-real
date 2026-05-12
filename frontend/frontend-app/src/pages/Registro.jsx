function Registro({ form, onChange, onSubmit, onToggle }) {
  return (
    <main className="page-layout auth-layout">
      <section className="auth-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Registro</p>
            <h1>Crear cuenta</h1>
          </div>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          <input name="nombre" value={form.nombre} onChange={onChange} placeholder="Nombre" />
          <input name="correo" value={form.correo} onChange={onChange} placeholder="Correo" />
          <input name="password" type="password" value={form.password} onChange={onChange} placeholder="Contraseña" />
          <button type="submit" className="primary-button">Registrarme</button>
        </form>
        <button type="button" className="ghost-button full-width" onClick={onToggle}>Ya tengo cuenta</button>
      </section>
    </main>
  );
}

export default Registro;
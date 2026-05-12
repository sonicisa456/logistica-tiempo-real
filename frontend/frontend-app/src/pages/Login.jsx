function Login({ form, onChange, onSubmit, onToggle }) {
  return (
    <main className="page-layout auth-layout">
      <section className="auth-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Acceso</p>
            <h1>Entrar al marketplace</h1>
          </div>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          <input name="correo" value={form.correo} onChange={onChange} placeholder="Correo" />
          <input name="password" type="password" value={form.password} onChange={onChange} placeholder="Contraseña" />
          <button type="submit" className="primary-button">Ingresar</button>
        </form>
        <button type="button" className="ghost-button full-width" onClick={onToggle}>Ir a registro</button>
      </section>
    </main>
  );
}

export default Login;
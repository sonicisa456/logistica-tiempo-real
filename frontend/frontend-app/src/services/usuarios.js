import API from "./api";

export const listarUsuarios = async () => {
  const { data } = await API.get("/usuarios");
  return data;
};

export const registrarUsuario = async (payload) => {
  const { data } = await API.post("/usuarios", payload);
  return data;
};

export const loginUsuario = async (payload) => {
  const { data } = await API.post("/usuarios/login", payload);
  return data;
};

export const obtenerSesionActual = async () => {
  const { data } = await API.get("/usuarios/sesion");
  return data;
};

export const cerrarSesion = async () => {
  const { data } = await API.post("/usuarios/salir");
  return data;
};

export const registrarVendedor = async (payload) => {
  const { data } = await API.post("/vendedores", payload);
  return data;
};

export const listarDirecciones = async (usuarioId) => {
  const { data } = await API.get("/direcciones", { params: { usuario_id: usuarioId } });
  return data;
};

export const crearDireccion = async (payload) => {
  const { data } = await API.post("/direcciones", payload);
  return data;
};

export const actualizarDireccion = async (id, payload) => {
  const { data } = await API.put(`/direcciones/${id}`, payload);
  return data;
};

export const listarVendedores = async () => {
  const { data } = await API.get("/vendedores");
  return data;
};

export const convertirUsuarioVendedor = async (usuarioId) => {
  const { data } = await API.put(`/usuarios/${usuarioId}/vendedor`);
  return data;
};

export const actualizarTemaUsuario = async (usuarioId, tema) => {
  const { data } = await API.put(`/usuarios/${usuarioId}/tema`, { tema });
  return data;
};
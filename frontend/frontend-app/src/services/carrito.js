import API from "./api";

export const listarCarrito = async (usuarioId) => {
  const { data } = await API.get("/carrito", { params: { usuario_id: usuarioId } });
  return data;
};

export const agregarCarrito = async (payload) => {
  const { data } = await API.post("/carrito", payload);
  return data;
};

export const actualizarCarrito = async (itemId, payload) => {
  const { data } = await API.patch(`/carrito/${itemId}`, payload);
  return data;
};

export const eliminarCarrito = async (itemId) => {
  const { data } = await API.delete(`/carrito/${itemId}`);
  return data;
};

export const vaciarCarrito = async (usuarioId) => {
  const { data } = await API.delete("/carrito", { params: { usuario_id: usuarioId } });
  return data;
};
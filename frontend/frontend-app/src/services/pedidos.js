import API from "./api";

export const listarPedidos = async (usuarioId) => {
  const { data } = await API.get("/pedidos", { params: { usuario_id: usuarioId } });
  return data;
};

export const crearPedido = async (payload) => {
  const { data } = await API.post("/pedidos", payload);
  return data;
};

export const obtenerRastreo = async (pedidoId) => {
  const { data } = await API.get(`/rastreo/${pedidoId}`);
  return data;
};
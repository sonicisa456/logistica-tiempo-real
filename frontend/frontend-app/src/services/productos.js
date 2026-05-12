import API from "./api";

export const listarProductos = async (params = {}) => {
  const { data } = await API.get("/productos", { params });
  return data;
};

export const obtenerProducto = async (id) => {
  const { data } = await API.get(`/productos/${id}`);
  return data;
};

export const crearProducto = async (payload) => {
  const { data } = await API.post("/productos", payload);
  return data;
};

export const actualizarProducto = async (id, payload) => {
  const { data } = await API.put(`/productos/${id}`, payload);
  return data;
};

export const listarOfertas = async () => {
  const { data } = await API.get("/ofertas");
  return data;
};
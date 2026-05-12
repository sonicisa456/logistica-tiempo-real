import API from "./api";

export const convertir = async (from = "MXN", to = "USD", amount = 1) => {
  const { data } = await API.get("/convert", { params: { from, to, amount } });
  return data;
};

export default { convertir };

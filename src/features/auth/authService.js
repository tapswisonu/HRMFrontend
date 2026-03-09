import api from "../../app/api";

const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data?.data || response.data;
};

const register = async (userData) => {
  const response = await api.post("/auth/admin-register", userData);
  return response.data?.data || response.data;
};

const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data.data ?? response.data;
};

const authService = {
  login,
  register,
  getMe,
};

export default authService;

import api from "../../app/api";

const login = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data; // { id, name, email, role, token }
};

const authService = { login };
export default authService;

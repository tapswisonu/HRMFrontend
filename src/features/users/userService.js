import api from "../../app/api";

const fetchUsersByRole = async (role) => {
  const res = await api.get(`/admin/users/${role}`);
  return res.data; // array of users
};

const createUser = async (payload) => {
  const res = await api.post("/admin/create-user", payload);
  return res.data; // created user
};

const userService = { fetchUsersByRole, createUser };
export default userService;

import api from "../../app/api";

const fetchUsersByRole = async (role) => {
  const res = await api.get(`/employee/users/${role}`);
  return res.data.data ?? res.data;
};

const createUser = async (payload) => {
  const res = await api.post("/employee/create-user", payload);
  return res.data.data ?? res.data;
};

const getAllEmployees = async () => {
  const res = await api.get("/employee/employees");
  return res.data.data ?? res.data;
};

const deleteUser = async (id) => {
  const res = await api.delete(`/employee/user/${id}`);
  return res.data;
};

const resetPassword = async (id, newPassword) => {
  const res = await api.put(`/employee/user/${id}/reset-password`, { newPassword });
  return res.data;
};

const userService = { fetchUsersByRole, createUser, getAllEmployees, deleteUser, resetPassword };
export default userService;

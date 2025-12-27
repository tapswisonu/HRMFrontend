import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

const tokenFromStorage = localStorage.getItem("token") || null;
const userFromStorage = JSON.parse(localStorage.getItem("user") || "null");

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const data = await authService.login(credentials);
      return data; // MUST contain token + user
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: tokenFromStorage,
    user: userFromStorage,
    loading: false,
    error: null,
  },

  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })

      .addCase(login.fulfilled, (s, action) => {
        s.loading = false;

        // REAL correct structure
        const { token, user } = action.payload;

        s.token = token;
        s.user = user;  // FULL user object containing role

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      })

      .addCase(login.rejected, (s, action) => {
        s.loading = false;
        s.error = action.payload || "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

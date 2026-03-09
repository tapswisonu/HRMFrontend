import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

const getTokenFromStorage = () => {
  const t = localStorage.getItem("token");
  return t && t !== "undefined" && t !== "null" ? t : null;
};

const getUserFromStorage = () => {
  try {
    const u = localStorage.getItem("user");
    return u && u !== "undefined" ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

const tokenFromStorage = getTokenFromStorage();
const userFromStorage = getUserFromStorage();

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      return await authService.login(credentials);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
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
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          id: action.payload.user?._id || action.payload.user?.id || action.payload.id,
          name: action.payload.user?.name || action.payload.name,
          role: action.payload.user?.role || action.payload.role,
        };
        localStorage.setItem("token", state.token);
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          id: action.payload.user?._id || action.payload.user?.id || action.payload.id,
          name: action.payload.user?.name || action.payload.name,
          role: action.payload.user?.role || action.payload.role,
        };
        localStorage.setItem("token", state.token);
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

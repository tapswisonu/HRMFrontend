import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchUsersByRole = createAsyncThunk(
  "users/fetchByRole",
  async (role, thunkAPI) => {
    try {
      const res = await api.get(`/admin/users/${role}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "users/create",
  async (payload, thunkAPI) => {
    try {
      const res = await api.post("/admin/create-user", payload);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchUsersByRole.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(fetchUsersByRole.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchUsersByRole.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(createUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createUser.fulfilled, (s, a) => {
        s.loading = false;
        s.list.unshift(a.payload);
      })
      .addCase(createUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export default usersSlice.reducer;

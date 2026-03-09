import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "./userService";

export const fetchUsersByRole = createAsyncThunk(
  "users/fetchByRole",
  async (role, thunkAPI) => {
    try {
      return await userService.fetchUsersByRole(role);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (payload, thunkAPI) => {
    try {
      return await userService.createUser(payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, thunkAPI) => {
    try {
      await userService.deleteUser(id);
      return id; // return id to remove from list
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  "users/resetPassword",
  async ({ id, newPassword }, thunkAPI) => {
    try {
      return await userService.resetPassword(id, newPassword);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchUsersByRole.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchUsersByRole.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchUsersByRole.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createUser.fulfilled, (s, a) => { s.loading = false; s.list.unshift(a.payload); })
      .addCase(createUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(deleteUser.fulfilled, (s, a) => {
        s.list = s.list.filter((u) => u._id !== a.payload);
      })

      .addCase(resetUserPassword.pending, (s) => { s.error = null; })
      .addCase(resetUserPassword.rejected, (s, a) => { s.error = a.payload; });
  },
});

export default usersSlice.reducer;

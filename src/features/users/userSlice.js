import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "./userService";

export const fetchUsersByRole = createAsyncThunk(
  "users/fetchByRole",
  async (role, thunkAPI) => {
    try {
      const res = await userService.fetchUsersByRole(role);
      return res.users || res;  // return ONLY array
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const createUser = createAsyncThunk(
  "users/createUser",
  async (payload, thunkAPI) => {
    try {
      const data = await userService.createUser(payload);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return thunkAPI.rejectWithValue(message);
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

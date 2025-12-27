import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../app/api";

// ==========================
// FETCH ATTENDANCE LIST
// ==========================
export const fetchAttendance = createAsyncThunk(
  "attendance/fetchAttendance",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/attendance/getMyAttendance");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Failed to load attendance" }
      );
    }
  }
);

// ==========================
// CHECK-IN
// ==========================
export const doCheckIn = createAsyncThunk(
  "attendance/doCheckIn",
  async (payload, thunkAPI) => {
    try {
      const { data } = await api.post("/attendance/checkin", payload);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Check-in failed" }
      );
    }
  }
);

// ==========================
// CHECK-OUT
// ==========================
export const doCheckOut = createAsyncThunk(
  "attendance/doCheckOut",
  async (payload, thunkAPI) => {
    try {
      const { data } = await api.post("/attendance/checkout", payload);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Check-out failed" }
      );
    }
  }
);

// ==========================
// SLICE
// ==========================
const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    loading: false,
    attendanceList: [],
    lastActionWarnings: [],
    error: null,
  },

  reducers: {
    clearWarnings: (state) => {
      state.lastActionWarnings = [];
    },
  },

  extraReducers: (builder) => {
    builder
      // FETCH ATTENDANCE
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceList = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // CHECK-IN
      .addCase(doCheckIn.pending, (state) => {
        state.loading = true;
        state.lastActionWarnings = [];
      })
      .addCase(doCheckIn.fulfilled, (state, action) => {
        state.loading = false;
        const newRec = action.payload.attendance;
        state.attendanceList.unshift(newRec);
        state.lastActionWarnings = action.payload.warnings;
      })
      .addCase(doCheckIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // CHECK-OUT
      .addCase(doCheckOut.pending, (state) => {
        state.loading = true;
        state.lastActionWarnings = [];
      })
      .addCase(doCheckOut.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.attendance;

        // update record
        state.attendanceList = state.attendanceList.map((rec) =>
          rec._id === updated._id ? updated : rec
        );

        state.lastActionWarnings = action.payload.warnings;
      })
      .addCase(doCheckOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearWarnings } = attendanceSlice.actions;
export default attendanceSlice.reducer;

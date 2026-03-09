import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import attendanceService from "./attendanceService";

export const fetchAttendance = createAsyncThunk(
    "attendance/fetchAttendance",
    async (_, thunkAPI) => {
        try {
            return await attendanceService.getMyAttendance();
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Failed to load attendance" });
        }
    }
);

export const fetchAllAttendance = createAsyncThunk(
    "attendance/fetchAllAttendance",
    async (_, thunkAPI) => {
        try {
            return await attendanceService.getAllAttendance();
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Failed to load all attendance" });
        }
    }
);

export const doCheckIn = createAsyncThunk(
    "attendance/doCheckIn",
    async (payload, thunkAPI) => {
        try {
            return await attendanceService.checkIn(payload);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Check-in failed" });
        }
    }
);

export const doCheckOut = createAsyncThunk(
    "attendance/doCheckOut",
    async (payload, thunkAPI) => {
        try {
            return await attendanceService.checkOut(payload);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Check-out failed" });
        }
    }
);

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
            .addCase(fetchAllAttendance.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceList = action.payload;
            })
            .addCase(fetchAllAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(doCheckIn.pending, (state) => {
                state.loading = true;
                state.lastActionWarnings = [];
            })
            .addCase(doCheckIn.fulfilled, (state, action) => {
                state.loading = false;
                const newRecord = action.payload || {};
                state.attendanceList.unshift(newRecord);
                state.lastActionWarnings = newRecord.validationWarnings || [];
            })
            .addCase(doCheckIn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(doCheckOut.pending, (state) => {
                state.loading = true;
                state.lastActionWarnings = [];
            })
            .addCase(doCheckOut.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload || {};
                state.attendanceList = state.attendanceList.map((rec) =>
                    rec._id === updated._id ? updated : rec
                );
                state.lastActionWarnings = updated.validationWarnings || [];
            })
            .addCase(doCheckOut.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            });
    },
});

export const { clearWarnings } = attendanceSlice.actions;
export default attendanceSlice.reducer;

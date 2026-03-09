import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../app/api";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchMyLeaveRequests = createAsyncThunk(
    "leave/fetchMine",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/holiday/my-requests");
            return data.data ?? data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchAllLeaveRequests = createAsyncThunk(
    "leave/fetchAll",
    async (status = "all", { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/holiday/requests/all?status=${status}`);
            return data.data ?? data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchMyLeaveBalance = createAsyncThunk(
    "leave/fetchBalance",
    async (year, { rejectWithValue }) => {
        try {
            const y = year || new Date().getFullYear();
            const { data } = await api.get(`/holiday/balance?year=${y}`);
            return data.data ?? data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchEmployeeLeaveBalance = createAsyncThunk(
    "leave/fetchEmployeeBalance",
    async ({ employeeId, year }, { rejectWithValue }) => {
        try {
            const y = year || new Date().getFullYear();
            const { data } = await api.get(`/holiday/balance/${employeeId}?year=${y}`);
            return data.data ?? data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const submitLeaveRequest = createAsyncThunk(
    "leave/submit",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/holiday/request", payload);
            return data.data ?? data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const reviewLeaveRequest = createAsyncThunk(
    "leave/review",
    async ({ id, status, adminRemark }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/holiday/requests/${id}/review`, { status, adminRemark });
            return data.data ?? data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchEmployeeLeaveHistory = createAsyncThunk(
    "leave/fetchHistory",
    async (employeeId, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/holiday/history/${employeeId}`);
            return { employeeId, history: data.data ?? data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const leaveSlice = createSlice({
    name: "leave",
    initialState: {
        requests: [],
        balance: null,
        employeeHistories: {}, // { [employeeId]: [...] }
        loading: false,
        submitting: false,
        reviewing: false,
        error: null,
    },
    reducers: {
        clearError: (s) => { s.error = null; },
    },
    extraReducers: (b) => {
        const pending = (key) => (s) => { s[key] = true; s.error = null; };
        const rejected = (key) => (s, a) => { s[key] = false; s.error = a.payload; };

        b
            .addCase(fetchMyLeaveRequests.pending, pending("loading"))
            .addCase(fetchMyLeaveRequests.fulfilled, (s, a) => { s.loading = false; s.requests = a.payload; })
            .addCase(fetchMyLeaveRequests.rejected, rejected("loading"))

            .addCase(fetchAllLeaveRequests.pending, pending("loading"))
            .addCase(fetchAllLeaveRequests.fulfilled, (s, a) => { s.loading = false; s.requests = a.payload; })
            .addCase(fetchAllLeaveRequests.rejected, rejected("loading"))

            .addCase(fetchMyLeaveBalance.pending, pending("loading"))
            .addCase(fetchMyLeaveBalance.fulfilled, (s, a) => { s.loading = false; s.balance = a.payload; })
            .addCase(fetchMyLeaveBalance.rejected, rejected("loading"))

            .addCase(fetchEmployeeLeaveBalance.fulfilled, (s, a) => { s.balance = a.payload; })

            .addCase(submitLeaveRequest.pending, pending("submitting"))
            .addCase(submitLeaveRequest.fulfilled, (s, a) => {
                s.submitting = false;
                s.requests.unshift(a.payload);
            })
            .addCase(submitLeaveRequest.rejected, rejected("submitting"))

            .addCase(reviewLeaveRequest.pending, pending("reviewing"))
            .addCase(reviewLeaveRequest.fulfilled, (s, a) => {
                s.reviewing = false;
                const idx = s.requests.findIndex((r) => r._id === a.payload._id);
                if (idx !== -1) s.requests[idx] = a.payload;
            })
            .addCase(reviewLeaveRequest.rejected, rejected("reviewing"))

            .addCase(fetchEmployeeLeaveHistory.fulfilled, (s, a) => {
                s.employeeHistories[a.payload.employeeId] = a.payload.history;
            });
    },
});

export const { clearError } = leaveSlice.actions;
export default leaveSlice.reducer;

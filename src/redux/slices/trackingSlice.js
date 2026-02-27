import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = "http://localhost:8000/api";

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchTrackingSettings = createAsyncThunk(
    "tracking/fetch",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const { data } = await axios.get(`${BASE}/attendance/tracking-settings`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const updateTrackingSettings = createAsyncThunk(
    "tracking/update",
    async (payload, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const { data } = await axios.put(`${BASE}/admin/tracking-settings`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return data.settings;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const trackingSlice = createSlice({
    name: "tracking",
    initialState: {
        settings: {
            locationTracking: true,
            locationMandatory: true,
            deviceTracking: true,
            deviceMandatory: true,
            requiredHoursPerDay: 8,
        },
        loading: false,
        saving: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTrackingSettings.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchTrackingSettings.fulfilled, (s, a) => { s.loading = false; s.settings = a.payload; })
            .addCase(fetchTrackingSettings.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(updateTrackingSettings.pending, (s) => { s.saving = true; })
            .addCase(updateTrackingSettings.fulfilled, (s, a) => { s.saving = false; s.settings = a.payload; })
            .addCase(updateTrackingSettings.rejected, (s, a) => { s.saving = false; s.error = a.payload; });
    },
});

export default trackingSlice.reducer;

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import usersReducer from "../features/users/userSlice";
import attendanceReducer from "../features/attendance/attendanceSlice";
import trackingReducer from "../features/tracking/trackingSlice";
import leaveReducer from "../features/holiday/leaveSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: usersReducer,
        attendance: attendanceReducer,
        tracking: trackingReducer,
        leave: leaveReducer,
    },
});

export default store;


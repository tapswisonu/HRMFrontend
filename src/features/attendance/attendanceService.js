import api from "../../app/api";

const getMyAttendance = async (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const { data } = await api.get("/attendance/my-attendance", { params });
    // Backend wraps response in { success, data } — extract data
    return data.data ?? data;
};

const getAllAttendance = async () => {
    const { data } = await api.get("/attendance/requests/all");
    return data.data ?? data;
};

const checkIn = async (payload) => {
    const { data } = await api.post("/attendance/check-in", payload);
    return data.data ?? data;
};

const checkOut = async (payload) => {
    const { data } = await api.post("/attendance/check-out", payload);
    return data.data ?? data;
};

const attendanceService = {
    getMyAttendance,
    getAllAttendance,
    checkIn,
    checkOut,
};

export default attendanceService;

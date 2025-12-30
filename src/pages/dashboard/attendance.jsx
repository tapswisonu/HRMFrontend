import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAttendance } from "../../redux/slices/attendanceSlice";
// Checking previous view_file: src/redux/slices/attendanceSlice.js
// So import should be from "../../redux/slices/attendanceSlice"

import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Chip,
} from "@material-tailwind/react";

export function Attendance() {
    const dispatch = useDispatch();
    // Ensure we select the right state. In store.js, is it 'attendance'?
    const { attendanceList, loading, error } = useSelector((state) => state.attendance);

    useEffect(() => {
        dispatch(fetchAllAttendance());
    }, [dispatch]);

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                    <Typography variant="h6" color="white">
                        All Employee Attendance
                    </Typography>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    {loading && <div className="p-4 text-center">Loading...</div>}
                    {error && <div className="p-4 text-center text-red-500">{error}</div>}

                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                                {["Employee", "Date", "Status", "Check In", "Check Out", "Device"].map((el) => (
                                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                        <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                            {el}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceList && attendanceList.map((record, key) => {
                                const className = `py-3 px-5 ${key === attendanceList.length - 1 ? "" : "border-b border-blue-gray-50"
                                    }`;

                                return (
                                    <tr key={record._id || key}>
                                        <td className={className}>
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                                        {record.user?.name || "Unknown"}
                                                    </Typography>
                                                    <Typography className="text-xs font-normal text-blue-gray-500">
                                                        {record.user?.email || ""}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={className}>
                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                {new Date(record.date).toLocaleDateString()}
                                            </Typography>
                                        </td>
                                        <td className={className}>
                                            <Chip
                                                variant="gradient"
                                                color={record.status === "Checked In" ? "green" : "blue-gray"}
                                                value={record.status || "N/A"}
                                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                            />
                                        </td>
                                        <td className={className}>
                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                            </Typography>
                                        </td>
                                        <td className={className}>
                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                            </Typography>
                                        </td>
                                        <td className={className}>
                                            <Typography className="text-xs text-blue-gray-500">
                                                {record.deviceId || "N/A"}
                                            </Typography>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardBody>
            </Card>
        </div>
    );
}

export default Attendance;

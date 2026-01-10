import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAttendance } from "../../redux/slices/attendanceSlice";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Chip,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Select,
    Option,
} from "@material-tailwind/react";
import { PencilIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { toast } from "react-toastify";

export function Attendance() {
    const dispatch = useDispatch();
    const { attendanceList, loading, error } = useSelector((state) => state.attendance);
    const { token } = useSelector((state) => state.auth);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [formData, setFormData] = useState({
        checkInTime: "",
        checkOutTime: "",
        status: "",
    });

    useEffect(() => {
        dispatch(fetchAllAttendance());
    }, [dispatch]);

    const handleEdit = (record) => {
        setSelectedRecord(record);
        setFormData({
            checkInTime: record.checkInTime ? new Date(record.checkInTime).toISOString().slice(0, 16) : "",
            checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toISOString().slice(0, 16) : "",
            status: record.status || "Checked In",
        });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.put(
                `http://localhost:8000/api/attendance/${selectedRecord._id}`,
                formData,
                config
            );

            toast.success("Attendance updated successfully");
            setOpenDialog(false);
            dispatch(fetchAllAttendance()); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to update attendance");
        }
    };

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
                                {["Employee", "Date", "Status", "Check In", "Check Out", "Device", "Action"].map((el) => (
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
                                        <td className={className}>
                                            <Button variant="text" size="sm" onClick={() => handleEdit(record)}>
                                                <PencilIcon className="h-4 w-4 text-blue-gray-500" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={openDialog} handler={() => setOpenDialog(!openDialog)}>
                <DialogHeader>Edit Attendance Record</DialogHeader>
                <DialogBody divider className="flex flex-col gap-4">
                    <Input
                        type="datetime-local"
                        label="Check In Time"
                        value={formData.checkInTime}
                        onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                    />
                    <Input
                        type="datetime-local"
                        label="Check Out Time"
                        value={formData.checkOutTime}
                        onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                    />
                    <Select
                        label="Status"
                        value={formData.status}
                        onChange={(val) => setFormData({ ...formData, status: val })}
                    >
                        <Option value="Checked In">Checked In</Option>
                        <Option value="Checked Out">Checked Out</Option>
                        <Option value="Absent">Absent</Option>
                    </Select>
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={() => setOpenDialog(false)} className="mr-1">
                        Cancel
                    </Button>
                    <Button variant="gradient" color="green" onClick={handleSave}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </Dialog>

        </div>
    );
}

export default Attendance;

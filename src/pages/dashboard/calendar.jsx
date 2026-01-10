
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Textarea,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { format, isSameDay, parseISO } from "date-fns";

export function CalendarPage() {
    const [date, setDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [attendance, setAttendance] = useState([]); // Attendance Records
    const [openModal, setOpenModal] = useState(false);
    const [newAppt, setNewAppt] = useState({ title: "", description: "", date: "" });

    const { user, token } = useSelector((state) => state.auth);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Fetch Appointments (Global)
            const apptRes = await axios.get("http://localhost:8000/api/admin/appointments", config);
            setAppointments(apptRes.data);

            // 2. Fetch My Attendance (If Employee)
            // Even admins might want to see their own? Let's just fetch for everyone logged in.
            // The route /getMyAttendance is available for all protected roles.
            const attRes = await axios.get("http://localhost:8000/api/attendance/getMyAttendance", config);
            setAttendance(attRes.data);

        } catch (error) {
            console.error(error);
            // toast.error("Failed to fetch data"); // specific error handling better
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleCreateAppointment = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // If date not set in input, use selected calendar date
            const apptDate = newAppt.date ? new Date(newAppt.date) : date;

            await axios.post("http://localhost:8000/api/admin/appointment", {
                ...newAppt,
                date: apptDate
            }, config);

            toast.success("Appointment created!");
            setOpenModal(false);
            setNewAppt({ title: "", description: "", date: "" });
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create appointment");
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const content = [];

            // 1. Check for Appointments (Blue Dot)
            const dayAppts = appointments.filter(app => isSameDay(new Date(app.date), date));
            if (dayAppts.length > 0) {
                content.push(<div key="appt" className="w-2 h-2 bg-blue-500 rounded-full" title="Event"></div>);
            }

            // 2. Check for Attendance (Green/Red Dot)
            // Only if role is employee (or if we want everyone to see it)
            // Let's show for everyone as requested "employee side"

            const isPresent = attendance.find(att => isSameDay(new Date(att.date), date));

            if (isPresent) {
                content.push(<div key="present" className="w-2 h-2 bg-green-500 rounded-full" title="Present"></div>);
            } else {
                // Check if Absent: Past Date AND Weekday AND Not Today
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (date < today && date.getDay() !== 0 && date.getDay() !== 6) {
                    content.push(<div key="absent" className="w-2 h-2 bg-red-500 rounded-full" title="Absent"></div>);
                }
            }

            return <div className="flex gap-1 justify-center mt-1">{content}</div>;
        }
        return null;
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex justify-between items-center">
                    <Typography variant="h6" color="white">
                        Calendar & Appointments
                    </Typography>
                    {user?.role === 'admin' && (
                        <Button color="white" size="sm" variant="outlined" onClick={() => setOpenModal(true)}>
                            + Add Appointment
                        </Button>
                    )}
                </CardHeader>
                <CardBody className="flex flex-col lg:flex-row gap-8 p-4">
                    <div className="flex-1 flex flex-col gap-4">
                        {/* Legend */}
                        <div className="flex gap-6 justify-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div> Present
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div> Absent
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div> Event
                            </div>
                        </div>

                        <Calendar
                            onChange={setDate}
                            value={date}
                            className="w-full border-none shadow-md rounded-xl p-4 font-sans"
                            tileContent={tileContent}
                            tileClassName="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        />
                    </div>

                    <div className="flex-1 flex flex-col gap-6">
                        <div>
                            <Typography variant="h5" color="blue-gray" className="mb-1 font-bold">
                                {format(date, "MMMM do, yyyy")}
                            </Typography>
                            <Typography variant="small" className="text-gray-500 font-normal">
                                Daily Overview
                            </Typography>
                        </div>

                        {/* Attendance Status Card */}
                        <Card className="border border-blue-gray-100 shadow-sm">
                            <CardBody className="p-4 flex items-center justify-between">
                                <div>
                                    <Typography variant="small" className="font-bold text-blue-gray-500 uppercase mb-1">
                                        Attendance Status
                                    </Typography>
                                    {(() => {
                                        const isDayPresent = attendance.find(att => isSameDay(new Date(att.date), date));
                                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                        const isFuture = date > new Date();

                                        if (isDayPresent) return <Typography color="green" className="font-bold flex items-center gap-2">● Present <span className="text-gray-400 text-sm font-normal">(In: {format(new Date(isDayPresent.checkInTime), 'HH:mm')})</span></Typography>;
                                        if (isWeekend) return <Typography className="italic text-gray-400 font-medium">Weekend</Typography>;
                                        if (isFuture) return <Typography className="italic text-gray-400 font-medium">Future Date</Typography>;

                                        return <Typography color="red" className="font-bold flex items-center gap-2">● Absent</Typography>;
                                    })()}
                                </div>
                            </CardBody>
                        </Card>

                        <div>
                            <Typography variant="h6" color="blue-gray" className="mb-3">
                                Scheduled Events
                            </Typography>
                            <div className="flex flex-col gap-3 h-64 overflow-y-auto pr-2">
                                {appointments.filter(app => isSameDay(new Date(app.date), date)).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-gray-200 rounded-lg p-6">
                                        <Typography color="gray" className="font-medium text-gray-400">No events scheduled</Typography>
                                        <Typography variant="small" className="text-gray-300 mt-1">Enjoy your free time!</Typography>
                                    </div>
                                ) : (
                                    appointments.filter(app => isSameDay(new Date(app.date), date)).map(app => (
                                        <div key={app._id} className="p-4 border-l-4 border-blue-500 bg-blue-50/50 rounded-r-lg shadow-sm hover:shadow-md transition-shadow">
                                            <Typography variant="h6" color="blue-gray" className="leading-tight">{app.title}</Typography>
                                            <Typography className="text-xs text-gray-600 mt-1 font-medium">{format(new Date(app.date), 'p')}</Typography>
                                            <Typography className="text-sm text-gray-600 mt-2">{app.description}</Typography>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Dialog open={openModal} handler={() => setOpenModal(!openModal)}>
                <DialogHeader>Add New Appointment</DialogHeader>
                <DialogBody divider className="flex flex-col gap-4">
                    <Input
                        label="Event Title"
                        value={newAppt.title}
                        onChange={(e) => setNewAppt({ ...newAppt, title: e.target.value })}
                    />
                    <Textarea
                        label="Description"
                        value={newAppt.description}
                        onChange={(e) => setNewAppt({ ...newAppt, description: e.target.value })}
                    />
                    <Input
                        type="datetime-local"
                        label="Date & Time"
                        value={newAppt.date}
                        onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                    />
                    <Typography variant="small" color="gray" className="text-center">
                        Or leave Date blank to use selected calendar date: {format(date, "PPP")}
                    </Typography>
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={() => setOpenModal(false)} className="mr-1">
                        Cancel
                    </Button>
                    <Button variant="gradient" color="blue" onClick={handleCreateAppointment}>
                        Create
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}

export default CalendarPage;

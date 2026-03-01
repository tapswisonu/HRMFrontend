import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { format, isSameDay } from "date-fns";
import { CalendarDaysIcon, PlusIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";

// Reusable Components
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";

export function CalendarPage() {
    const [date, setDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [attendance, setAttendance] = useState([]); // Attendance Records
    const [openModal, setOpenModal] = useState(false);
    const [newAppt, setNewAppt] = useState({ title: "", description: "", date: "" });
    const [saving, setSaving] = useState(false);

    const { user, token } = useSelector((state) => state.auth);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const apptRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/appointments`, config);
            setAppointments(apptRes.data);

            const attRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/attendance/getMyAttendance`, config);
            setAttendance(attRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleCreateAppointment = async () => {
        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const apptDate = newAppt.date ? new Date(newAppt.date) : date;

            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/appointment`, {
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
        } finally {
            setSaving(false);
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const content = [];

            // 1. Check for Appointments (Blue Dot)
            const dayAppts = appointments.filter(app => isSameDay(new Date(app.date), date));
            if (dayAppts.length > 0) {
                content.push(<div key="appt" className="w-2 h-2 bg-brand-primary rounded-full shadow-sm" title="Event"></div>);
            }

            // 2. Check for Attendance (Green/Red Dot)
            const isPresent = attendance.find(att => isSameDay(new Date(att.date), date));

            if (isPresent) {
                content.push(<div key="present" className="w-2 h-2 bg-brand-success rounded-full shadow-sm" title="Present"></div>);
            } else {
                // Check if Absent: Past Date AND Weekday AND Not Today
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (date < today && date.getDay() !== 0 && date.getDay() !== 6) {
                    content.push(<div key="absent" className="w-2 h-2 bg-brand-danger rounded-full shadow-sm" title="Absent"></div>);
                }
            }

            return <div className="flex gap-1 justify-center mt-1.5">{content}</div>;
        }
        return null;
    };

    const isDayPresent = attendance.find(att => isSameDay(new Date(att.date), date));
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isFuture = date > new Date();

    // Status display logic
    let attendanceStatusNode = null;
    if (isDayPresent) {
        attendanceStatusNode = (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-brand-success" />
                <span className="text-sm font-bold text-green-700">Present</span>
                <span className="text-xs font-semibold text-green-600/70 ml-2">In: {format(new Date(isDayPresent.checkInTime), 'HH:mm')}</span>
            </div>
        );
    } else if (isWeekend) {
        attendanceStatusNode = (
            <div className="px-4 py-2 bg-slate-50 border border-brand-border rounded-xl">
                <span className="text-sm font-bold text-slate-500 italic">Weekend</span>
            </div>
        );
    } else if (isFuture) {
        attendanceStatusNode = (
            <div className="px-4 py-2 bg-slate-50 border border-brand-border rounded-xl">
                <span className="text-sm font-bold text-slate-400 italic">Future Date</span>
            </div>
        );
    } else {
        attendanceStatusNode = (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-brand-danger" />
                <span className="text-sm font-bold text-red-700">Absent</span>
            </div>
        );
    }

    return (
        <div className="mt-8 mb-24 max-w-[1200px] mx-auto pb-10 flex flex-col gap-6">
            <PageHeader
                title="Calendar & Appointments"
                subtitle="Manage daily events and view attendance status"
                actionNode={user?.role === 'admin' ? (
                    <Button onClick={() => setOpenModal(true)} icon={<PlusIcon />} variant="primary">
                        Add Appointment
                    </Button>
                ) : null}
            />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Calendar Side */}
                <div className="flex-1 flex flex-col gap-5">
                    {/* Legend */}
                    <Card className="flex flex-row justify-center gap-6 !p-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
                            <div className="w-3 h-3 bg-brand-success rounded-full shadow-sm"></div> Present
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
                            <div className="w-3 h-3 bg-brand-danger rounded-full shadow-sm"></div> Absent
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
                            <div className="w-3 h-3 bg-brand-primary rounded-full shadow-sm"></div> Event
                        </div>
                    </Card>

                    <Card noPadding className="p-2 sm:p-5">
                        <style>{`
                            .react-calendar { width: 100%; border: none; font-family: inherit; }
                            .react-calendar__navigation button { font-weight: 800; border-radius: 12px; padding: 12px; transition: 0.2s; }
                            .react-calendar__navigation button:hover { background-color: #f1f5f9; }
                            .react-calendar__month-view__weekdays { font-weight: 800; font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
                            .react-calendar__tile { font-weight: 700; font-size: 14px; padding: 16px 8px; border-radius: 12px; transition: 0.2s; }
                            .react-calendar__tile--now { background-color: #eff6ff; color: #2563eb; }
                            .react-calendar__tile--active { background-color: #2563eb !important; color: white !important; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); }
                            .react-calendar__tile:hover:not(.react-calendar__tile--active) { background-color: #f8fafc; color: #2563eb; }
                        `}</style>
                        <Calendar
                            onChange={setDate}
                            value={date}
                            tileContent={tileContent}
                        />
                    </Card>
                </div>

                {/* Details Side */}
                <div className="flex-1 flex flex-col gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {format(date, "MMMM do, yyyy")}
                        </h2>
                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                            Daily Overview
                        </p>
                    </div>

                    {/* Attendance Status */}
                    <Card>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Attendance Status
                        </p>
                        {attendanceStatusNode}
                    </Card>

                    {/* Scheduled Events */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Scheduled Events
                        </p>
                        <Card noPadding className="h-[340px] flex flex-col">
                            <div className="flex-1 overflow-y-auto p-2">
                                {appointments.filter(app => isSameDay(new Date(app.date), date)).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-brand-border">
                                            <CalendarDaysIcon className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="font-bold text-slate-500">No events scheduled</p>
                                        <p className="text-sm font-semibold text-slate-400 mt-1">Enjoy your free time!</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 p-3">
                                        {appointments.filter(app => isSameDay(new Date(app.date), date)).map(app => (
                                            <div key={app._id} className="p-4 border-l-4 border-brand-primary bg-blue-50/50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                <p className="text-base font-black text-slate-800 leading-tight">{app.title}</p>
                                                <div className="flex items-center gap-1 mt-2 text-xs font-bold text-brand-primary bg-blue-100/50 w-max px-2 py-1 rounded-md">
                                                    <ClockIcon className="w-3.5 h-3.5" />
                                                    {format(new Date(app.date), 'p')}
                                                </div>
                                                <p className="text-sm font-medium text-slate-600 mt-3">{app.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ── Add Appointment Modal ─────────────────────────────────────── */}
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpenModal(false)} />

                    {/* Panel */}
                    <Card className="relative z-10 w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up p-0" noPadding>
                        <div className="h-1.5 w-full bg-brand-primary" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
                            <div>
                                <p className="text-lg font-black text-slate-800 tracking-tight">Add New Appointment</p>
                                <p className="text-xs font-bold text-slate-400 mt-0.5">Schedule an event for the team</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setOpenModal(false)} className="!p-1.5" icon={<XMarkIcon className="w-5 h-5 font-bold" />} />
                        </div>

                        {/* Body */}
                        <CardBody className="px-6 py-6 border-b border-brand-border flex flex-col gap-5">
                            <FormInput
                                label="Event Title"
                                value={newAppt.title}
                                onChange={(e) => setNewAppt({ ...newAppt, title: e.target.value })}
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                                <textarea
                                    value={newAppt.description}
                                    onChange={(e) => setNewAppt({ ...newAppt, description: e.target.value })}
                                    className="w-full p-3 rounded-xl text-sm font-medium text-slate-800 bg-white border border-brand-border placeholder-slate-400 outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 resize-none min-h-[100px]"
                                />
                            </div>

                            <FormInput
                                type="datetime-local"
                                label="Date & Time"
                                value={newAppt.date}
                                onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                            />

                            <p className="text-[11px] font-bold text-slate-400 text-center bg-brand-bg py-2 rounded-lg">
                                Or leave Date blank to use selected date: {format(date, "PPP")}
                            </p>
                        </CardBody>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-brand-bg">
                            <Button variant="ghost" onClick={() => setOpenModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleCreateAppointment} disabled={saving}>
                                {saving ? "Creating…" : "Create Event"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default CalendarPage;

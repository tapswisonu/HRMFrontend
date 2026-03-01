import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
    format,
    getDaysInMonth,
    isSameDay,
    eachDayOfInterval,
    startOfMonth,
    endOfMonth,
    isWeekend,
} from "date-fns";
import {
    MagnifyingGlassIcon,
    PencilSquareIcon,
    CalendarDaysIcon,
    XMarkIcon,
    CheckIcon,
    BanknotesIcon,
    UserGroupIcon,
    CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";

// ── Avatar initials ─────────────────────────────────────────────────────────
const COLORS = [
    "bg-blue-100 text-brand-primary",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-emerald-100 text-brand-success",
    "bg-rose-100 text-brand-danger",
];
function Avatar({ name }) {
    const initials = name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
    const color = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${color}`}>
            {initials}
        </div>
    );
}

// ── Summary Card ────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, accent }) {
    const accents = {
        blue: { bar: "bg-brand-primary", bg: "bg-blue-50", icon: "text-brand-primary" },
        green: { bar: "bg-brand-success", bg: "bg-green-50", icon: "text-brand-success" },
        amber: { bar: "bg-brand-warning", bg: "bg-amber-50", icon: "text-amber-600" },
        violet: { bar: "bg-violet-500", bg: "bg-violet-50", icon: "text-violet-600" },
    };
    const c = accents[accent] || accents.blue;
    return (
        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow" noPadding>
            <div className={`absolute left-0 top-0 h-full w-1.5 ${c.bar}`} />
            <div className="px-5 py-4 flex items-center gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl border border-white/50 shadow-sm shrink-0 transition-transform group-hover:scale-105 ${c.bg}`}>
                    <Icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                <div>
                    <p className="text-2xl font-black tracking-tight text-slate-800 leading-none">{value}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">{label}</p>
                </div>
            </div>
        </Card>
    );
}

// ── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b border-brand-border">
            <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-40" /></td>
            <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
            <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-28" /></td>
        </tr>
    );
}

// ── Pagination ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
function Pagination({ page, total, onChange }) {
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) return null;
    return (
        <div className="flex items-center justify-between px-5 py-3 border-t border-brand-border bg-brand-bg">
            <p className="text-xs font-semibold text-slate-400">
                Showing <span className="font-bold text-slate-600">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</span> of{" "}
                <span className="font-bold text-slate-600">{total}</span>
            </p>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => onChange(page - 1)} disabled={page === 1} className="!px-2">
                    <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
                </Button>
                {[...Array(pages)].map((_, i) => (
                    <button key={i} onClick={() => onChange(i + 1)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20" : "hover:bg-slate-200 text-slate-600"}`}>
                        {i + 1}
                    </button>
                ))}
                <Button variant="ghost" size="sm" onClick={() => onChange(page + 1)} disabled={page === pages} className="!px-2">
                    <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                </Button>
            </div>
        </div>
    );
}

// ── Breakdown Row ─────────────────────────────────────────────────────────────
function BreakdownRow({ label, value, highlight }) {
    return (
        <div className={`flex justify-between items-center py-3 border-b border-brand-border last:border-0 ${highlight ? "text-brand-primary font-black" : ""}`}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            <span className={`text-sm font-black ${highlight ? "text-brand-primary text-lg" : "text-slate-800"}`}>{value}</span>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function Salary() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useSelector((s) => s.auth);

    const [editingId, setEditingId] = useState(null);
    const [newSalary, setNewSalary] = useState("");
    const [savingId, setSavingId] = useState(null);

    const [openCalendar, setOpenCalendar] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calculatedSalary, setCalculatedSalary] = useState(0);
    const [breakdown, setBreakdown] = useState({ baseSalary: 0, daysInMonth: 30, weekends: 0, presentDays: 0, paidDays: 0, finalSalary: 0 });

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const fetchEmployees = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/users/employee`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmployees(data);
        } catch {
            toast.error("Failed to fetch employees");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, [token]);

    const handleEditClick = (emp) => { setEditingId(emp._id); setNewSalary(emp.salary || 0); };

    const handleSaveSalary = async (id, salaryToSave = newSalary) => {
        setSavingId(id);
        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/admin/user/${id}`, { salary: Number(salaryToSave) }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Salary updated successfully");
            setEditingId(null);
            setOpenCalendar(false);
            fetchEmployees();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update salary");
            if (err.response?.status === 404) fetchEmployees();
        } finally {
            setSavingId(null);
        }
    };

    const fetchMonthlyAttendance = async (empId, month, year, baseSalary) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/attendance/${empId}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { month, year },
            });
            setAttendanceData(data);
            const date = new Date(year, month);
            const daysInMonth = getDaysInMonth(date);
            const allDays = eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
            let presentCount = 0, weekendCount = 0, paidCount = 0;
            allDays.forEach((day) => {
                const isPresent = data.find((att) => isSameDay(new Date(att.date), day));
                const isWknd = isWeekend(day);
                if (isPresent) { presentCount++; paidCount++; }
                else if (isWknd) { weekendCount++; paidCount++; }
            });
            const base = Number(baseSalary || selectedEmp?.salary || 0);
            const final = daysInMonth > 0 ? (base / daysInMonth) * paidCount : 0;
            // setPresentDays && setPresentDays(presentCount);
            setCalculatedSalary(final.toFixed(2));
            setBreakdown({ baseSalary: base, daysInMonth, weekends: weekendCount, presentDays: presentCount, paidDays: paidCount, finalSalary: final.toFixed(2) });
        } catch {
            toast.error("Failed to fetch attendance data.");
        }
    };

    const handleViewAttendance = async (emp) => {
        setSelectedEmp(emp);
        setOpenCalendar(true);
        const now = new Date();
        setCurrentMonth(now);
        await fetchMonthlyAttendance(emp._id, now.getMonth(), now.getFullYear(), emp.salary);
    };

    const onActiveStartDateChange = ({ activeStartDate }) => {
        setCurrentMonth(activeStartDate);
        if (selectedEmp) {
            fetchMonthlyAttendance(selectedEmp._id, activeStartDate.getMonth(), activeStartDate.getFullYear(), selectedEmp.salary);
        }
    };

    const tileClassName = ({ date, view }) => {
        if (view === "month") {
            const isPresent = attendanceData.find((att) => isSameDay(new Date(att.date), date));
            if (isPresent) return "bg-green-100 text-brand-success font-black border border-green-200 rounded-lg shadow-sm";
        }
        return null;
    };

    // Filtering
    const filtered = useMemo(() =>
        employees.filter((e) => {
            const q = search.toLowerCase();
            return !search || e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q);
        }), [employees, search]);

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Summary stats
    const totalPayroll = employees.reduce((s, e) => s + (Number(e.salary) || 0), 0);
    const paidCount = employees.filter((e) => (e.salary || 0) > 0).length;
    const avgSalary = paidCount ? Math.round(totalPayroll / paidCount) : 0;
    const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

    return (
        <div className="mt-8 mb-24 flex flex-col gap-6 max-w-[1200px] mx-auto pb-10">

            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <PageHeader
                title="Employee Salary Setup"
                subtitle="Manage base salaries and view monthly attendance-based payouts"
            />

            {/* ── Summary Cards ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard icon={CurrencyRupeeIcon} label="Total Payroll" value={fmt(totalPayroll)} accent="blue" />
                <SummaryCard icon={UserGroupIcon} label="Employees" value={employees.length} accent="violet" />
                <SummaryCard icon={BanknotesIcon} label="Salaries Set" value={paidCount} accent="green" />
                <SummaryCard icon={CurrencyRupeeIcon} label="Average Salary" value={fmt(avgSalary)} accent="amber" />
            </div>

            {/* ── Table Card ───────────────────────────────────────────────────── */}
            <Card noPadding>
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-brand-border bg-white">
                    <div className="w-full md:max-w-md">
                        <FormInput
                            placeholder="Search employee..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            icon={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                        {filtered.length} employee{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] table-auto">
                        <thead>
                            <tr className="border-b border-brand-border bg-brand-bg text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                {["Employee", "Base Salary", "Actions"].map((col) => (
                                    <th key={col} className="px-6 py-4 text-left">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/60">
                            {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                                                <BanknotesIcon className="w-7 h-7 text-slate-400" />
                                            </div>
                                            <p className="text-base font-bold text-slate-600">No employees found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && paginated.map((emp) => {
                                const { _id, name, email, salary } = emp;
                                const isEditing = editingId === _id;
                                return (
                                    <tr key={_id} className="bg-white hover:bg-slate-50 transition-colors group">
                                        {/* Employee */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar name={name} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-800 truncate max-w-[200px]">{name}</p>
                                                    <p className="text-xs font-semibold text-slate-400 truncate max-w-[200px]">{email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Salary */}
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <div className="w-40">
                                                    <FormInput
                                                        type="number"
                                                        value={newSalary}
                                                        onChange={(e) => setNewSalary(e.target.value)}
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <span className={`text-base font-black tracking-tight ${salary > 0 ? "text-slate-800" : "text-slate-400"}`}>
                                                    {salary > 0 ? fmt(salary) : "Not set"}
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 lg:gap-3">
                                                {isEditing ? (
                                                    <>
                                                        <Button onClick={() => handleSaveSalary(_id)} disabled={savingId === _id} variant="primary" icon={<CheckIcon />} size="sm">
                                                            {savingId === _id ? "Saving…" : "Save"}
                                                        </Button>
                                                        <Button onClick={() => setEditingId(null)} variant="secondary" icon={<XMarkIcon />} size="sm">
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button onClick={() => handleEditClick(emp)} variant="secondary" icon={<PencilSquareIcon />} size="sm">
                                                            Edit
                                                        </Button>
                                                        <Button onClick={() => handleViewAttendance(emp)} variant="outline" className="text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-300" icon={<CalendarDaysIcon />} size="sm">
                                                            Attendance
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} total={filtered.length} onChange={setPage} />
            </Card>

            {/* ── Attendance Modal ─────────────────────────────────────────────── */}
            {openCalendar && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpenCalendar(false)} />
                    <div className="relative z-10 w-full max-w-lg shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto bg-brand-bg rounded-2xl animate-fade-in-up">
                        <div className="h-1.5 w-full bg-brand-primary" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border bg-white sticky top-0 z-20">
                            <div>
                                <p className="text-lg font-black tracking-tight text-slate-800">Attendance & Salary</p>
                                <p className="text-xs font-bold text-slate-400 mt-0.5">{selectedEmp?.name} · {format(currentMonth, "MMMM yyyy")}</p>
                            </div>
                            <button onClick={() => setOpenCalendar(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                <XMarkIcon className="w-6 h-6 font-bold" />
                            </button>
                        </div>

                        {/* Calendar */}
                        <div className="px-6 pt-6 pb-2 bg-white">
                            <style>{`
                                .react-calendar { width: 100%; border: none; font-family: inherit; }
                                .react-calendar__navigation button { font-weight: 700; border-radius: 8px; }
                                .react-calendar__navigation button:hover { background-color: #f1f5f9; }
                                .react-calendar__month-view__weekdays { font-weight: 700; font-size: 11px; text-transform: uppercase; color: #64748b; }
                                .react-calendar__tile { font-weight: 600; font-size: 14px; padding: 12px 6px; border-radius: 8px; }
                                .react-calendar__tile--now { background-color: #e0e7ff; color: #4338ca; }
                                .react-calendar__tile--active { background-color: #2563eb !important; color: white !important; }
                                .react-calendar__tile:hover { background-color: #f1f5f9; }
                            `}</style>
                            <Calendar
                                onChange={setCurrentMonth}
                                value={currentMonth}
                                onActiveStartDateChange={onActiveStartDateChange}
                                tileClassName={tileClassName}
                            />
                        </div>

                        {/* Breakdown */}
                        <div className="px-6 py-6">
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Salary Breakdown</p>
                            <div className="rounded-xl border border-brand-border bg-white px-5 shadow-sm">
                                <BreakdownRow label="Base Salary" value={fmt(breakdown.baseSalary)} />
                                <BreakdownRow label="Days in Month" value={breakdown.daysInMonth} />
                                <BreakdownRow label="Present Days" value={breakdown.presentDays} />
                                <BreakdownRow label="Weekends (paid)" value={breakdown.weekends} />
                                <BreakdownRow label="Total Paid Days" value={`${breakdown.paidDays} / ${breakdown.daysInMonth}`} />
                            </div>

                            <Card className="mt-5 border border-brand-primary bg-indigo-50/50" noPadding>
                                <div className="px-5 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Calculated Payout</p>
                                        <p className="text-xs font-bold text-slate-500 mt-1">Based on attendance</p>
                                    </div>
                                    <p className="text-3xl font-black text-brand-primary tracking-tight">{fmt(breakdown.finalSalary)}</p>
                                </div>
                            </Card>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-brand-border bg-white sticky bottom-0 z-20">
                            <Button variant="ghost" onClick={() => setOpenCalendar(false)}>
                                Close
                            </Button>
                            <Button onClick={() => handleSaveSalary(selectedEmp._id, calculatedSalary)} disabled={savingId === selectedEmp?._id} variant="primary">
                                {savingId === selectedEmp?._id ? "Saving…" : "Apply Payout"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Salary;

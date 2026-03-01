import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import {
    CurrencyRupeeIcon,
    ClockIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    UserIcon,
    LockClosedIcon,
} from "@heroicons/react/24/outline";

// Reusable Components
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormInput, FormSelect } from "@/components/ui/FormInput";
import { SummaryCard } from "@/components/ui/SummaryCard";

// ── Constants ────────────────────────────────────────────────
const WORKING_DAYS_MONTH = 26;
const WORKING_HOURS_DAY = 12;
const MONTHS = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
];

const API = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

// ── Helpers ──────────────────────────────────────────────────
const calcWorkingHours = (inTime, outTime) => {
    if (!inTime || !outTime) return 0;
    const [inH, inM] = inTime.split(":").map(Number);
    const [outH, outM] = outTime.split(":").map(Number);
    const mins = (outH * 60 + outM) - (inH * 60 + inM);
    return mins > 0 ? parseFloat((mins / 60).toFixed(2)) : 0;
};

const calcStatus = (hours) => {
    if (hours === 0) return "Absent";
    if (hours >= WORKING_HOURS_DAY) return "Present";
    if (hours >= WORKING_HOURS_DAY / 2) return "Half Day";
    return "Partial";
};

const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

const buildDays = (month, year) => {
    const count = daysInMonth(month, year);
    return Array.from({ length: count }, (_, i) => {
        const d = i + 1;
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        return { date: dateStr, inTime: "", outTime: "", isHoliday: false };
    });
};

const formatDisplayDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", weekday: "short" });
};

const fmtCurr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

// ── Main Component ───────────────────────────────────────────
export function AttendanceSalary() {
    const { token } = useSelector((s) => s.auth);
    const now = new Date();

    // Data State
    const [employees, setEmployees] = useState([]);
    const [apiError, setApiError] = useState(false);

    // Filter State
    const [selectedEmpId, setSelectedEmpId] = useState("");
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    // Loaded Salary Info
    const [monthlySalary, setMonthlySalary] = useState("");
    const [advanceSalary, setAdvanceSalary] = useState("0");
    const [days, setDays] = useState([]);

    // UI State
    const [saving, setSaving] = useState(false);
    const [fetchingRecord, setFetchingRecord] = useState(false);
    const [fetchingEmps, setFetchingEmps] = useState(true);
    const [lockingMonth, setLockingMonth] = useState(false);

    const authConfig = useMemo(
        () => ({ headers: { Authorization: `Bearer ${token}` } }),
        [token]
    );

    // ── Salary maths ──────────────────────────────────────────
    const safeMonthly = parseFloat(monthlySalary) || 0;
    const safeAdvance = parseFloat(advanceSalary) || 0;

    const perDaySalary = safeMonthly / WORKING_DAYS_MONTH;
    const perHourSalary = perDaySalary / WORKING_HOURS_DAY;

    const enrichedDays = useMemo(() =>
        days.map((day) => {
            if (day.isHoliday) return { ...day, hours: 0, status: "Holiday", daySalary: perDaySalary };

            const hours = calcWorkingHours(day.inTime, day.outTime);
            const status = calcStatus(hours);

            let daySalary = 0;
            if (status === "Present") {
                const overtime = Math.max(0, hours - WORKING_HOURS_DAY);
                daySalary = perDaySalary + (overtime * perHourSalary);
            } else if (status === "Half Day") {
                daySalary = perDaySalary * 0.5;
            } else if (status === "Partial") {
                daySalary = hours * perHourSalary; // graceful fallback
            }

            return { ...day, hours, status, daySalary: parseFloat(daySalary.toFixed(2)) };
        }),
        [days, perDaySalary, perHourSalary]
    );

    const totalHours = useMemo(() => enrichedDays.reduce((s, d) => s + d.hours, 0).toFixed(2), [enrichedDays]);
    const grossSalary = useMemo(() => enrichedDays.reduce((s, d) => s + d.daySalary, 0).toFixed(2), [enrichedDays]);
    const netPayable = useMemo(() => Math.max(0, parseFloat(grossSalary) - safeAdvance).toFixed(2), [grossSalary, safeAdvance]);

    // Monthly Totals
    const presentCount = enrichedDays.filter((d) => d.status === "Present" || d.status === "Partial").length;
    const absentCount = enrichedDays.filter((d) => d.status === "Absent").length;
    const halfDayCount = enrichedDays.filter((d) => d.status === "Half Day").length;

    // ── Fetch employees ───────────────────────────────────────
    const fetchEmployees = useCallback(async () => {
        setFetchingEmps(true);
        setApiError(false);
        try {
            const { data } = await axios.get(`${API}/api/salary/employees`, authConfig);
            setEmployees(data || []);
        } catch (e) {
            setApiError(true);
            toast.error("Unable to load employees. Please try again.");
        } finally {
            setFetchingEmps(false);
        }
    }, [authConfig]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // ── Handle Employee Selection ─────────────────────────────
    const handleEmployeeSelect = (empId) => {
        setSelectedEmpId(empId);
        if (!empId) return;

        // Auto-fill salary from API if available
        const emp = employees.find(e => e._id === empId);
        if (emp && emp.monthly_salary) setMonthlySalary(emp.monthly_salary);
    };

    // ── Fetch record when emp/month/year changes ──────────────
    useEffect(() => {
        if (!selectedEmpId) {
            setDays(buildDays(month, year));
            return;
        }
        setFetchingRecord(true);
        axios
            .get(`${API}/api/salary/${selectedEmpId}`, {
                ...authConfig,
                params: { month, year },
            })
            .then(({ data }) => {
                if (data.monthlySalary) setMonthlySalary(data.monthlySalary);
                setAdvanceSalary(data.advanceSalary || 0);

                if (data.days && data.days.length > 0) {
                    setDays(data.days.map((d) => ({ ...d })));
                } else {
                    setDays(buildDays(month, year));
                }
            })
            .catch(() => {
                // Ignore 404s
                setDays(buildDays(month, year));
            })
            .finally(() => setFetchingRecord(false));
    }, [selectedEmpId, month, year, authConfig]);

    // ── Row update helpers ────────────────────────────────────
    const updateDay = useCallback((index, field, value) => {
        setDays((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            if (field === "isHoliday" && value === true) {
                next[index].inTime = "";
                next[index].outTime = "";
            }
            return next;
        });
    }, []);

    // ── Save ──────────────────────────────────────────────────
    const handleSave = async () => {
        if (!selectedEmpId) return toast.warning("Please select an employee first");
        if (!monthlySalary) return toast.warning("Please enter a monthly salary");

        setSaving(true);
        try {
            await axios.post(
                `${API}/api/salary/save/${selectedEmpId}?month=${month}&year=${year}`,
                {
                    advanceDeduction: Number(advanceSalary),
                },
                authConfig
            );
            toast.success("Salary record saved successfully!");
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to save record");
        } finally {
            setSaving(false);
        }
    };

    const handleLockPayroll = async () => {
        if (!selectedEmpId) return toast.warning("Please select an employee first");
        if (!window.confirm("Are you sure you want to finalize payroll for this month? Attendance and salaries will be permanently locked.")) return;
        setLockingMonth(true);
        try {
            await axios.post(`${API}/api/salary/lock`, { month, year, remark: "Finalized from Calculation Screen" }, authConfig);
            toast.success("Payroll Finalized and Locked!");
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to lock payroll");
        } finally {
            setLockingMonth(false);
        }
    };

    const startYear = 2025;
    const endYear = Math.max(now.getFullYear() + 1, 2026);
    const yearOptions = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    if (apiError) {
        return (
            <Card className="mt-10 max-w-5xl mx-auto text-center py-10">
                <CardBody className="items-center">
                    <ExclamationCircleIcon className="w-16 h-16 text-brand-danger mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h3>
                    <p className="text-slate-500 mb-6">Unable to load employees. Check if the server is running.</p>
                    <Button onClick={fetchEmployees} variant="primary">Retry Connection</Button>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="mt-8 mb-24 flex flex-col gap-6 max-w-[1200px] mx-auto pb-10">

            {/* ── Page Header ───────────────────────────────────── */}
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <CurrencyRupeeIcon className="w-7 h-7 text-brand-primary" />
                        Salary Calculation
                    </span>
                }
                subtitle={<span className="flex items-center gap-2"><ClockIcon className="w-4 h-4" /> 26 Working Days / Month • 12 Hours / Day</span>}
                actionNode={
                    <Button
                        onClick={handleSave}
                        disabled={saving || !selectedEmpId}
                        icon={saving ? <ArrowPathIcon className="animate-spin relative top-[2px]" /> : <CheckCircleIcon className="relative top-[2px]" />}
                        variant="primary"
                    >
                        {saving ? "Saving..." : "Save Payroll"}
                    </Button>
                }
            />

            {/* ── Filters & employee grid ──────────────────────────────── */}
            <Card>
                <CardBody>
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <FormSelect
                            label="Employee"
                            value={selectedEmpId}
                            onChange={(e) => handleEmployeeSelect(e.target.value)}
                            options={employees.map(emp => ({ value: emp._id, label: emp.name }))}
                            placeholder="— Select Employee —"
                        />
                        <FormSelect
                            label="Month"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            options={MONTHS.map(m => ({ value: m.value, label: m.label }))}
                            placeholder={false}
                        />
                        <FormSelect
                            label="Year"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            options={yearOptions.map(y => ({ value: y, label: String(y) }))}
                            placeholder={false}
                        />
                        <FormInput
                            label="Monthly Base Salary"
                            type="number"
                            min={0}
                            value={monthlySalary}
                            onChange={(e) => setMonthlySalary(e.target.value)}
                            placeholder="Enter salary"
                            prefix="₹"
                        />
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t border-brand-border pt-5 mt-1">
                        <FormInput
                            label="Advance Salary / Deduction"
                            type="number"
                            min={0}
                            value={advanceSalary}
                            onChange={(e) => setAdvanceSalary(e.target.value)}
                            placeholder="0"
                            prefix="₹"
                        />
                        <div className="flex flex-col justify-end">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Per Day Rate (Auto)</label>
                            <div className="h-11 px-4 rounded-xl bg-slate-50 border border-transparent flex items-center text-sm font-bold text-slate-500">
                                {fmtCurr(perDaySalary)} <span className="text-xs font-medium ml-1">/ day</span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-end">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Per Hour Rate (Auto)</label>
                            <div className="h-11 px-4 rounded-xl bg-slate-50 border border-transparent flex items-center text-sm font-bold text-slate-500">
                                {fmtCurr(perHourSalary)} <span className="text-xs font-medium ml-1">/ hr</span>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* ── KPI Cards ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard icon={ClockIcon} label="Total Working Hours" value={`${totalHours} hrs`} accent="blue" />
                <SummaryCard icon={CurrencyRupeeIcon} label="Gross Salary" value={fmtCurr(grossSalary)} accent="green" />
                <SummaryCard icon={CheckCircleIcon} label={`Net Payable (Advance ${fmtCurr(safeAdvance)})`} value={fmtCurr(netPayable)} accent="violet" />
            </div>

            {/* ── Attendance Table ───────────────────────────────── */}
            <Card noPadding>
                <CardHeader
                    title="Daily Attendance Breakdown"
                    className="px-6 py-5 border-b border-brand-border bg-brand-bg m-0"
                    action={selectedEmpId && <Badge variant="neutral">{MONTHS.find(m => m.value === month)?.label} {year}</Badge>}
                />

                {!selectedEmpId ? (
                    <div className="py-20 flex flex-col justify-center items-center">
                        <UserIcon className="w-16 h-16 text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium">Select an employee to view or edit attendance records.</p>
                    </div>
                ) : fetchingRecord ? (
                    <div className="py-20 flex flex-col justify-center items-center">
                        <ArrowPathIcon className="w-10 h-10 text-brand-primary animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Loading payroll records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-brand-border bg-brand-bg text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                    <th className="py-4 px-5">Date</th>
                                    <th className="py-4 px-5">Day Type</th>
                                    <th className="py-4 px-5">In Time</th>
                                    <th className="py-4 px-5">Out Time</th>
                                    <th className="py-4 px-5">Hours</th>
                                    <th className="py-4 px-5">Status</th>
                                    <th className="py-4 px-5 text-right w-40">Earned</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                                {enrichedDays.map((day, idx) => {
                                    const isWeekend = new Date(day.date).getDay() === 0;
                                    const rowClass = day.isHoliday || isWeekend ? "bg-slate-50/70 opacity-90" : "bg-white hover:bg-slate-50 transition-colors group";

                                    return (
                                        <tr key={day.date} className={rowClass}>
                                            <td className="py-3 px-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 text-xs text-slate-400 text-right">{idx + 1}.</span>
                                                    <span className="text-sm font-bold text-slate-700">{formatDisplayDate(day.date)}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5">
                                                <select
                                                    className={`h-9 px-3 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors ${day.isHoliday ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                                        }`}
                                                    value={day.isHoliday ? "holiday" : "working"}
                                                    onChange={(e) => updateDay(idx, "isHoliday", e.target.value === "holiday")}
                                                >
                                                    <option value="working">Work Day</option>
                                                    <option value="holiday">Holiday/Off</option>
                                                </select>
                                            </td>
                                            <td className="py-3 px-5">
                                                <input
                                                    type="time"
                                                    disabled={day.isHoliday}
                                                    value={day.inTime}
                                                    onChange={(e) => updateDay(idx, "inTime", e.target.value)}
                                                    className="w-28 h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed transition"
                                                />
                                            </td>
                                            <td className="py-3 px-5">
                                                <input
                                                    type="time"
                                                    disabled={day.isHoliday}
                                                    value={day.outTime}
                                                    onChange={(e) => updateDay(idx, "outTime", e.target.value)}
                                                    className="w-28 h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed transition"
                                                />
                                            </td>
                                            <td className="py-3 px-5">
                                                <span className={`text-sm font-bold ${day.hours >= WORKING_HOURS_DAY ? "text-brand-success" : day.hours > 0 ? "text-brand-warning" : "text-slate-300"}`}>
                                                    {day.hours > 0 ? `${day.hours}h` : "—"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5">
                                                <StatusBadge status={day.status} />
                                            </td>
                                            <td className="py-3 px-5 text-right font-black text-slate-800 text-sm">
                                                {day.daySalary > 0 ? fmtCurr(day.daySalary) : <span className="text-slate-300">₹0</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-brand-bg border-t-2 border-brand-border">
                                <tr>
                                    <td colSpan={4} className="py-5 px-6">
                                        <div className="flex items-center gap-6">
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Summary</span>
                                            <div className="flex gap-4">
                                                <Badge variant="success">{presentCount} Present</Badge>
                                                <Badge variant="warning">{halfDayCount} Half</Badge>
                                                <Badge variant="danger">{absentCount} Absent</Badge>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-5">
                                        <span className="text-lg font-black text-brand-primary">{totalHours}h</span>
                                    </td>
                                    <td></td>
                                    <td className="py-5 px-5 text-right text-lg font-black text-slate-900 border-l border-brand-border">
                                        {fmtCurr(grossSalary)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </Card>

            {selectedEmpId && (
                <div className="mt-6 flex justify-end sticky bottom-6 z-10 w-full animate-fade-in-up">
                    <div className="bg-white/80 backdrop-blur shadow-soft border border-brand-border rounded-2xl p-2 flex px-4 items-center gap-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Total Net Payable • <span className="text-slate-900 text-lg font-black">{fmtCurr(netPayable)}</span></span>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            variant="primary"
                            icon={saving ? <ArrowPathIcon className="animate-spin" /> : null}
                        >
                            {saving ? "Saving..." : "Save Record"}
                        </Button>
                        <Button
                            onClick={handleLockPayroll}
                            disabled={lockingMonth}
                            variant="danger"
                            icon={<LockClosedIcon />}
                        >
                            {lockingMonth ? "Locking..." : "Finalize Payroll"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }) {
    let variant = "neutral";
    if (status === "Present") variant = "success";
    if (status === "Half Day") variant = "warning";
    if (status === "Absent") variant = "danger";
    if (status === "Holiday") variant = "primary";

    return <Badge variant={variant}>{status}</Badge>;
}

export default AttendanceSalary;

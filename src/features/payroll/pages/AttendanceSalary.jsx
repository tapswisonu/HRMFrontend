import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../../app/api";
import { toast } from "react-toastify";
import {
    CurrencyRupeeIcon,
    ClockIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    UserIcon,
    LockClosedIcon,
    BoltIcon,
    CalendarDaysIcon,
} from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormSelect } from "@/components/ui/FormInput";
import { SummaryCard } from "@/components/ui/SummaryCard";

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTHS = [
    { label: "January", value: 1 }, { label: "February", value: 2 },
    { label: "March", value: 3 }, { label: "April", value: 4 },
    { label: "May", value: 5 }, { label: "June", value: 6 },
    { label: "July", value: 7 }, { label: "August", value: 8 },
    { label: "September", value: 9 }, { label: "October", value: 10 },
    { label: "November", value: 11 }, { label: "December", value: 12 },
];

const fmtCurr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const formatDisplayDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", weekday: "short" });
};

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const variantMap = {
        Present: "success",
        "Half Day": "warning",
        Absent: "danger",
        Holiday: "primary",
        Leave: "neutral",
        Partial: "warning",
    };
    return <Badge variant={variantMap[status] || "neutral"}>{status}</Badge>;
}

// ── Locked Banner ─────────────────────────────────────────────────────────────
function LockedBanner({ lockInfo }) {
    const lockedAt = lockInfo?.lock?.createdAt
        ? new Date(lockInfo.lock.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "";
    const lockedBy = lockInfo?.lock?.lockedBy?.name || "Admin";
    return (
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-5 py-3.5 text-amber-800">
            <LockClosedIcon className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
                <p className="text-sm font-bold">Payroll Locked</p>
                <p className="text-xs font-medium text-amber-700">
                    This month's payroll was finalized by {lockedBy}{lockedAt ? ` on ${lockedAt}` : ""}. No further edits are allowed.
                </p>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function AttendanceSalary() {
    const now = new Date();

    // Filter state
    const [employees, setEmployees] = useState([]);
    const [selectedEmpId, setSelectedEmpId] = useState("");
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    // Backend-computed salary data
    const [salaryData, setSalaryData] = useState(null);
    const [advanceDeduction, setAdvanceDeduction] = useState(0);

    // Lock status
    const [lockInfo, setLockInfo] = useState(null);

    // UI state
    const [fetchingEmps, setFetchingEmps] = useState(true);
    const [fetchingRecord, setFetchingRecord] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [lockingMonth, setLockingMonth] = useState(false);
    const [apiError, setApiError] = useState(false);

    // ── Fetch employees ──────────────────────────────────────────────────────
    const fetchEmployees = useCallback(async () => {
        setFetchingEmps(true);
        setApiError(false);
        try {
            const { data } = await api.get("/employee/employees");
            const list = data.data ?? data;
            setEmployees(Array.isArray(list) ? list : []);
        } catch {
            setApiError(true);
            toast.error("Unable to load employees. Please check if the server is running.");
        } finally {
            setFetchingEmps(false);
        }
    }, []);

    useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

    // ── Fetch lock status whenever month/year changes ────────────────────────
    const fetchLockStatus = useCallback(async () => {
        try {
            const { data } = await api.get("/salary/lock-status", { params: { month, year } });
            setLockInfo(data.data ?? data);
        } catch {
            setLockInfo(null);
        }
    }, [month, year]);

    useEffect(() => { fetchLockStatus(); }, [fetchLockStatus]);

    // ── Fetch salary preview when employee/month/year changes ───────────────
    const fetchSalaryPreview = useCallback(async () => {
        if (!selectedEmpId) {
            setSalaryData(null);
            return;
        }
        setFetchingRecord(true);
        try {
            const { data } = await api.get(`/salary/fetch/${selectedEmpId}`, {
                params: { month, year },
            });
            const record = data.data ?? data;
            setSalaryData(record);
            setAdvanceDeduction(record.advanceDeduction || record.advanceSalary || 0);
        } catch {
            setSalaryData(null);
        } finally {
            setFetchingRecord(false);
        }
    }, [selectedEmpId, month, year]);

    useEffect(() => { fetchSalaryPreview(); }, [fetchSalaryPreview]);

    const isLocked = lockInfo?.isLocked === true;

    // ── Derived display values (all from backend data) ───────────────────────
    const days = salaryData?.days || [];
    const grossSalary = salaryData?.grossSalary || 0;
    const netSalary = Math.max(0, grossSalary - advanceDeduction);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!selectedEmpId) return toast.warning("Please select an employee first");
        if (isLocked) return toast.error("Payroll for this month is locked. No changes allowed.");

        setSaving(true);
        try {
            const { data } = await api.post(
                `/salary/save/${selectedEmpId}`,
                { advanceDeduction: Number(advanceDeduction) },
                { params: { month, year } }
            );
            const record = data.data ?? data;
            setSalaryData(record);
            setAdvanceDeduction(record.advanceDeduction || 0);
            toast.success("Salary record saved successfully!");
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to save record");
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateAll = async () => {
        if (!window.confirm(`Generate payroll records for ALL employees for ${MONTHS.find(m => m.value === month)?.label} ${year}?`)) return;
        setGenerating(true);
        try {
            const { data } = await api.post("/salary/generate-all", { month, year });
            const result = data.data ?? data;
            toast.success(`Payroll generated: ${result.success?.length || 0} succeeded, ${result.failed?.length || 0} failed`);
            await fetchSalaryPreview();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to generate payroll");
        } finally {
            setGenerating(false);
        }
    };

    const handleLockPayroll = async () => {
        if (!window.confirm("Are you sure you want to FINALIZE payroll for this month? All salary records will be permanently locked.")) return;
        setLockingMonth(true);
        try {
            await api.post("/salary/lock", { month, year, remark: "Finalized from Salary Calculation screen" });
            toast.success("Payroll finalized and locked!");
            await fetchLockStatus();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to lock payroll");
        } finally {
            setLockingMonth(false);
        }
    };

    const now2 = new Date();
    const startYear = 2025;
    const endYear = Math.max(now2.getFullYear() + 1, 2026);
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

            {/* Page Header */}
            <PageHeader
                title={<span className="flex items-center gap-2"><CurrencyRupeeIcon className="w-7 h-7 text-brand-primary" />Salary Calculation</span>}
                subtitle={<span className="flex items-center gap-2"><ClockIcon className="w-4 h-4" /> Backend-automated · 26 Working Days / Month</span>}
                actionNode={
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleGenerateAll}
                            disabled={generating || isLocked}
                            variant="secondary"
                            icon={generating ? <ArrowPathIcon className="animate-spin" /> : <BoltIcon />}
                        >
                            {generating ? "Generating..." : "Generate All"}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !selectedEmpId || isLocked}
                            icon={saving ? <ArrowPathIcon className="animate-spin relative top-[2px]" /> : <CheckCircleIcon className="relative top-[2px]" />}
                            variant="primary"
                        >
                            {saving ? "Saving..." : "Save Payroll"}
                        </Button>
                    </div>
                }
            />

            {/* Lock Banner */}
            {isLocked && <LockedBanner lockInfo={lockInfo} />}

            {/* Filters */}
            <Card>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormSelect
                            label="Employee"
                            value={selectedEmpId}
                            onChange={(e) => setSelectedEmpId(e.target.value)}
                            options={employees.map(emp => ({ value: emp._id, label: emp.name }))}
                            placeholder="— Select Employee —"
                        />
                        <FormSelect
                            label="Month"
                            value={month}
                            onChange={(e) => { setMonth(Number(e.target.value)); setSalaryData(null); }}
                            options={MONTHS.map(m => ({ value: m.value, label: m.label }))}
                            placeholder={false}
                        />
                        <FormSelect
                            label="Year"
                            value={year}
                            onChange={(e) => { setYear(Number(e.target.value)); setSalaryData(null); }}
                            options={yearOptions.map(y => ({ value: y, label: String(y) }))}
                            placeholder={false}
                        />
                    </div>

                    {/* Auto-computed rates and advance  */}
                    {salaryData && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-brand-border pt-5 mt-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Base Salary</label>
                                <div className="h-11 px-4 rounded-xl bg-slate-50 border border-transparent flex items-center text-sm font-bold text-slate-700">
                                    {fmtCurr(salaryData.monthlySalary)}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Per Day Rate</label>
                                <div className="h-11 px-4 rounded-xl bg-slate-50 border border-transparent flex items-center text-sm font-bold text-slate-500">
                                    {fmtCurr(salaryData.perDayRate)} <span className="text-xs font-medium ml-1">/ day</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Per Hour Rate</label>
                                <div className="h-11 px-4 rounded-xl bg-slate-50 border border-transparent flex items-center text-sm font-bold text-slate-500">
                                    {fmtCurr(salaryData.perHourRate)} <span className="text-xs font-medium ml-1">/ hr</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Advance Deduction</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={advanceDeduction}
                                    disabled={isLocked}
                                    onChange={(e) => setAdvanceDeduction(Math.max(0, Number(e.target.value)))}
                                    className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-60 disabled:bg-slate-50"
                                    placeholder="₹ 0"
                                />
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* KPI Summary Cards */}
            {salaryData && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <SummaryCard icon={ClockIcon} label="Total Hours Worked" value={`${salaryData.totalHoursWorked || 0} hrs`} accent="blue" />
                    <SummaryCard icon={CurrencyRupeeIcon} label="Gross Salary" value={fmtCurr(grossSalary)} accent="green" />
                    <SummaryCard icon={CheckCircleIcon} label={`Net Payable (Adv ${fmtCurr(advanceDeduction)})`} value={fmtCurr(netSalary)} accent="violet" />
                    <SummaryCard icon={CalendarDaysIcon} label="Payable Days" value={`${salaryData.payableDays || 0} days`} accent="amber" />
                </div>
            )}

            {/* Attendance Table — Read Only, all data from backend */}
            <Card noPadding>
                <CardHeader
                    title="Daily Attendance Breakdown"
                    className="px-6 py-5 border-b border-brand-border bg-brand-bg m-0"
                    action={
                        salaryData && (
                            <div className="flex items-center gap-2">
                                <Badge variant="neutral">{MONTHS.find(m => m.value === month)?.label} {year}</Badge>
                                {salaryData.attendanceSource && (
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${salaryData.attendanceSource === "admin" ? "bg-blue-100 text-blue-700" : salaryData.attendanceSource === "mixed" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                                        {salaryData.attendanceSource} records
                                    </span>
                                )}
                            </div>
                        )
                    }
                />

                {!selectedEmpId ? (
                    <div className="py-20 flex flex-col justify-center items-center">
                        <UserIcon className="w-16 h-16 text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium">Select an employee to view their attendance and salary breakdown.</p>
                    </div>
                ) : fetchingRecord ? (
                    <div className="py-20 flex flex-col justify-center items-center">
                        <ArrowPathIcon className="w-10 h-10 text-brand-primary animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Computing salary from attendance records...</p>
                    </div>
                ) : days.length === 0 ? (
                    <div className="py-20 flex flex-col justify-center items-center gap-3">
                        <ExclamationCircleIcon className="w-12 h-12 text-slate-300" />
                        <p className="text-slate-500 font-medium">No salary data available.</p>
                        <p className="text-xs text-slate-400">Ensure this employee has a base salary configured and attendance records exist.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-brand-border bg-brand-bg text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                    <th className="py-4 px-5">Date</th>
                                    <th className="py-4 px-5">Check In</th>
                                    <th className="py-4 px-5">Check Out</th>
                                    <th className="py-4 px-5">Hours</th>
                                    <th className="py-4 px-5">Status</th>
                                    <th className="py-4 px-5 text-right">Earned</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                                {days.map((day, idx) => {
                                    const rowClass = day.isHoliday || day.status === "Holiday"
                                        ? "bg-slate-50/70 opacity-80"
                                        : day.status === "Absent"
                                            ? "bg-red-50/30"
                                            : "bg-white hover:bg-slate-50 transition-colors";

                                    return (
                                        <tr key={day.date || idx} className={rowClass}>
                                            <td className="py-3 px-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 text-xs text-slate-400 text-right shrink-0">{idx + 1}.</span>
                                                    <span className="text-sm font-bold text-slate-700">{formatDisplayDate(day.date)}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5">
                                                <span className="text-sm font-medium text-slate-600">{day.inTime || <span className="text-slate-300">—</span>}</span>
                                            </td>
                                            <td className="py-3 px-5">
                                                <span className="text-sm font-medium text-slate-600">{day.outTime || <span className="text-slate-300">—</span>}</span>
                                            </td>
                                            <td className="py-3 px-5">
                                                <span className={`text-sm font-bold ${day.hours >= 12 ? "text-brand-success" : day.hours > 0 ? "text-brand-warning" : "text-slate-300"}`}>
                                                    {day.hours > 0 ? `${day.hours}h` : "—"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5">
                                                <StatusBadge status={day.status} />
                                            </td>
                                            <td className="py-3 px-5 text-right font-black text-slate-800 text-sm">
                                                {day.daySalary > 0 ? fmtCurr(day.daySalary) : <span className="text-slate-300 font-normal">₹0</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-brand-bg border-t-2 border-brand-border">
                                <tr>
                                    <td colSpan={3} className="py-5 px-6">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Summary</span>
                                            <Badge variant="success">{salaryData.presentDays || 0} Present</Badge>
                                            <Badge variant="warning">{salaryData.halfDays || 0} Half Day</Badge>
                                            <Badge variant="danger">{salaryData.absentDays || 0} Absent</Badge>
                                            {(salaryData.leaveDays || 0) > 0 && <Badge variant="neutral">{salaryData.leaveDays} Leave</Badge>}
                                            {(salaryData.holidayDays || 0) > 0 && <Badge variant="primary">{salaryData.holidayDays} Holiday</Badge>}
                                        </div>
                                    </td>
                                    <td className="py-5 px-5">
                                        <span className="text-lg font-black text-brand-primary">{salaryData.totalHoursWorked || 0}h</span>
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

            {/* Sticky Bottom Action Bar */}
            {selectedEmpId && salaryData && (
                <div className="mt-4 flex justify-end sticky bottom-6 z-10 w-full animate-fade-in-up">
                    <div className="bg-white/80 backdrop-blur shadow-soft border border-brand-border rounded-2xl p-2 flex px-4 items-center gap-4">
                        <div className="px-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Gross</span>
                            <p className="text-base font-black text-slate-700">{fmtCurr(grossSalary)}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="px-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Net Payable</span>
                            <p className="text-lg font-black text-slate-900">{fmtCurr(netSalary)}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        {!isLocked ? (
                            <>
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
                            </>
                        ) : (
                            <span className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                                <LockClosedIcon className="w-4 h-4" /> Month Locked
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AttendanceSalary;

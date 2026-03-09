import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../../app/api";
import { toast } from "react-toastify";
import {
    ArrowPathIcon,
    CheckCircleIcon,
    DocumentArrowDownIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    UserIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    ExclamationCircleIcon,
    LockClosedIcon,
    BoltIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormInput, FormSelect } from "@/components/ui/FormInput";
import { SummaryCard } from "@/components/ui/SummaryCard";

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtNum = (n) => Number((n || 0).toFixed(1));

const PAGE_SIZE = 10;

// ── Avatar ────────────────────────────────────────────────────────────────────
const COLORS = [
    "bg-blue-100 text-brand-primary", "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700", "bg-emerald-100 text-brand-success",
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

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b border-brand-border">
            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-40" /></td>
            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-64" /></td>
            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-8" /></td>
        </tr>
    );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, total, onChange }) {
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) return null;
    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-brand-bg">
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

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, variant = "neutral" }) {
    if (!value && value !== 0) return null;
    return (
        <span className="flex flex-col items-center gap-0.5 min-w-[36px]">
            <Badge variant={variant}>{value}</Badge>
            <span className="text-[10px] font-semibold text-slate-500 tracking-tight">{label}</span>
        </span>
    );
}

// ── Breakdown Row ─────────────────────────────────────────────────────────────
function BreakdownRow({ label, value, bold }) {
    return (
        <div className={`flex items-center justify-between py-2 border-b border-brand-border/50 last:border-0 ${bold ? "font-bold text-slate-900 mt-2 text-base" : "text-slate-700"}`}>
            <span className="text-xs font-semibold text-slate-500">{label}</span>
            <span className="text-sm font-semibold">{value}</span>
        </div>
    );
}

// ── Employee Row ──────────────────────────────────────────────────────────────
function EmployeeTableRow({ report, onSave, onStatusChange, saving, isLocked }) {
    const [open, setOpen] = useState(false);
    const [advance, setAdvance] = useState(report.advanceDeduction || 0);

    const netAfterAdvance = Math.max(0, (report.grossSalary || 0) - advance);
    const statusLocked = isLocked || report.status === "Finalized";

    return (
        <>
            <tr
                className={`bg-white hover:bg-slate-50 transition-colors group cursor-pointer ${open ? "border-b-0" : "border-b border-brand-border"}`}
                onClick={() => setOpen(!open)}
            >
                {/* Employee */}
                <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Avatar name={report.name} />
                        <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate max-w-[200px]">{report.name}</p>
                            <p className="text-xs font-semibold text-slate-400 truncate max-w-[200px]">{report.email}</p>
                        </div>
                    </div>
                </td>

                {/* Attendance Summary */}
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                        <StatPill label="Present" value={report.presentDays || 0} variant="success" />
                        <StatPill label="Absent" value={report.absentDays || 0} variant="danger" />
                        <StatPill label="Half Day" value={report.halfDays || 0} variant="warning" />
                        <StatPill label="Leave" value={report.leaveDays || 0} variant="neutral" />
                        {(report.holidayDays || 0) > 0 && <StatPill label="Holiday" value={report.holidayDays} variant="primary" />}
                    </div>
                </td>

                {/* Gross Salary & Status */}
                <td className="px-6 py-4">
                    {report.error ? (
                        <span className="text-xs text-brand-danger font-semibold">{report.error}</span>
                    ) : (
                        <>
                            <p className="text-base font-black tracking-tight text-slate-800">{fmt(report.grossSalary)}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {report.attendanceSource && (
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${report.attendanceSource === "admin" ? "bg-blue-100 text-blue-700" : report.attendanceSource === "mixed" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                                        {report.attendanceSource}
                                    </span>
                                )}
                                {report.status === "Finalized" && (
                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-0.5">
                                        <LockClosedIcon className="w-2.5 h-2.5" /> Locked
                                    </span>
                                )}
                                {report.status === "Paid" && (
                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                        Paid
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </td>

                {/* Toggle */}
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end">
                        {open ? <ChevronUpIcon className="w-5 h-5 text-slate-400" /> : <ChevronDownIcon className="w-5 h-5 text-slate-400" />}
                    </div>
                </td>
            </tr>

            {/* Expanded */}
            {open && (
                <tr className="bg-brand-bg/50 border-b border-brand-border">
                    <td colSpan={4} className="p-0">
                        <div className="px-6 py-6 animate-fade-in-up border-t border-brand-border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                                {/* Rates & Hours */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-brand-border pb-2 mb-3">Rates & Hours</p>
                                    <BreakdownRow label="Base Salary" value={fmt(report.monthlySalary)} />
                                    <BreakdownRow label="Per Day Rate" value={fmt(report.perDayRate)} />
                                    <BreakdownRow label="Per Hour Rate" value={fmt(report.perHourRate)} />
                                    <BreakdownRow label="Required Hrs/Day" value={`${report.requiredHours || 12}h`} />
                                    <BreakdownRow label="Total Hours Worked" value={`${fmtNum(report.totalHoursWorked)}h`} />
                                    <BreakdownRow label="Overtime Hours" value={`${fmtNum(report.overtimeHours)}h`} />
                                    <BreakdownRow label="Payable Days" value={`${fmtNum(report.payableDays)} days`} />
                                </div>

                                {/* Salary Breakdown */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-brand-border pb-2 mb-3">Salary Breakdown</p>
                                    <BreakdownRow label="Gross Salary" value={fmt(report.grossSalary)} />

                                    {/* Advance Deduction Input */}
                                    <div className="flex items-center justify-between py-2 border-b border-brand-border h-12 mt-1">
                                        <span className="text-xs font-semibold text-slate-500">Advance Deduction</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={advance}
                                            disabled={statusLocked}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setAdvance(Math.max(0, Number(e.target.value)))}
                                            className="w-24 h-8 text-right font-bold text-sm bg-white border border-brand-border rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:bg-slate-50"
                                        />
                                    </div>

                                    <BreakdownRow label="Net Payable" value={fmt(netAfterAdvance)} bold />

                                    {/* Actions */}
                                    <div className="mt-5 flex items-center gap-2 justify-end flex-wrap">
                                        {!statusLocked && (
                                            <Button
                                                onClick={(e) => { e.stopPropagation(); onSave(report.employeeId, advance); }}
                                                disabled={saving}
                                                variant="primary"
                                                size="sm"
                                            >
                                                {saving ? "Saving…" : "Calculate & Save"}
                                            </Button>
                                        )}

                                        {report.status && report.status !== "Finalized" && (
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onStatusChange(report.employeeId, report.status === "Paid" ? "Draft" : "Paid");
                                                }}
                                                variant={report.status === "Paid" ? "secondary" : "success"}
                                                size="sm"
                                            >
                                                {report.status === "Paid" ? "Mark Pending" : "Mark Paid"}
                                            </Button>
                                        )}

                                        {report.status === "Finalized" && (
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-brand-border">
                                                <LockClosedIcon className="w-3.5 h-3.5" /> Locked
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SalaryReport() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [savingId, setSavingId] = useState(null);
    const [lockingMonth, setLockingMonth] = useState(false);
    const [lockInfo, setLockInfo] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // ── Fetch lock status ──────────────────────────────────────────────────
    const fetchLockStatus = useCallback(async () => {
        try {
            const { data } = await api.get("/salary/lock-status", { params: { month, year } });
            setLockInfo(data.data ?? data);
        } catch {
            setLockInfo(null);
        }
    }, [month, year]);

    // ── Fetch all salary reports ───────────────────────────────────────────
    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/salary/reports/all", { params: { month, year } });
            const list = data.data ?? data;
            setReports(Array.isArray(list) ? list : []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load salary reports");
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        fetchReports();
        fetchLockStatus();
    }, [fetchReports, fetchLockStatus]);

    const isLocked = lockInfo?.isLocked === true;

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleSave = async (empId, advance) => {
        setSavingId(empId);
        try {
            await api.post(`/salary/save/${empId}`, { advanceDeduction: advance }, { params: { month, year } });
            toast.success("Salary record saved!");
            fetchReports();
        } catch (err) {
            toast.error(err.response?.data?.message || "Save failed");
        } finally {
            setSavingId(null);
        }
    };

    const handleStatusChange = async (empId, newStatus) => {
        try {
            await api.put(`/salary/status/${empId}`, { month, year, status: newStatus });
            toast.success(`Salary marked as ${newStatus}`);
            fetchReports();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    };

    const handleGenerateAll = async () => {
        if (!window.confirm(`Auto-generate salary records for ALL employees for ${MONTHS[month - 1]} ${year}?`)) return;
        setGenerating(true);
        try {
            const { data } = await api.post("/salary/generate-all", { month, year });
            const result = data.data ?? data;
            toast.success(`Generated: ${result.success?.length || 0} success, ${result.failed?.length || 0} failed`);
            fetchReports();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to generate payroll");
        } finally {
            setGenerating(false);
        }
    };

    const handleLockPayroll = async () => {
        if (!window.confirm("Finalize and lock payroll? All salary records will be permanently locked.")) return;
        setLockingMonth(true);
        try {
            await api.post("/salary/lock", { month, year, remark: "Finalized via Salary Reports" });
            toast.success("Payroll finalized and locked!");
            fetchReports();
            fetchLockStatus();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to lock payroll");
        } finally {
            setLockingMonth(false);
        }
    };

    const exportCSV = () => {
        const headers = ["Name", "Email", "Base Salary", "Present", "Absent", "Half Day", "Leave", "Holiday", "Hours", "Overtime", "Per Day Rate", "Gross", "Advance", "Net"];
        const rows = reports.map((r) => [
            r.name, r.email, r.monthlySalary, r.presentDays, r.absentDays,
            r.halfDays, r.leaveDays, r.holidayDays, r.totalHoursWorked,
            r.overtimeHours, r.perDayRate, r.grossSalary, r.advanceDeduction, r.netSalary,
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `salary_${year}_${String(month).padStart(2, "0")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Summary cards
    const totalPayroll = reports.reduce((s, r) => s + (r.grossSalary || 0), 0);
    const totalGiven = reports.filter((r) => r.status === "Paid").reduce((s, r) => s + (r.netSalary || 0), 0);
    const totalPending = reports.filter((r) => r.status !== "Paid").reduce((s, r) => s + (r.grossSalary || 0), 0);

    const filtered = useMemo(() =>
        reports.filter((r) => {
            const q = search.toLowerCase();
            return !search || r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q);
        }), [reports, search]);

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const yearOptions = Array.from({ length: Math.max(now.getFullYear() + 1, 2026) - 2025 + 1 }, (_, i) => 2025 + i);

    return (
        <div className="mt-8 mb-24 flex flex-col gap-6 max-w-[1200px] mx-auto pb-10">

            {/* Page Header */}
            <PageHeader
                title="Salary Report"
                subtitle="Monthly payroll breakdown — all calculations from backend"
                actionNode={
                    <div className="flex items-center gap-2">
                        <Button onClick={handleGenerateAll} disabled={generating || isLocked} variant="secondary" icon={generating ? <ArrowPathIcon className="animate-spin" /> : <BoltIcon />}>
                            {generating ? "Generating..." : "Generate All"}
                        </Button>
                        {!isLocked && (
                            <Button onClick={handleLockPayroll} disabled={lockingMonth} variant="danger" icon={<LockClosedIcon />}>
                                {lockingMonth ? "Locking..." : "Finalize Payroll"}
                            </Button>
                        )}
                        <Button onClick={exportCSV} variant="secondary" icon={<DocumentArrowDownIcon />}>
                            Export CSV
                        </Button>
                    </div>
                }
            />

            {/* Lock Banner */}
            {isLocked && (
                <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-5 py-3.5 text-amber-800">
                    <LockClosedIcon className="w-5 h-5 shrink-0 text-amber-600" />
                    <div>
                        <p className="text-sm font-bold">Payroll Locked for {MONTHS[month - 1]} {year}</p>
                        <p className="text-xs font-medium text-amber-700">
                            Locked by {lockInfo?.lock?.lockedBy?.name || "Admin"}. No further edits are allowed.
                        </p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard icon={CurrencyRupeeIcon} label="Total Payroll" value={fmt(totalPayroll)} accent="blue" />
                <SummaryCard icon={UserIcon} label="Employees" value={reports.length} accent="violet" />
                <SummaryCard icon={CheckCircleIcon} label="Given (Paid)" value={fmt(totalGiven)} accent="green" />
                <SummaryCard icon={ExclamationCircleIcon} label="Pending" value={fmt(totalPending)} accent="red" />
            </div>

            {/* Table Card */}
            <Card noPadding>
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-4 border-b border-brand-border bg-white">
                    <div className="w-full md:w-32">
                        <FormSelect
                            value={month}
                            onChange={(e) => { setMonth(Number(e.target.value)); setPage(1); }}
                            options={MONTHS.map((m, i) => ({ label: m.substring(0, 3), value: i + 1 }))}
                            placeholder={false}
                        />
                    </div>
                    <div className="w-full md:w-32">
                        <FormSelect
                            value={year}
                            onChange={(e) => { setYear(Number(e.target.value)); setPage(1); }}
                            options={yearOptions.map((y) => ({ label: String(y), value: y }))}
                            placeholder={false}
                        />
                    </div>
                    <Button
                        onClick={fetchReports}
                        disabled={loading}
                        variant="primary"
                        icon={<ArrowPathIcon className={loading ? "animate-spin" : ""} />}
                    >
                        {loading ? "Loading…" : "Load"}
                    </Button>
                    <div className="mt-2 md:mt-0 ml-0 md:ml-auto w-full md:w-64">
                        <FormInput
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search employee…"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] table-auto">
                        <thead>
                            <tr className="border-b border-brand-border bg-brand-bg text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                <th className="px-6 py-4 text-left">Employee</th>
                                <th className="px-6 py-4 text-left">Attendance</th>
                                <th className="px-6 py-4 text-left">Gross Salary</th>
                                <th className="px-6 py-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/60">
                            {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                                                <ClockIcon className="w-7 h-7 text-slate-400" />
                                            </div>
                                            <p className="text-base font-bold text-slate-600">No employees found</p>
                                            <p className="text-sm font-medium text-slate-400">Try loading a different month or adding employees</p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && paginated.map((r) => (
                                <EmployeeTableRow
                                    key={r.employeeId}
                                    report={r}
                                    onSave={handleSave}
                                    onStatusChange={handleStatusChange}
                                    saving={savingId === r.employeeId}
                                    isLocked={isLocked}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} total={filtered.length} onChange={setPage} />
            </Card>
        </div>
    );
}

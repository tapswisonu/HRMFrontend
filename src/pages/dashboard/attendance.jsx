import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAttendance } from "../../redux/slices/attendanceSlice";
import {
    MagnifyingGlassIcon,
    PencilSquareIcon,
    XMarkIcon,
    ClockIcon,
    UserGroupIcon,
    CheckCircleIcon,
    ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { toast } from "react-toastify";

// Reusable Components
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormInput, FormSelect } from "@/components/ui/FormInput";

// ── Avatar initials ────────────────────────────────────────────────────────────
const COLORS = ["bg-blue-100 text-brand-primary", "bg-emerald-100 text-brand-success", "bg-rose-100 text-brand-danger", "bg-amber-100 text-amber-700", "bg-teal-100 text-teal-700"];
function Avatar({ name }) {
    const initials = name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?";
    const color = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
    return <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>{initials}</div>;
}

// ── Summary Card ───────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, accent }) {
    const accents = {
        green: { bar: "bg-brand-success", bg: "bg-green-50", icon: "text-brand-success" },
        slate: { bar: "bg-slate-400", bg: "bg-slate-100", icon: "text-slate-500" },
        red: { bar: "bg-brand-danger", bg: "bg-red-50", icon: "text-brand-danger" },
        blue: { bar: "bg-brand-primary", bg: "bg-blue-50", icon: "text-brand-primary" },
    };
    const c = accents[accent] || accents.slate;
    return (
        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow" noPadding>
            <div className={`absolute left-0 top-0 h-full w-1 ${c.bar}`} />
            <div className="px-5 py-4 flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${c.bg} shrink-0 transition-transform group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <div>
                    <p className="text-2xl font-extrabold text-slate-800 leading-none">{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
                </div>
            </div>
        </Card>
    );
}

// ── Skeleton Row ───────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b border-brand-border">
            {[48, 28, 20, 20, 20, 24, 16].map((w, i) => (
                <td key={i} className="px-5 py-4">
                    <div className={`h-3.5 bg-slate-100 rounded w-${w}`} />
                </td>
            ))}
        </tr>
    );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;
function Pagination({ page, total, onChange }) {
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) return null;
    return (
        <div className="flex items-center justify-between px-5 py-3 border-t border-brand-border bg-brand-bg">
            <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</span> of <span className="font-semibold text-slate-600">{total}</span>
            </p>
            <div className="flex items-center gap-1">
                <button onClick={() => onChange(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 transition-colors">
                    <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
                </button>
                {[...Array(Math.min(pages, 5))].map((_, i) => {
                    const p = i + 1;
                    return (
                        <button key={p} onClick={() => onChange(p)} className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${page === p ? "bg-brand-primary text-white" : "hover:bg-slate-200 text-slate-600"}`}>{p}</button>
                    );
                })}
                <button onClick={() => onChange(page + 1)} disabled={page === pages} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 transition-colors">
                    <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                </button>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function Attendance() {
    const dispatch = useDispatch();
    const { attendanceList, loading, error } = useSelector((s) => s.attendance);
    const { token } = useSelector((s) => s.auth);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("all");
    const [dateFilter, setDate] = useState("");
    const [page, setPage] = useState(1);

    // Edit modal state
    const [openModal, setOpenModal] = useState(false);
    const [selectedRecord, setSelected] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ checkInTime: "", checkOutTime: "", status: "" });

    useEffect(() => { dispatch(fetchAllAttendance()); }, [dispatch]);

    const handleEdit = (record) => {
        setSelected(record);
        setFormData({
            checkInTime: record.checkInTime ? new Date(record.checkInTime).toISOString().slice(0, 16) : "",
            checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toISOString().slice(0, 16) : "",
            status: record.status || "Checked In",
        });
        setOpenModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(
                `http://localhost:8000/api/attendance/${selectedRecord._id}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Attendance updated successfully");
            setOpenModal(false);
            dispatch(fetchAllAttendance());
        } catch {
            toast.error("Failed to update attendance");
        } finally { setSaving(false); }
    };

    // ── Filtering ─────────────────────────────────────────────────────────────
    const list = attendanceList || [];
    const filtered = useMemo(() => list.filter(r => {
        const name = r.user?.name?.toLowerCase() || "";
        const email = r.user?.email?.toLowerCase() || "";
        const q = search.toLowerCase();
        const matchSearch = !search || name.includes(q) || email.includes(q);
        const matchStatus = statusFilter === "all" || r.status === statusFilter;
        const matchDate = !dateFilter || new Date(r.date).toLocaleDateString("en-CA") === dateFilter;
        return matchSearch && matchStatus && matchDate;
    }), [list, search, statusFilter, dateFilter]);

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── Summary counts ────────────────────────────────────────────────────────
    const today = new Date().toLocaleDateString("en-CA");
    const todayList = list.filter(r => new Date(r.date).toLocaleDateString("en-CA") === today);
    const counts = {
        in: todayList.filter(r => r.status === "Checked In").length,
        out: todayList.filter(r => r.status === "Checked Out").length,
        abs: todayList.filter(r => r.status === "Absent").length,
        tot: todayList.length,
    };

    const COLS = ["Employee", "Date", "Status", "Check In", "Check Out", "Device", "Action"];

    return (
        <div className="mt-8 mb-10 flex flex-col gap-6 max-w-[1200px] mx-auto pb-10">

            {/* ── Page Header ─────────────────────────────────────────────────────── */}
            <PageHeader
                title="Employee Attendance"
                subtitle="Monitor and manage daily attendance records"
                actionNode={
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-success bg-green-50 border border-green-200 px-3 py-1.5 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                        Today: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                }
            />

            {/* ── Summary Cards ─────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <SummaryCard icon={UserGroupIcon} label="Total Today" value={counts.tot} accent="blue" />
                <SummaryCard icon={CheckCircleIcon} label="Checked In" value={counts.in} accent="green" />
                <SummaryCard icon={ArrowLeftOnRectangleIcon} label="Checked Out" value={counts.out} accent="slate" />
                <SummaryCard icon={ClockIcon} label="Absent" value={counts.abs} accent="red" />
            </div>

            {/* ── Main Card ─────────────────────────────────────────────────────────────── */}
            <Card noPadding>
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-4 border-b border-brand-border bg-white">
                    {/* Search */}
                    <div className="flex-1 max-w-sm">
                        <FormInput
                            placeholder="Search employee..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            icon={<MagnifyingGlassIcon className="w-4 h-4" />}
                        />
                    </div>

                    {/* Date filter */}
                    <div className="w-full md:w-44">
                        <FormInput
                            type="date"
                            value={dateFilter}
                            onChange={e => { setDate(e.target.value); setPage(1); }}
                        />
                    </div>

                    {/* Status filter */}
                    <div className="w-full md:w-44">
                        <FormSelect
                            value={statusFilter}
                            onChange={e => { setStatus(e.target.value); setPage(1); }}
                            placeholder={false}
                            options={[
                                { label: "All Status", value: "all" },
                                { label: "Checked In", value: "Checked In" },
                                { label: "Checked Out", value: "Checked Out" },
                                { label: "Absent", value: "Absent" },
                                { label: "Late", value: "Late" }
                            ]}
                        />
                    </div>

                    {/* Clear filters */}
                    {(search || dateFilter || statusFilter !== "all") && (
                        <button onClick={() => { setSearch(""); setDate(""); setStatus("all"); setPage(1); }}
                            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-danger transition-colors ml-2"
                        >
                            <XMarkIcon className="w-4 h-4" /> Clear
                        </button>
                    )}

                    <span className="md:ml-auto text-xs font-bold text-slate-400">
                        {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] table-auto">
                        <thead>
                            <tr className="border-b border-brand-border bg-brand-bg text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                {COLS.map(col => (
                                    <th key={col} className="px-5 py-4 text-left">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/60">
                            {loading && [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}

                            {!loading && error && (
                                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm font-semibold text-brand-danger">{error}</td></tr>
                            )}

                            {!loading && !error && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                <ClockIcon className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-600">No attendance records found</p>
                                            <p className="text-xs font-medium text-slate-400">Try adjusting your filters or date range</p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && paginated.map((record) => {
                                let badgeVariant = "neutral";
                                if (record.status === "Checked In") badgeVariant = "success";
                                else if (record.status === "Absent") badgeVariant = "danger";
                                else if (record.status === "Late") badgeVariant = "warning";
                                else if (record.status === "On Leave") badgeVariant = "primary";

                                return (
                                    <tr key={record._id} className="bg-white hover:bg-slate-50 transition-colors group">
                                        {/* Employee */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={record.user?.name} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate max-w-[130px]">{record.user?.name || "Unknown"}</p>
                                                    <p className="text-[11px] font-semibold text-slate-400 truncate max-w-[130px]">{record.user?.email || ""}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Date */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-bold text-slate-600">
                                                {new Date(record.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </p>
                                        </td>
                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <Badge variant={badgeVariant}>{record.status || "Checked Out"}</Badge>
                                        </td>
                                        {/* Check In */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-slate-600 font-bold">
                                                {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : <span className="text-slate-300">—</span>}
                                            </p>
                                        </td>
                                        {/* Check Out */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-slate-600 font-bold">
                                                {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : <span className="text-slate-300">—</span>}
                                            </p>
                                        </td>
                                        {/* Device */}
                                        <td className="px-5 py-4">
                                            <p className="text-xs font-bold text-slate-400 font-mono truncate max-w-[90px]" title={record.deviceId}>
                                                {record.deviceId ? record.deviceId.slice(0, 12) + "…" : <span className="text-slate-300">N/A</span>}
                                            </p>
                                        </td>
                                        {/* Action */}
                                        <td className="px-5 py-4">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleEdit(record)}
                                                icon={<PencilSquareIcon />}
                                            >
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination page={page} total={filtered.length} onChange={setPage} />
            </Card>

            {/* ── Edit Modal ─────────────────────────────────────────────────────────── */}
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpenModal(false)} />

                    {/* Panel */}
                    <Card className="relative z-10 w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up p-0" noPadding>
                        {/* Top accent */}
                        <div className="h-1.5 w-full bg-brand-primary" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
                            <div>
                                <p className="text-lg font-bold text-slate-800">Edit Attendance</p>
                                <p className="text-xs font-semibold text-slate-400 mt-0.5">{selectedRecord?.user?.name} · {new Date(selectedRecord?.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                            </div>
                            <button onClick={() => setOpenModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                <XMarkIcon className="w-5 h-5 font-bold" />
                            </button>
                        </div>

                        {/* Body */}
                        <CardBody className="px-6 py-6 border-b border-brand-border">
                            <FormInput
                                label="Check In Time"
                                type="datetime-local"
                                value={formData.checkInTime}
                                onChange={e => setFormData({ ...formData, checkInTime: e.target.value })}
                            />

                            <FormInput
                                label="Check Out Time"
                                type="datetime-local"
                                value={formData.checkOutTime}
                                onChange={e => setFormData({ ...formData, checkOutTime: e.target.value })}
                            />

                            <FormSelect
                                label="Status"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                placeholder={false}
                                options={[
                                    { label: "Checked In", value: "Checked In" },
                                    { label: "Checked Out", value: "Checked Out" },
                                    { label: "Absent", value: "Absent" },
                                    { label: "Late", value: "Late" }
                                ]}
                            />
                        </CardBody>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-brand-bg">
                            <Button variant="ghost" onClick={() => setOpenModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleSave} disabled={saving}>
                                {saving ? "Saving…" : "Save Changes"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default Attendance;

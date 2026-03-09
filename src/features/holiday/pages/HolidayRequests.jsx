import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    fetchMyLeaveRequests, fetchAllLeaveRequests, fetchMyLeaveBalance,
    submitLeaveRequest, reviewLeaveRequest,
} from "../leaveSlice";
import {
    CalendarDaysIcon, PlusIcon, ClockIcon, CheckCircleIcon, XCircleIcon,
    XMarkIcon, ChevronDownIcon, ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { isManagerOrAbove } from "../../../utils/rbac";

// ─── Constants ────────────────────────────────────────────────────────────────

const LEAVE_TYPES = ["Casual", "Sick", "Paid", "Unpaid"];

const TYPE_STYLE = {
    Casual: { badge: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-400" },
    Sick: { badge: "bg-rose-50 text-rose-700 border-rose-100", dot: "bg-rose-400" },
    Paid: { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-400" },
    Unpaid: { badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

const STATUS_STYLE = {
    Pending: { cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: ClockIcon },
    Approved: { cls: "bg-green-50 text-green-700 border-green-200", Icon: CheckCircleIcon },
    Rejected: { cls: "bg-red-50 text-red-700 border-red-200", Icon: XCircleIcon },
};

const BALANCE_CARDS = [
    { key: "casual", label: "Casual", color: "from-blue-500 to-blue-600", light: "bg-blue-50 text-blue-700 border-blue-200" },
    { key: "sick", label: "Sick", color: "from-rose-500 to-rose-600", light: "bg-rose-50 text-rose-700 border-rose-200" },
    { key: "paid", label: "Paid", color: "from-emerald-500 to-emerald-600", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { key: "unpaid", label: "Unpaid", color: "from-slate-400 to-slate-500", light: "bg-slate-50 text-slate-600 border-slate-200" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countWorkingDays(start, end) {
    if (!start || !end) return 0;
    let count = 0;
    const cur = new Date(start);
    const last = new Date(end);
    while (cur <= last) {
        const d = cur.getDay();
        if (d !== 0 && d !== 6) count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
}

function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

// ─── Leave Balance Cards ──────────────────────────────────────────────────────

function BalanceCards({ balance }) {
    if (!balance) return null;
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BALANCE_CARDS.map(({ key, label, color, light }) => {
                const b = balance[key] || {};
                const total = b.total ?? "∞";
                const used = b.used ?? 0;
                const remaining = total === null ? "∞" : Math.max(0, (total || 0) - used);
                const pct = total && total !== "∞" && total > 0 ? Math.min(100, (used / total) * 100) : 0;

                return (
                    <div key={key} className={`rounded-2xl border p-4 flex flex-col gap-2 ${light}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-widest opacity-70">{label}</span>
                            <span className="text-xs font-bold">{remaining} left</span>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-extrabold leading-none">{used}</span>
                            <span className="text-xs opacity-60 mb-0.5">/ {total ?? "∞"} used</span>
                        </div>
                        {total !== null && total > 0 && (
                            <div className="h-1.5 rounded-full bg-white/60 overflow-hidden">
                                <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }) {
    const { cls, Icon } = STATUS_STYLE[status] || STATUS_STYLE.Pending;
    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cls}`}>
            <Icon className="w-3.5 h-3.5" />
            {status}
        </span>
    );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

function RequestCard({ req, isAdmin, onReview }) {
    const [expanded, setExpanded] = useState(false);
    const workDays = countWorkingDays(req.startDate, req.endDate);
    const t = TYPE_STYLE[req.leaveType] || TYPE_STYLE.Casual;

    return (
        <div className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
            <div
                className="flex items-start gap-3 px-5 py-4 cursor-pointer"
                onClick={() => setExpanded((v) => !v)}
            >
                {/* Dot */}
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${t.dot}`} />

                <div className="flex-1 min-w-0">
                    {/* Employee name (admin view) */}
                    {isAdmin && req.employee && (
                        <p className="text-sm font-bold text-slate-800 mb-0.5">
                            {req.employee.name}
                            <span className="ml-1.5 text-xs font-normal text-slate-400">{req.employee.email}</span>
                        </p>
                    )}

                    {/* Date range + days */}
                    <p className="text-sm font-semibold text-slate-700">
                        {fmtDate(req.startDate)} → {fmtDate(req.endDate)}
                        <span className="ml-2 text-[11px] text-slate-400 font-normal">({workDays} working day{workDays !== 1 ? "s" : ""})</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${t.badge}`}>{req.leaveType}</span>
                        <StatusPill status={req.status} />
                        <span className="text-[10px] text-slate-400 ml-auto">
                            {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </span>
                    </div>
                </div>
                <div className="shrink-0 text-slate-300 mt-1">
                    {expanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </div>
            </div>

            {/* Expanded Detail */}
            {expanded && (
                <div className="px-10 pb-4 flex flex-col gap-3">
                    {/* Reason */}
                    <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 italic">
                        "{req.reason}"
                    </div>

                    {/* Admin remark */}
                    {req.adminRemark && (
                        <div className={`text-xs font-medium px-4 py-3 rounded-xl border ${req.status === "Approved" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}>
                            <span className="font-bold">Admin: </span>{req.adminRemark}
                        </div>
                    )}

                    {/* Review by */}
                    {req.reviewedBy && (
                        <p className="text-[10px] text-slate-400">
                            Reviewed by <span className="font-semibold">{req.reviewedBy.name || "Admin"}</span>
                            {req.reviewedAt ? ` · ${fmtDate(req.reviewedAt)}` : ""}
                        </p>
                    )}

                    {/* Admin review panel — Pending only */}
                    {isAdmin && req.status === "Pending" && (
                        <ReviewPanel reqId={req._id} onReview={onReview} />
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Inline Review Panel ──────────────────────────────────────────────────────

function ReviewPanel({ reqId, onReview }) {
    const [remark, setRemark] = useState("");
    const { reviewing } = useSelector((s) => s.leave);

    return (
        <div className="mt-1 p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col gap-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Review</p>
            <textarea
                rows={2}
                placeholder="Add a comment (optional)..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 outline-none resize-none transition-all"
            />
            <div className="flex gap-2">
                <button
                    onClick={() => onReview(reqId, "Approved", remark)}
                    disabled={reviewing}
                    className="flex-1 h-9 text-sm font-bold rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
                >
                    <CheckCircleIcon className="w-4 h-4" /> Approve
                </button>
                <button
                    onClick={() => onReview(reqId, "Rejected", remark)}
                    disabled={reviewing}
                    className="flex-1 h-9 text-sm font-bold rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
                >
                    <XCircleIcon className="w-4 h-4" /> Reject
                </button>
            </div>
        </div>
    );
}

// ─── Submit Request Modal ─────────────────────────────────────────────────────

function RequestModal({ onClose, balance }) {
    const dispatch = useDispatch();
    const { submitting } = useSelector((s) => s.leave);
    const [form, setForm] = useState({ startDate: "", endDate: "", leaveType: "Casual", reason: "" });

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const workDays = countWorkingDays(form.startDate, form.endDate);
    const balKey = { Casual: "casual", Sick: "sick", Paid: "paid", Unpaid: "unpaid" }[form.leaveType];
    const bal = balance?.[balKey];
    const remaining = bal?.total != null ? Math.max(0, bal.total - (bal.used || 0)) : Infinity;
    const overQuota = form.leaveType !== "Unpaid" && workDays > remaining && workDays > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.startDate || !form.endDate || !form.reason) return toast.warning("Fill all required fields");
        if (overQuota) return toast.error(`Insufficient ${form.leaveType} leave balance`);
        const res = await dispatch(submitLeaveRequest(form));
        if (res.meta.requestStatus === "fulfilled") {
            toast.success("Leave request submitted!");
            dispatch(fetchMyLeaveBalance());
            onClose();
        } else {
            toast.error(res.payload || "Submit failed");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-fadeInUp">
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100">
                    <XMarkIcon className="w-5 h-5 text-slate-400" />
                </button>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Submit Leave Request</h2>
                <p className="text-xs text-slate-400 mb-5">Pending admin approval.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        {[["startDate", "Start Date"], ["endDate", "End Date"]].map(([k, lbl]) => (
                            <div key={k}>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{lbl}</label>
                                <input type="date" required value={form[k]} onChange={(e) => set(k, e.target.value)}
                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:border-blue-400 outline-none" />
                            </div>
                        ))}
                    </div>

                    {/* Days preview + balance warning */}
                    {workDays > 0 && (
                        <div className={`text-xs font-semibold px-3 py-2 rounded-xl border ${overQuota ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
                            {workDays} working day{workDays !== 1 ? "s" : ""} · {overQuota ? `Only ${remaining} day(s) remaining!` : `${remaining === Infinity ? "Unlimited" : remaining + " day(s)"} remaining`}
                        </div>
                    )}

                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Leave Type</label>
                        <select value={form.leaveType} onChange={(e) => set("leaveType", e.target.value)}
                            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-blue-400 outline-none">
                            {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Reason *</label>
                        <textarea required rows={3} value={form.reason} onChange={(e) => set("reason", e.target.value)}
                            placeholder="Why do you need this leave?"
                            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:border-blue-400 outline-none resize-none" />
                    </div>

                    <div className="flex gap-3 mt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 h-10 text-sm font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting || overQuota}
                            className="flex-1 h-10 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors">
                            {submitting ? "Submitting…" : "Submit Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Admin Filter Tabs ────────────────────────────────────────────────────────

const STATUS_TABS = ["all", "Pending", "Approved", "Rejected"];
const TAB_STYLE = {
    all: "hover:text-slate-700",
    Pending: "hover:text-amber-600",
    Approved: "hover:text-green-600",
    Rejected: "hover:text-red-600",
};
const TAB_ACTIVE = {
    all: "text-slate-800 border-b-2 border-slate-700",
    Pending: "text-amber-700 border-b-2 border-amber-500",
    Approved: "text-green-700 border-b-2 border-green-500",
    Rejected: "text-red-700 border-b-2 border-red-500",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HolidayRequests() {
    const dispatch = useDispatch();
    const { user } = useSelector((s) => s.auth);
    const { requests, balance, loading } = useSelector((s) => s.leave);

    const isAdmin = isManagerOrAbove(user?.role);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    // Initial fetch
    useEffect(() => {
        if (isAdmin) {
            dispatch(fetchAllLeaveRequests(activeTab));
        } else {
            dispatch(fetchMyLeaveRequests());
            dispatch(fetchMyLeaveBalance());
        }
    }, [dispatch, isAdmin]);

    // Re-fetch on tab change (admin only)
    useEffect(() => {
        if (isAdmin) dispatch(fetchAllLeaveRequests(activeTab));
    }, [activeTab, isAdmin, dispatch]);

    const filteredRequests = useMemo(() => {
        if (!isAdmin || activeTab === "all") return requests;
        return requests.filter((r) => r.status === activeTab);
    }, [requests, activeTab, isAdmin]);

    const handleReview = async (id, status, adminRemark) => {
        const res = await dispatch(reviewLeaveRequest({ id, status, adminRemark }));
        if (res.meta.requestStatus === "fulfilled") {
            toast.success(`Request ${status}`);
            if (isAdmin) dispatch(fetchAllLeaveRequests(activeTab));
        } else {
            toast.error(res.payload || "Review failed");
        }
    };

    const pendingCount = requests.filter((r) => r.status === "Pending").length;

    return (
        <div className="mt-10 mb-10 flex flex-col gap-6 max-w-5xl mx-auto">

            {/* ── Page Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                            {isAdmin ? "Leave Requests" : "My Leaves"}
                            {pendingCount > 0 && (
                                <span className="text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                    {pendingCount} pending
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-slate-400">
                            {isAdmin ? "Review and manage employee leave requests" : "Submit and track your leave requests"}
                        </p>
                    </div>
                </div>

                {!isAdmin && (
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:-translate-y-0.5 transition-all">
                        <PlusIcon className="w-4 h-4" /> New Request
                    </button>
                )}
            </div>

            {/* ── Leave Balance (employee only) ─────────────────────────────────── */}
            {!isAdmin && <BalanceCards balance={balance} />}

            {/* ── Main Card ────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Admin filter tabs */}
                {isAdmin && (
                    <div className="flex items-center gap-1 px-5 border-b border-slate-100 bg-slate-50/70">
                        {STATUS_TABS.map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 text-sm font-semibold capitalize transition-all ${tab === activeTab ? TAB_ACTIVE[tab] : `text-slate-400 ${TAB_STYLE[tab]}`}`}>
                                {tab === "all" ? "All" : tab}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col gap-0">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse flex gap-3 px-5 py-4 border-b border-slate-50">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-100 mt-1.5" />
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="h-4 w-48 bg-slate-100 rounded" />
                                    <div className="h-3 w-32 bg-slate-100 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="py-16 text-center">
                        <CalendarDaysIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-400">No {activeTab !== "all" ? activeTab.toLowerCase() : ""} requests found</p>
                        {!isAdmin && (
                            <button onClick={() => setShowModal(true)}
                                className="mt-3 text-sm text-blue-600 hover:underline font-medium">
                                Submit your first request →
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        {filteredRequests.map((req) => (
                            <RequestCard key={req._id} req={req} isAdmin={isAdmin} onReview={handleReview} />
                        ))}
                    </div>
                )}
            </div>

            {/* Submit Modal */}
            {showModal && <RequestModal onClose={() => setShowModal(false)} balance={balance} />}
        </div>
    );
}

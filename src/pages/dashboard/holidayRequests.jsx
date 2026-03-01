import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import {
    CalendarDaysIcon,
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const STATUS_COLORS = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function HolidayRequests() {
    const { user, token } = useSelector((state) => state.auth);
    const isAdmin = user?.role === "admin" || user?.role === "manager";

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [leaveType, setLeaveType] = useState("Casual");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Admin Review State
    const [reviewRemark, setReviewRemark] = useState("");
    const [reviewingId, setReviewingId] = useState(null);

    const headers = { Authorization: `Bearer ${token}` };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const endpoint = isAdmin ? "/holiday-request/all" : "/holiday-request/my";
            const { data } = await axios.get(`${BASE}${endpoint}`, { headers });
            setRequests(data);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [isAdmin, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate || !reason) {
            return toast.warning("Please fill all required fields");
        }

        setSubmitting(true);
        try {
            await axios.post(
                `${BASE}/holiday-request`,
                { startDate, endDate, leaveType, reason },
                { headers }
            );
            toast.success("Holiday request submitted successfully!");
            setShowModal(false);
            setStartDate("");
            setEndDate("");
            setReason("");
            fetchRequests();
        } catch (err) {
            toast.error(err.response?.data?.message || "Submit failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReview = async (id, status) => {
        try {
            await axios.put(
                `${BASE}/holiday-request/${id}/review`,
                { status, adminRemark: reviewRemark },
                { headers }
            );
            toast.success(`Request ${status}`);
            setReviewingId(null);
            setReviewRemark("");
            fetchRequests();
        } catch (err) {
            toast.error(err.response?.data?.message || "Review failed");
        }
    };

    return (
        <div className="mt-10 mb-10 flex flex-col gap-5 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900">Holiday Requests</h1>
                        <p className="text-sm text-slate-400">
                            {isAdmin ? "Manage employee leave and holiday requests" : "Submit and track your holiday requests"}
                        </p>
                    </div>
                </div>
                {!isAdmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
                    >
                        <PlusIcon className="w-4 h-4" /> New Request
                    </button>
                )}
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-slate-400">Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">No requests found.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {requests.map((req) => (
                            <div key={req._id} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center hover:bg-slate-50 transition">
                                <div className="flex-1">
                                    {isAdmin && (
                                        <p className="text-sm font-bold text-slate-900 mb-1">{req.employee?.name} <span className="text-xs font-normal text-slate-500">({req.employee?.email})</span></p>
                                    )}
                                    <p className="text-sm font-medium text-slate-800">
                                        {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-200">
                                            {req.leaveType}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[req.status]}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                        "{req.reason}"
                                    </p>
                                    {req.adminRemark && (
                                        <p className="text-xs text-blue-600 mt-1 font-medium bg-blue-50 p-2 rounded">
                                            Admin: {req.adminRemark}
                                        </p>
                                    )}
                                </div>

                                {/* Admin Actions */}
                                {isAdmin && req.status === "Pending" && (
                                    <div className="flex flex-col gap-2 w-full md:w-auto shrink-0 bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                                        {reviewingId === req._id ? (
                                            <>
                                                <input
                                                    type="text"
                                                    placeholder="Admin remarks (optional)"
                                                    value={reviewRemark}
                                                    onChange={(e) => setReviewRemark(e.target.value)}
                                                    className="text-xs px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleReview(req._id, "Approved")} className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700">Approve</button>
                                                    <button onClick={() => handleReview(req._id, "Rejected")} className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700">Reject</button>
                                                </div>
                                                <button onClick={() => setReviewingId(null)} className="text-[10px] text-slate-400 hover:text-slate-600 underline">Cancel</button>
                                            </>
                                        ) : (
                                            <button onClick={() => setReviewingId(req._id)} className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50">
                                                Review Request
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Request Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 animate-fade-in-up">
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Request Holiday</h2>
                        <p className="text-xs text-slate-500 mb-5">Submit a leave request for admin approval.</p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 block mb-1">Start Date</label>
                                    <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600 block mb-1">End Date</label>
                                    <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Leave Type</label>
                                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none bg-white">
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Paid">Paid Leave</option>
                                    <option value="Unpaid">Unpaid Leave</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Reason</label>
                                <textarea required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why do you need this leave?" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none resize-none"></textarea>
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-60">
                                    {submitting ? "Submitting..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttendance } from "../../redux/slices/attendanceSlice";
import CheckIn from "./CheckIn";
import {
  ClockIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const key = (status || "").toLowerCase();
  let variant = "neutral";
  if (key === "checked in") variant = "success";
  if (key === "checked out") variant = "primary";
  if (key === "absent") variant = "danger";
  if (key === "late") variant = "warning";

  return (
    <Badge variant={variant} className="capitalize">
      {status || "Unknown"}
    </Badge>
  );
}

// ── Avatar initials ────────────────────────────────────────────────────────────
const COLORS = ["bg-blue-100 text-brand-primary", "bg-violet-100 text-violet-700", "bg-teal-100 text-teal-700", "bg-amber-100 text-amber-700"];
function AvatarInitials({ name, size = "lg" }) {
  const initials = name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?";
  const color = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
  const dim = size === "lg" ? "w-16 h-16 text-2xl" : "w-10 h-10 text-sm";
  return (
    <div className={`${dim} rounded-full flex items-center justify-center font-black shrink-0 ${color} border-4 border-white/20 shadow-sm`}>
      {initials}
    </div>
  );
}

// ── Skeleton Row ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-brand-border">
      {[28, 20, 20, 20, 20, 16].map((w, i) => (
        <td key={i} className="px-6 py-5">
          <div className={`h-4 bg-slate-100 rounded-md w-${w}`} />
        </td>
      ))}
    </tr>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
function Pagination({ page, total, onChange }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-brand-bg">
      <p className="text-xs font-semibold text-slate-400">Page <span className="font-black text-slate-600 tracking-wider">{page}</span> of <span className="font-black text-slate-600 tracking-wider">{pages}</span></p>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onChange(page - 1)} disabled={page === 1} className="!px-2">
          <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
        </Button>
        {[...Array(pages)].map((_, i) => (
          <button key={i} onClick={() => onChange(i + 1)} className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${page === i + 1 ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20" : "hover:bg-slate-200 text-slate-600"}`}>{i + 1}</button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onChange(page + 1)} disabled={page === pages} className="!px-2">
          <ChevronRightIcon className="w-5 h-5 text-slate-600" />
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function EmployeeDashboard() {
  const dispatch = useDispatch();
  const { attendanceList, loading } = useSelector((s) => s.attendance);
  const user = useSelector((s) => s.auth.user);

  const [today, setToday] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => { dispatch(fetchAttendance()); }, [dispatch]);

  useEffect(() => {
    if (attendanceList?.length > 0) {
      const rec = attendanceList.find(r => new Date(r.date).toDateString() === new Date().toDateString());
      setToday(rec || null);
    }
  }, [attendanceList]);

  const handleActionComplete = () => dispatch(fetchAttendance());

  const fmt = (t) => t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

  // Monthly stats
  const now = new Date();
  const thisMonth = (attendanceList || []).filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const presentDays = thisMonth.filter(r => r.status?.toLowerCase() === "checked in" || r.checkInTime).length;

  // Working hours for today
  const todayHours = useMemo(() => {
    if (!today?.checkInTime || !today?.checkOutTime) return null;
    const diff = new Date(today.checkOutTime) - new Date(today.checkInTime);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  }, [today]);

  const list = attendanceList || [];
  const paginated = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mt-8 mb-24 flex flex-col gap-6 max-w-[1200px] mx-auto pb-10">

      {/* ── Welcome Card ─────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-brand-primary via-blue-600 to-indigo-700 rounded-[2rem] overflow-hidden shadow-xl shadow-brand-primary/10">
        {/* Decorative */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-3xl opacity-70" />
        <div className="absolute -bottom-12 right-1/4 w-48 h-48 rounded-full bg-indigo-900/20 pointer-events-none blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-8 py-8 md:py-10">
          <div className="flex items-center gap-5">
            <AvatarInitials name={user?.name} size="lg" />
            <div>
              <p className="text-[11px] font-bold text-blue-200 uppercase tracking-[0.2em] mb-1">Employee Dashboard</p>
              <h1 className="text-3xl font-black text-white leading-tight tracking-tight">
                Welcome, {user?.name?.split(" ")[0] || "Employee"} 👋
              </h1>
              <p className="text-blue-100 text-sm mt-1.5 font-medium">Track your daily attendance &amp; work activity</p>
            </div>
          </div>

          {/* Quick Status */}
          <div className="flex flex-col items-start sm:items-end gap-3 shrink-0 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
            <StatusBadge status={today?.status || (today?.checkInTime ? "Checked In" : "Not Checked In")} />
            {todayHours && (
              <span className="text-xs font-bold text-blue-100 flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                Working: {todayHours}
              </span>
            )}
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-200/80">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Two-column: Actions + Today Summary ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Check In / Out */}
        <div className="lg:col-span-3">
          <CheckIn onActionComplete={handleActionComplete} />
        </div>

        {/* Today's Info */}
        <Card className="lg:col-span-2 flex flex-col space-y-5">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-brand-border pb-3 mb-1">Today's Summary</h3>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
              <ClockIcon className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Check-In</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{fmt(today?.checkInTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
              <ClockIcon className="w-5 h-5 text-brand-danger" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Check-Out</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{fmt(today?.checkOutTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 border border-violet-100">
              <CalendarDaysIcon className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Days Present (This Month)</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{presentDays} days</p>
            </div>
          </div>

          {today?.location?.lat && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                <MapPinIcon className="w-5 h-5 text-brand-success" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Location</p>
                <p className="text-xs font-bold text-slate-700 font-mono mt-0.5">
                  {today.location.lat.toFixed(4)}, {today.location.lng.toFixed(4)}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── Attendance Records Table ──────────────────────────────────────────── */}
      <Card noPadding>
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border bg-white">
          <h3 className="text-base font-black text-slate-800 tracking-tight">Attendance Records</h3>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{list.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] table-auto">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg text-[10px] font-black uppercase tracking-widest text-slate-400">
                {["Date", "Check In", "Check Out", "Device", "Location", "Status"].map(col => (
                  <th key={col} className="px-6 py-4 text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-slate-50 border border-brand-border flex items-center justify-center">
                        <CalendarDaysIcon className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="text-base font-black text-slate-600">No records yet</p>
                      <p className="text-sm font-medium text-slate-400">Your attendance history will appear here</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && paginated.map((rec, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors duration-150">
                  {/* Date */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-700">
                      {new Date(rec.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </td>
                  {/* Check In */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 font-bold tracking-wide">{fmt(rec.checkInTime)}</p>
                  </td>
                  {/* Check Out */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 font-bold tracking-wide">{fmt(rec.checkOutTime)}</p>
                  </td>
                  {/* Device */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2" title={rec.deviceId}>
                      <DevicePhoneMobileIcon className="w-4 h-4 text-slate-400 shrink-0" />
                      <p className="text-[11px] text-slate-500 font-mono font-semibold truncate max-w-[90px]">
                        {rec.deviceId ? rec.deviceId.slice(0, 10) + "…" : "—"}
                      </p>
                    </div>
                  </td>
                  {/* Location */}
                  <td className="px-6 py-4">
                    {rec.location?.lat ? (
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <p className="text-[11px] text-slate-500 font-mono font-semibold">
                          {rec.location.lat.toFixed(3)}, {rec.location.lng.toFixed(3)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-sm font-black">—</span>
                    )}
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={rec.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} total={list.length} onChange={setPage} />
      </Card>

    </div>
  );
}

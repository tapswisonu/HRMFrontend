import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersByRole } from "../../features/users/userSlice";
import { Link } from "react-router-dom";
import AdminMap from "../../components/AdminMap";
import {
  UsersIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

// ── Avatar with initials fallback ─────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
];

function UserAvatar({ name }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  const colorClass = AVATAR_COLORS[name?.charCodeAt(0) % AVATAR_COLORS.length] || AVATAR_COLORS[0];
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${colorClass}`}
    >
      {initials}
    </div>
  );
}

// ── Role Badge ─────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const styles = {
    admin: "bg-violet-100 text-violet-700 border-violet-200",
    manager: "bg-emerald-100 text-emerald-700 border-emerald-200",
    employee: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${styles[role] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {role}
    </span>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status, checkInTime, checkOutTime }) {
  const isIn = status === "Checked In";
  const fmt = (t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${isIn ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isIn ? "bg-green-500" : "bg-slate-400"}`} />
        {status || "Offline"}
      </span>
      {checkInTime && (
        <span className="text-[10px] text-slate-400 pl-1">
          In: {fmt(checkInTime)}
        </span>
      )}
      {checkOutTime && (
        <span className="text-[10px] text-slate-400 pl-1">
          Out: {fmt(checkOutTime)}
        </span>
      )}
    </div>
  );
}

// ── Skeleton Row ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className={`h-4 bg-slate-100 rounded ${i === 0 ? "w-32" : i === 1 ? "w-40" : "w-16"}`} />
        </td>
      ))}
    </tr>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

function Pagination({ page, total, onChange }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
      <p className="text-xs text-slate-500">
        Page <span className="font-semibold text-slate-700">{page}</span> of{" "}
        <span className="font-semibold text-slate-700">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${page === i + 1
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100 text-slate-600"
              }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function Users() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((s) => s.users);

  const [role, setRole] = useState("employee");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsersByRole(role));
    setPage(1);
    setSearch("");
    setStatusFilter("all");
  }, [dispatch, role]);

  // Filter + search
  const filtered = useMemo(() => {
    return (list || []).filter((u) => {
      const matchSearch =
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "in" && u.status === "Checked In") ||
        (statusFilter === "out" && u.status !== "Checked In");
      return matchSearch && matchStatus;
    });
  }, [list, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const COLS = ["User", "Email", "Role", "Status", "Location", "Joined", "Action"];

  return (
    <div className="mt-10 mb-8 flex flex-col gap-8">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            {role === "employee" ? "Employees" : "Admins"}
            <span className="ml-2 text-sm font-normal text-slate-400">({filtered.length})</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage and monitor {role === "employee" ? "employee" : "admin"} accounts
          </p>
        </div>
        <Link
          to="/dashboard/create-user"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <PlusIcon className="w-4 h-4" />
          Create User
        </Link>
      </div>

      {/* ── Main Card ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">

        {/* ── Toolbar ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100">

          {/* Tab Toggle — Employees / Admins */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setRole("employee")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${role === "employee"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <UsersIcon className="w-4 h-4" />
              Employees
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${role === "admin"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <ShieldCheckIcon className="w-4 h-4" />
              Admins
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs ml-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 pl-3 pr-8 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 appearance-none cursor-pointer transition-all"
            >
              <option value="all">All Status</option>
              <option value="in">Checked In</option>
              <option value="out">Checked Out</option>
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {COLS.map((col) => (
                  <th key={col} className="px-5 py-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {col}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Loading skeleton */}
              {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

              {/* Error */}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                  </td>
                </tr>
              )}

              {/* Empty state */}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">No users found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!loading && paginated.map((u, key) => (
                <tr
                  key={u._id}
                  className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors duration-150 group"
                >
                  {/* User */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={u.name} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]" title={u._id}>
                          #{u._id?.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-slate-600 truncate max-w-[180px]" title={u.email}>
                      {u.email}
                    </p>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-3.5">
                    <RoleBadge role={u.role} />
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      status={u.status}
                      checkInTime={u.checkInTime}
                      checkOutTime={u.checkOutTime}
                    />
                  </td>

                  {/* Location */}
                  <td className="px-5 py-3.5">
                    {u.location?.lat ? (
                      <div className="flex items-start gap-1.5">
                        <MapPinIcon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-600">
                            {u.location.lat.toFixed(3)}, {u.location.lng.toFixed(3)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]" title={u.deviceId}>
                            {u.deviceId ? u.deviceId.slice(0, 12) + "…" : "No device"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-slate-600">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </p>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/dashboard/edit-user/${u._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 transition-colors duration-150"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ────────────────────────────────────────────────────── */}
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>

      {/* ── Admin Map ──────────────────────────────────────────────────────────── */}
      <AdminMap />
    </div>
  );
}

export default Users;

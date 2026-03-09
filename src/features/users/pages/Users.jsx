import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersByRole, deleteUser, resetUserPassword } from "../userSlice";
import { Link, useNavigate } from "react-router-dom";
import AdminMap from "../../../components/AdminMap";
import { toast } from "react-toastify";
import {
  UsersIcon, ShieldCheckIcon, MagnifyingGlassIcon, MapPinIcon,
  EyeIcon, PencilSquareIcon, KeyIcon, TrashIcon, EllipsisVerticalIcon,
  ExclamationTriangleIcon, XMarkIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// ── Avatar ─────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700", "bg-indigo-100 text-indigo-700",
];
function UserAvatar({ name }) {
  const initials = name ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "?";
  const color = AVATAR_COLORS[name?.charCodeAt(0) % AVATAR_COLORS.length] || AVATAR_COLORS[0];
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

// ── Role Badge ─────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const styles = {
    super_admin: "bg-yellow-100 text-yellow-800 border-yellow-200",
    admin: "bg-violet-100 text-violet-700 border-violet-200",
    manager: "bg-emerald-100 text-emerald-700 border-emerald-200",
    employee: "bg-blue-100 text-blue-700 border-blue-200",
  };
  const labels = { super_admin: "Super Admin", admin: "Admin", manager: "Manager", employee: "Employee" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[role] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {labels[role] || role}
    </span>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status, checkInTime, checkOutTime }) {
  const isIn = status === "Checked In";
  const fmt = (t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full w-fit ${isIn ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isIn ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
        {status || "Offline"}
      </span>
      {checkInTime && <span className="text-[10px] text-slate-400 pl-1">In: {fmt(checkInTime)}</span>}
      {checkOutTime && <span className="text-[10px] text-slate-400 pl-1">Out: {fmt(checkOutTime)}</span>}
    </div>
  );
}

// ── Skeleton Row ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-4">
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
        Page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button key={i} onClick={() => onChange(i + 1)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${page === i + 1 ? "bg-blue-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}>
            {i + 1}
          </button>
        ))}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronRightIcon className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ──────────────────────────────────────────────────
function DeleteModal({ user, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[fadeInUp_0.18s_ease-out]">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <XMarkIcon className="w-5 h-5 text-slate-400" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Delete User</h2>
            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to delete <span className="font-semibold text-slate-800">{user?.name}</span>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button onClick={onCancel}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 h-10 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : <TrashIcon className="w-4 h-4" />}
              {loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reset Password Modal ───────────────────────────────────────────────────────
function ResetPasswordModal({ user, onConfirm, onCancel, loading }) {
  const [pw, setPw] = useState("");
  const [reveal, setReveal] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[fadeInUp_0.18s_ease-out]">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100">
          <XMarkIcon className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
              <KeyIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Reset Password</h2>
              <p className="text-xs text-slate-400">For <span className="font-semibold">{user?.name}</span></p>
            </div>
          </div>

          <div className="relative">
            <input
              type={reveal ? "text" : "password"}
              placeholder="New password (min 6 characters)"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full h-10 pr-16 pl-3 rounded-xl text-sm border border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 outline-none transition-all"
            />
            <button type="button" onClick={() => setReveal(!reveal)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
              {reveal ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => pw.length >= 6 && onConfirm(pw)} disabled={loading || pw.length < 6}
              className="flex-1 h-10 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? "Saving…" : "Reset Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 3-dot Action Dropdown ─────────────────────────────────────────────────────
function ActionMenu({ user, onView, onEdit, onResetPassword, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const item = (icon, label, onClick, danger = false) => (
    <button
      onClick={() => { onClick(); setOpen(false); }}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left
        ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
    >
      {React.cloneElement(icon, { className: `w-4 h-4 ${danger ? "text-red-500" : "text-slate-400"}` })}
      {label}
    </button>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className={`p-1.5 rounded-lg transition-colors ${open ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
        title="Actions"
      >
        <EllipsisVerticalIcon className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1 animate-[fadeInDown_0.12s_ease-out]">
          {item(<EyeIcon />, "View Profile", onView)}
          {item(<PencilSquareIcon />, "Edit User", onEdit)}
          <div className="my-1 border-t border-slate-100" />
          {item(<KeyIcon />, "Reset Password", onResetPassword)}
          {item(<TrashIcon />, "Delete", onDelete, true)}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const COLS = ["User", "Email", "Role", "Salary", "Status", "Location", "Actions"];

export function Users() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading, error } = useSelector((s) => s.users);

  const [role, setRole] = useState("employee");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUsersByRole(role));
    setPage(1); setSearch(""); setStatusFilter("all");
  }, [dispatch, role]);

  const filtered = useMemo(() => {
    return (list || []).filter((u) => {
      const matchSearch = !search ||
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

  // Handlers
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    const res = await dispatch(deleteUser(deleteTarget._id));
    setActionLoading(false);
    setDeleteTarget(null);
    if (res.meta.requestStatus === "fulfilled") toast.success(`${deleteTarget.name} deleted`);
    else toast.error(res.payload || "Delete failed");
  }, [dispatch, deleteTarget]);

  const handleResetPassword = useCallback(async (pw) => {
    if (!resetTarget) return;
    setActionLoading(true);
    const res = await dispatch(resetUserPassword({ id: resetTarget._id, newPassword: pw }));
    setActionLoading(false);
    setResetTarget(null);
    if (res.meta.requestStatus === "fulfilled") toast.success("Password reset successfully");
    else toast.error(res.payload || "Reset failed");
  }, [dispatch, resetTarget]);

  return (
    <div className="mt-10 mb-8 flex flex-col gap-8">

      {/* Modals */}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          loading={actionLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          loading={actionLoading}
          onConfirm={handleResetPassword}
          onCancel={() => setResetTarget(null)}
        />
      )}

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            {role === "employee" ? "Employees" : "Admins"}
            <span className="ml-2 text-sm font-normal text-slate-400">({filtered.length})</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage and monitor {role === "employee" ? "employee" : "admin"} accounts</p>
        </div>
        <Link to="/dashboard/create-user"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <PlusIcon className="w-4 h-4" />
          Create User
        </Link>
      </div>

      {/* ── Main Card ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100">
          {/* Tab Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
            {[
              { val: "employee", label: "Employees", Icon: UsersIcon, active: "text-blue-700" },
              { val: "admin", label: "Admins", Icon: ShieldCheckIcon, active: "text-violet-700" },
            ].map(({ val, label, Icon, active }) => (
              <button key={val} onClick={() => setRole(val)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${role === val ? `bg-white ${active} shadow-sm` : "text-slate-500 hover:text-slate-700"}`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs ml-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search name or email..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 transition-all" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 pl-3 pr-8 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 appearance-none cursor-pointer transition-all">
              <option value="all">All Status</option>
              <option value="in">Checked In</option>
              <option value="out">Checked Out</option>
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {COLS.map((col) => (
                  <th key={col} className={`px-4 py-3 text-left ${col === "Actions" ? "text-right pr-5" : ""}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{col}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

              {!loading && error && (
                <tr><td colSpan={7} className="px-5 py-12 text-center">
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                </td></tr>
              )}

              {!loading && !error && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">No users found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                  </div>
                </td></tr>
              )}

              {!loading && paginated.map((u) => (
                <tr key={u._id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors duration-100 group">

                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={u.name} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[130px]">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">#{u._id?.slice(-6)}</p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-600 truncate max-w-[180px]" title={u.email}>{u.email}</p>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>

                  {/* Salary */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-slate-700">₹{(u.salary || 0).toLocaleString("en-IN")}</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={u.status} checkInTime={u.checkInTime} checkOutTime={u.checkOutTime} />
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3">
                    {u.location?.lat ? (
                      <div className="flex items-start gap-1.5">
                        <MapPinIcon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-600">
                            {u.location.lat.toFixed(4)}, {u.location.lng.toFixed(4)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate max-w-[90px]" title={u.deviceId}>
                            {u.deviceId ? u.deviceId.slice(0, 12) + "…" : "No device"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>

                  {/* Actions — 3-dot menu */}
                  <td className="px-4 py-3 text-right pr-4">
                    <ActionMenu
                      user={u}
                      onView={() => navigate(`/dashboard/employee/${u._id}`)}
                      onEdit={() => navigate(`/dashboard/edit-user/${u._id}`)}
                      onResetPassword={() => setResetTarget(u)}
                      onDelete={() => setDeleteTarget(u)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>

      {/* Admin Map */}
      <AdminMap />
    </div>
  );
}

export default Users;

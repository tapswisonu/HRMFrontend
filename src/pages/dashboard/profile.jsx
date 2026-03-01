import React from "react";
import { useSelector } from "react-redux";
import {
  UserIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { PencilSquareIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// ── Avatar Initials ────────────────────────────────────────────────────────────
const COLORS = [
  "bg-blue-100 text-brand-primary",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-brand-danger",
];
function Avatar({ name }) {
  const initials = name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
  const color = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
  return (
    <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center text-4xl font-black shrink-0 ${color} border-4 border-white shadow-lg`}>
      {initials}
    </div>
  );
}

// ── Detail Row ─────────────────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-brand-border last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-xl">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100/50">
        <Icon className="h-5 w-5 text-brand-primary" />
      </div>
      <div className="flex flex-1 items-center justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-800 text-right truncate">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

// ── Stats Box ──────────────────────────────────────────────────────────────────
function QuickStat({ label, value, colorClass }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-brand-border hover:shadow-sm transition-shadow">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-black ${colorClass}`}>{value}</p>
    </div>
  );
}

export function Profile() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="mt-8 mb-24 flex flex-col gap-6 max-w-[1000px] mx-auto pb-10">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal details and account settings"
        actionNode={
          <div className="flex items-center gap-3">
            <Button variant="outline" icon={<Cog6ToothIcon />}>
              Settings
            </Button>
            <Button variant="primary" icon={<PencilSquareIcon />}>
              Edit Profile
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

        {/* ── Left Column: Identity Card ────────────────────────────────────── */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <Card className="flex flex-col items-center text-center pt-8 pb-8">
            <Avatar name={user?.name || "User Name"} />

            <div className="mt-6 flex flex-col items-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                {user?.name || "User Name"}
                <CheckBadgeIcon className="w-6 h-6 text-brand-success" />
              </h2>
              <p className="text-sm font-bold text-slate-500 mt-1">{user?.email || "user@company.com"}</p>

              <div className="mt-4">
                <Badge variant={user?.role === "admin" ? "warning" : "primary"} className="px-4 py-1.5 text-xs">
                  {user?.role || "Employee"}
                </Badge>
              </div>
            </div>

            <div className="mt-8 w-full border-t border-brand-border pt-6 grid grid-cols-2 gap-4 px-6">
              <QuickStat label="Status" value="Active" colorClass="text-brand-success" />
              <QuickStat label="Since" value={new Date(user?.createdAt || Date.now()).getFullYear()} colorClass="text-slate-800" />
            </div>
          </Card>
        </div>

        {/* ── Right Column: Info & Details ──────────────────────────────────── */}
        <div className="md:col-span-2 flex flex-col gap-6">

          <Card>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-brand-border pb-3 mb-2">
              General Information
            </h3>

            <div className="flex flex-col">
              <DetailRow icon={UserIcon} label="Full Name" value={user?.name} />
              <DetailRow icon={EnvelopeIcon} label="Email Address" value={user?.email} />
              <DetailRow icon={BriefcaseIcon} label="System Role" value={<span className="capitalize">{user?.role}</span>} />
              <DetailRow
                icon={IdentificationIcon}
                label="Employee ID"
                value={user?._id ? <span className="font-mono text-xs">{user._id.substring(0, 10).toUpperCase()}</span> : "—"}
              />
            </div>
          </Card>

          {/* Optional: Add a subtle placeholder for more info */}
          <Card className="bg-gradient-to-br from-brand-bg to-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <CalendarDaysIcon className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">Attendance Overview</p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5 tracking-wide">View your complete log on the Dashboard.</p>
              </div>
            </div>
          </Card>

        </div>
      </div>

    </div>
  );
}

export default Profile;

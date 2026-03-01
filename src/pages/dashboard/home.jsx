import React, { useEffect, useState } from "react";
import {
  ArrowUpIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";

import {
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon,
  BanknotesIcon,
  BellIcon,
} from "@heroicons/react/24/solid";
import { useSelector } from "react-redux";
import axios from "axios";
import { format } from "date-fns";
import { chartsConfig } from "@/configs";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// ─── Section Header Helper ──────────────────────────────────────────────────
function SectionHeader({ label, description }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
        {label}
      </h2>
      {description && (
        <p className="text-xs font-semibold text-slate-400 mt-0.5">{description}</p>
      )}
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <Card className="animate-pulse shadow-sm flex flex-row items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-slate-100" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 w-24 bg-slate-100 rounded" />
        <div className="h-7 w-16 bg-slate-200 rounded" />
      </div>
    </Card>
  );
}

// ─── Activity Badge ──────────────────────────────────────────────────────────
function ActivityItem({ name, time, isLast }) {
  return (
    <div className={`relative flex items-start gap-3 py-3 ${!isLast ? "border-b border-brand-border" : ""}`}>
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 shrink-0 mt-0.5">
        <BellIcon className="w-4 h-4 text-brand-success" />
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">
          {name} <span className="font-medium text-slate-400">checked in</span>
        </p>
        <span className="text-[11px] font-semibold text-slate-400 mt-0.5">{time}</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function Home() {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(
          "http://localhost:8000/api/admin/dashboard-stats",
          config
        );
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  // ── Cards ──────────────────────────────────────────────────────────────────
  const cardsData = [
    {
      accentColor: "blue",
      icon: <UsersIcon />,
      title: "Total Employees",
      value: stats?.cards?.totalEmployees ?? 0,
      footer: (
        <p className="text-xs font-semibold text-slate-400">
          <span className="font-bold text-brand-primary">
            {stats?.cards?.totalEmployees ?? 0}
          </span>{" "}
          Registered Staff
        </p>
      ),
    },
    {
      accentColor: "indigo",
      icon: <UserPlusIcon />,
      title: "Total Admins",
      value: stats?.cards?.totalAdmins ?? 0,
      footer: (
        <p className="text-xs font-semibold text-slate-400">
          <span className="font-bold text-indigo-600">
            {stats?.cards?.totalAdmins ?? 0}
          </span>{" "}
          System Admins
        </p>
      ),
    },
    {
      accentColor: "green",
      icon: <ChartBarIcon />,
      title: "Today's Presence",
      value: stats?.cards?.presenceToday ?? 0,
      footer: (
        <p className="text-xs font-semibold text-slate-400">
          <span className="inline-flex items-center gap-1 font-bold text-brand-success">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-success" />
            Active
          </span>{" "}
          Checked-in Today
        </p>
      ),
    },
    {
      accentColor: "amber",
      icon: <BanknotesIcon />,
      title: "Active Projects",
      value: "8",
      footer: (
        <p className="text-xs font-semibold text-slate-400">
          <span className="font-bold text-amber-600">+1</span> new this week
        </p>
      ),
    },
  ];

  // ── Charts ─────────────────────────────────────────────────────────────────
  const attendanceChart = {
    type: "bar",
    height: 200,
    series: [
      {
        name: "Check-ins",
        data: stats?.charts?.attendanceTrends?.map((d) => d.count) || [],
      },
    ],
    options: {
      ...chartsConfig,
      colors: ["#2563EB"],
      plotOptions: {
        bar: { columnWidth: "40%", borderRadius: 4 },
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories:
          stats?.charts?.attendanceTrends?.map((d) => d.day) || [],
      },
      grid: { show: true, borderColor: "#E2E8F0", strokeDashArray: 4 },
    },
  };

  const joinersChart = {
    type: "line",
    height: 200,
    series: [
      {
        name: "New Joiners",
        data: stats?.charts?.newJoiners?.map((d) => d.count) || [],
      },
    ],
    options: {
      ...chartsConfig,
      colors: ["#10B981"],
      stroke: { lineCap: "round", curve: "smooth", width: 3 },
      markers: { size: 5, strokeWidth: 2, strokeColors: "#ffffff" },
      xaxis: {
        ...chartsConfig.xaxis,
        categories:
          stats?.charts?.newJoiners?.map((d) => d.month) || [],
      },
      grid: { show: true, borderColor: "#E2E8F0", strokeDashArray: 4 },
    },
  };

  const chartsData = [
    {
      title: "Attendance Trends",
      description: "Daily check-ins · Last 7 days",
      footer: "Updated just now",
      chart: attendanceChart,
    },
    {
      title: "New Joiners",
      description: "Monthly recruitment · This year",
      footer: "Updated just now",
      chart: joinersChart,
    },
  ];

  const today = format(new Date(), "EEEE, dd MMMM yyyy");

  if (loading) {
    return (
      <div className="mt-8 max-w-[1200px] mx-auto pb-10">
        <div className="mb-8">
          <div className="animate-pulse h-8 w-64 bg-slate-100 rounded mb-2" />
          <div className="animate-pulse h-4 w-40 bg-slate-50 rounded" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-10">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-24 max-w-[1200px] mx-auto pb-10">

      {/* ── Welcome Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Welcome back, Admin 👋"
        subtitle={today}
        actionNode={
          <span className="hidden md:flex items-center gap-1.5 text-xs font-bold text-brand-success bg-green-50 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success inline-block" />
            System Online
          </span>
        }
      />

      {/* ── Overview Cards ──────────────────────────────────────────────── */}
      <SectionHeader label="Overview" description="Key metrics at a glance" />
      <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cardsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={icon}
            footer={footer}
          />
        ))}
      </div>

      {/* ── Analytics Charts ─────────────────────────────────────────────── */}
      <SectionHeader label="Analytics" description="Workforce insights & trends" />
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {chartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <p className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                <ClockIcon className="h-3.5 w-3.5" />
                {props.footer}
              </p>
            }
          />
        ))}
      </div>

      {/* ── Recent Activity ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card noPadding>
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-bg m-0">
            <div>
              <p className="text-sm font-bold text-slate-800">Recent Activity</p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                <ArrowUpIcon className="h-3 w-3 text-brand-success" />
                Latest check-ins
              </p>
            </div>
            <Badge variant="success">Live</Badge>
          </div>

          <div className="px-6 py-2 overflow-y-auto max-h-72">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((activity, key) => (
                <ActivityItem
                  key={key}
                  name={activity.employee?.name || "Unknown User"}
                  time={activity.checkInTime ? format(new Date(activity.checkInTime), "dd MMM, hh:mm a") : (activity.date ? format(new Date(activity.date), "dd MMM, yyyy") : "No Time Recorded")}
                  isLast={key === stats.recentActivity.length - 1}
                />
              ))
            ) : (
              <div className="py-10 text-center text-xs font-semibold text-slate-400">
                No recent activity
              </div>
            )}
          </div>
        </Card>
      </div>

    </div>
  );
}

export default Home;

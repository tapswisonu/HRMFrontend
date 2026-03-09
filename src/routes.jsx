import {
  HomeIcon,
  UserGroupIcon,
  UserPlusIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/solid";

import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";

import { Home, CalendarPage } from "@/pages/dashboard";

import Users from "./features/users/pages/Users";
import Profile from "./features/users/pages/Profile";
import CreateUser from "./features/users/pages/CreateUser";

import HolidayRequests from "./features/holiday/pages/HolidayRequests";

import Attendance from "./features/attendance/pages/Attendance";
import AttendanceRequests from "./features/attendance/pages/AttendanceRequests";

import EmployeeDashboard from "@/pages/employee/employeeDashboard";
import TrackingSettings from "@/pages/dashboard/trackingSettings";
import { Salary } from "./features/payroll/pages/Salary";
import AttendanceSalary from "./features/payroll/pages/AttendanceSalary";
import SalaryReport from "./features/payroll/pages/SalaryReport";

// RBAC helpers — only admin and employee are supported
import { isAdminOrAbove } from "@/utils/rbac";

const icon = { className: "w-5 h-5 text-inherit" };

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES BY ROLE — only "admin" and "employee" are supported
// ─────────────────────────────────────────────────────────────────────────────
export const getRoutesByRole = (role) => {
  const routes = [];
  const isAdmin = isAdminOrAbove(role);

  // ⭐ DASHBOARD — all roles
  routes.push({
    title: "🏠 Dashboard",
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Dashboard",
        path: "/home",
        element: isAdmin ? <Home /> : <EmployeeDashboard />,
      },
    ],
  });

  // ⭐ WORKFORCE — admin only
  if (isAdmin) {
    routes.push({
      title: "👥 Workforce",
      layout: "dashboard",
      pages: [
        {
          icon: <UserGroupIcon {...icon} />,
          name: "Employees",
          path: "/users",
          element: <Users />,
        },
        {
          icon: <UserPlusIcon {...icon} />,
          name: "Create User",
          path: "/create-user",
          element: <CreateUser />,
        },
      ],
    });
  }

  // ⭐ ATTENDANCE
  if (isAdmin) {
    routes.push({
      title: "🕒 Attendance",
      layout: "dashboard",
      pages: [
        {
          icon: <ClockIcon {...icon} />,
          name: "Daily Attendance",
          path: "/attendance/daily",
          element: <Attendance />,
        },
        {
          icon: <DocumentCheckIcon {...icon} />,
          name: "Attendance Requests",
          path: "/attendance/requests",
          element: <AttendanceRequests />,
        },
        {
          icon: <CalendarIcon {...icon} />,
          name: "Holiday Requests",
          path: "/attendance/holidays",
          element: <HolidayRequests />,
        },
      ],
    });
  } else {
    // Employee: only their own holiday requests
    routes.push({
      title: "🕒 Attendance",
      layout: "dashboard",
      pages: [
        {
          icon: <DocumentCheckIcon {...icon} />,
          name: "My Holiday Requests",
          path: "/holiday-requests",
          element: <HolidayRequests />,
        },
      ],
    });
  }

  // ⭐ PAYROLL — admin only
  if (isAdmin) {
    routes.push({
      title: "💰 Payroll",
      layout: "dashboard",
      pages: [
        {
          icon: <CurrencyDollarIcon {...icon} />,
          name: "Salary Setup",
          path: "/payroll/setup",
          element: <Salary />,
        },
        {
          icon: <CalculatorIcon {...icon} />,
          name: "Calculate Payroll",
          path: "/payroll/calculate",
          element: <AttendanceSalary />,
        },
        {
          icon: <ChartBarIcon {...icon} />,
          name: "Salary Reports",
          path: "/payroll/reports",
          element: <SalaryReport />,
        },
      ],
    });
  }

  // ⭐ TRACKING — admin only
  if (isAdmin) {
    routes.push({
      title: "📍 Tracking",
      layout: "dashboard",
      pages: [
        {
          icon: <ShieldCheckIcon {...icon} />,
          name: "Location & Device",
          path: "/tracking/location",
          element: <TrackingSettings />,
        },
      ],
    });
  }

  // ⭐ CALENDAR — all roles
  routes.push({
    title: "📅 Calendar",
    layout: "dashboard",
    pages: [
      {
        icon: <CalendarIcon {...icon} />,
        name: "Calendar",
        path: "/calendar",
        element: <CalendarPage />,
      },
    ],
  });

  // ⭐ HIDDEN — profile page (all roles, not shown in sidebar)
  routes.push({
    title: "Hidden",
    layout: "dashboard",
    pages: [
      { path: "/profile", element: <Profile /> },
    ],
  });

  // ⭐ AUTH ROUTES
  routes.push({
    layout: "auth",
    pages: [
      { path: "/sign-in", element: <Login /> },
      { path: "/sign-up", element: <Register /> },
    ],
  });

  return routes;
};

export default getRoutesByRole;

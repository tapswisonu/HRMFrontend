import {
  HomeIcon,
  UserCircleIcon,
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

import { SignIn, SignUp } from "@/pages/auth";

import { Home, Profile, Tables, Notifications, Users, Salary, CalendarPage, Attendance, AttendanceSalary, AttendanceRequests, HolidayRequests } from "@/pages/dashboard";

import CreateUser from "@/pages/createUser/createUser";
import EmployeeDashboard from "@/pages/employee/employeeDashboard";
import TrackingSettings from "@/pages/dashboard/trackingSettings";
import SalaryReport from "@/pages/dashboard/salaryReport";
import PayrollManagement from "@/pages/dashboard/payrollManagement";
import AttendanceManagement from "@/pages/dashboard/attendanceManagement";



const icon = {
  className: "w-5 h-5 text-inherit",
};

// =====================================================
// ⭐ GET ROUTES BASED ON USER ROLE
// =====================================================
export const getRoutesByRole = (role) => {
  const routes = [];

  // ⭐ DASHBOARD Group
  if (role !== "employee") {
    routes.push({
      title: "Dashboard",
      layout: "dashboard",
      pages: [
        {
          icon: <HomeIcon {...icon} />,
          name: "Dashboard",
          path: "/home",
          element: <Home />,
        }
      ]
    });
  } else {
    routes.push({
      title: "Dashboard",
      layout: "dashboard",
      pages: [
        {
          icon: <ChartBarIcon {...icon} />,
          name: "My Dashboard",
          path: "/employeeDashboard",
          element: <EmployeeDashboard />,
        }
      ]
    });
  }

  // ⭐ ATTENDANCE Group
  if (role !== "employee") {
    routes.push({
      title: "Attendance",
      layout: "dashboard",
      pages: [
        {
          icon: <ClockIcon {...icon} />,
          name: "Attendance Management",
          path: "/attendance-management",
          element: <AttendanceManagement />,
        }
      ]
    });
  } else {
    // Employee Attendance Group
    routes.push({
      title: "Attendance",
      layout: "dashboard",
      pages: [
        {
          icon: <DocumentCheckIcon {...icon} />,
          name: "My Holiday Requests",
          path: "/holiday-requests",
          element: <HolidayRequests />,
        }
      ]
    });
  }

  // ⭐ PAYROLL Group
  if (role !== "employee") {
    routes.push({
      title: "Payroll",
      layout: "dashboard",
      pages: [
        {
          icon: <CurrencyDollarIcon {...icon} />,
          name: "Payroll Management",
          path: "/payroll-management",
          element: <PayrollManagement />,
        }
      ]
    });
  }

  // ⭐ TRACKING Group
  if (role !== "employee") {
    routes.push({
      title: "Tracking",
      layout: "dashboard",
      pages: [
        {
          icon: <ShieldCheckIcon {...icon} />,
          name: "Location & Device",
          path: "/tracking-settings",
          element: <TrackingSettings />,
        }
      ]
    });
  }

  // ⭐ CALENDAR Group
  routes.push({
    title: "Calendar",
    layout: "dashboard",
    pages: [
      {
        icon: <CalendarIcon {...icon} />,
        name: "Calendar",
        path: "/calendar",
        element: <CalendarPage />,
      }
    ]
  });

  // ⭐ USER MANAGEMENT Group
  if (role === "admin" || role === "manager") {
    const userPages = [
      {
        icon: <UserGroupIcon {...icon} />,
        name: "Users",
        path: "/users",
        element: <Users />,
      }
    ];
    if (role === "admin") {
      userPages.push({
        icon: <UserPlusIcon {...icon} />,
        name: "Create User",
        path: "/create-user",
        element: <CreateUser />,
      });
    }
    routes.push({
      title: "User Management",
      layout: "dashboard",
      pages: userPages
    });
  }

  routes.push({
    title: "Hidden",
    layout: "dashboard",
    pages: [
      {
        path: "/profile",
        element: <Profile />,
      }
    ]
  });

  // Auth pages logic (hidden from sidebar but needed in router)
  routes.push({
    layout: "auth",
    pages: [
      {
        path: "/sign-in",
        element: <SignIn />,
      }
    ]
  });

  return routes;
};

export default getRoutesByRole;

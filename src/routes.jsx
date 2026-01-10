

import {
  HomeIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserPlusIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";

import { SignIn, SignUp } from "@/pages/auth";

import { Home, Profile, Tables, Notifications, Users, Salary, CalendarPage, Attendance } from "@/pages/dashboard";

import CreateUser from "@/pages/createUser/createUser";
import EmployeeDashboard from "@/pages/employee/employeeDashboard";



const icon = {
  className: "w-5 h-5 text-inherit",
};

// =====================================================
// ⭐ GET ROUTES BASED ON USER ROLE
// =====================================================
export const getRoutesByRole = (role) => {
  // ROUTES visible for ALL (admin + manager + employee)
  const baseRoutes = [
    {
      icon: <UserCircleIcon {...icon} />,
      name: "Profile",
      path: "/profile",
      element: <Profile />,
    },

  ];

  // ⭐ DASHBOARD (HOME) - visible for Admin & Manager ONLY
  if (role !== "employee") {
    baseRoutes.unshift({
      icon: <HomeIcon {...icon} />,
      name: "Dashboard",
      path: "/home",
      element: <Home />,
    });
  }

  // ⭐ ADMIN ONLY ROUTES
  const adminRoutes = [
    {
      icon: <UserGroupIcon {...icon} />,
      name: "Users",
      path: "/users",
      element: <Users />,
    },
    {
      icon: <UserPlusIcon {...icon} />,
      name: "Create User",
      path: "/create-user",
      element: <CreateUser />,
    },

    {
      icon: <ClockIcon {...icon} />,
      name: "Attendance",
      path: "/attendance",
      element: <Attendance />,
    },
    {
      icon: <CurrencyDollarIcon {...icon} />,
      name: "Salary",
      path: "/salary",
      element: <Salary />,
    },
    {
      icon: <CalendarIcon {...icon} />,
      name: "Calendar",
      path: "/calendar",
      element: <CalendarPage />,
    },
  ];

  // ⭐ If admin logged in → include admin routes
  if (role === "admin") {
    baseRoutes.push(...adminRoutes);
  }

  // ⭐ employee ONLY ROUTES
  const employeeRoutes = [
    {
      icon: <ChartBarIcon {...icon} />,
      name: "employeeDashboard",
      path: "/employeeDashboard",
      element: <EmployeeDashboard />,
    },
    {
      icon: <CalendarIcon {...icon} />,
      name: "Calendar",
      path: "/calendar",
      element: <CalendarPage />,
    },
  ];

  // ⭐ If employee logged in → include employee routes
  if (role === "employee") {
    baseRoutes.push(...employeeRoutes);
  }

  // ⭐ If Manager logged in → optional permissions
  // Example: allow managers to see user list but not create user
  if (role === "manager") {
    baseRoutes.push({
      icon: <UserGroupIcon {...icon} />,
      name: "Users",
      path: "/users",
      element: <Users />,
    });
  }

  // =====================================================
  // RETURN FINAL ROUTE STRUCTURE
  // =====================================================
  return [
    {
      layout: "dashboard",
      pages: baseRoutes,
    },

    {
      // title: "Auth Pages",
      layout: "auth",
      pages: [
        {
          icon: <UserCircleIcon {...icon} />,
          name: "Sign In",
          path: "/sign-in",
          element: <SignIn />,
        },
        // {
        //   icon: <RectangleStackIcon {...icon} />,
        //   name: "Sign Up",
        //   path: "/sign-up",
        //   element: <SignUp />,
        // },

      ],
    },
  ];
};

export default getRoutesByRole;

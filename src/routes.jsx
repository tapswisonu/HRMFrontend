

import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,

} from "@heroicons/react/24/solid";

import { SignIn, SignUp } from "@/pages/auth";

import { Home, Profile, Tables, Notifications, Users, Attendance } from "@/pages/dashboard";

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
      icon: <TableCellsIcon {...icon} />,
      name: "Users",
      path: "/users",
      element: <Users />,
    },
    {
      icon: <TableCellsIcon {...icon} />,
      name: "Create User",
      path: "/create-user",
      element: <CreateUser />,
    },

    {
      icon: <TableCellsIcon {...icon} />,
      name: "Attendance",
      path: "/attendance",
      element: <Attendance />,
    },
  ];

  // ⭐ If admin logged in → include admin routes
  if (role === "admin") {
    baseRoutes.push(...adminRoutes);
  }

  // ⭐ employee ONLY ROUTES
  const employeeRoutes = [
    {
      icon: <TableCellsIcon {...icon} />,
      name: "employeeDashboard",
      path: "/employeeDashboard",
      element: <EmployeeDashboard />,
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
      icon: <TableCellsIcon {...icon} />,
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
          icon: <ServerStackIcon {...icon} />,
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

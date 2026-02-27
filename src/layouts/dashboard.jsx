
import { Routes, Route } from "react-router-dom";


import {
  Sidenav,
  DashboardNavbar,
} from "@/widgets/layout";

import { useMaterialTailwindController, setOpenSidenav } from "@/context";

// ⭐ NEW IMPORTS
import { useSelector } from "react-redux";
import { getRoutesByRole } from "@/routes";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType, openSidenav } = controller;

  // ⭐ 1) Get logged-in user role from Redux
  const role = useSelector((state) => state.auth.user?.role);

  // ⭐ 2) Generate routes based on the role
  const routes = getRoutesByRole(role || "employee");

  return (
    <div className="min-h-screen bg-blue-gray-50/50">

      {/* ⭐ Sidebar receives dynamic routes - FILTERED to only show dashboard layout */}
      <Sidenav
        routes={routes.filter(r => r.layout === "dashboard")}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />

      {/* Overlay for mobile sidenav */}
      {openSidenav && (
        <div
          className="fixed inset-0 z-40 bg-black/50 xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        />
      )}

      <div className="p-4 xl:ml-80">
        <DashboardNavbar />



        {/* ⭐ Page routes rendered dynamically */}
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }, idx) => (
                <Route key={idx} path={path} element={element} />
              ))
          )}
        </Routes>

       
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;

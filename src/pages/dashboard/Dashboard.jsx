import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Sidenav, DashboardNavbar, Configurator } from "@/widgets/layout";
import routes from "@/routes";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav routes={routes} />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />

        {/* All Child Dashboard Pages */}
        <div className="mt-6">
          <Routes>
            {routes
              .filter((r) => r.layout === "dashboard")[0]
              .pages.map(({ path, element }, i) => (
                <Route key={i} path={path} element={element} />
              ))}

            {/* fallback inside dashboard */}
            <Route path="*" element={<Navigate to="home" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

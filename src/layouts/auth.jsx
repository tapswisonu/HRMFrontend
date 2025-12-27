import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRoutesByRole } from "@/routes";

export function Auth() {
  // get logged-in user role OR default to "employee"
  const role = useSelector((state) => state.auth.user?.role) || "employee";

  // generate all routes for this role
  const routes = getRoutesByRole(role);

  // extract only auth pages
  const authRoutes = routes.find((r) => r.layout === "auth")?.pages || [];

  return (
    <div className="min-h-screen w-full">
      <Routes>
        {authRoutes.map(({ path, element }, i) => (
          <Route key={i} path={path} element={element} />
        ))}

        {/* default redirect */}
        <Route path="/*" element={<Navigate to="sign-in" replace />} />
      </Routes>
    </div>
  );
}

export default Auth;

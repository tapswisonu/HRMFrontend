import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRoutesByRole } from "@/routes";

export function Auth() {
  const token = useSelector((state) => state.auth.token);
  const role = useSelector((state) => state.auth.user?.role) || "employee";

  // ⭐ If already logged in, go straight to dashboard
  if (token) {
    return <Navigate to="/dashboard/home" replace />;
  }

  const routes = getRoutesByRole(role);
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

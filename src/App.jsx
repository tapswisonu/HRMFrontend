import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/layouts/dashboard";
import Auth from "@/layouts/auth";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // VERY IMPORTANT
function App() {
  const token = useSelector((state) => state.auth.token);

  return (
    <>
      {/* ToastContainer should be OUTSIDE Routes */}
      <ToastContainer position="top-right" autoClose={2500} />
    <Routes>
      {/* ---------- AUTH LAYOUT ---------- */}
      <Route path="/auth/*" element={<Auth />} />

      {/* ---------- DASHBOARD LAYOUT ---------- */}
      <Route
        path="/dashboard/*"
        element={token ? <Dashboard /> : <Navigate to="/auth/sign-in" replace />}
      />

      {/* ---------- DEFAULT ---------- */}
      <Route
        path="*"
        element={
          token
            ? <Navigate to="/dashboard/home" replace />
            : <Navigate to="/auth/sign-in" replace />
        }
      />
    </Routes>
    </>
  );
}

export default App;

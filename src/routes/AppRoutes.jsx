import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Dashboard from "@/layouts/dashboard";
import Auth from "@/layouts/auth";

// Prevents logged-in users from accessing protected routes without a token
const ProtectedRoute = ({ children }) => {
    const token = useSelector((state) => state.auth.token);
    if (!token) {
        return <Navigate to="/auth/sign-in" replace />;
    }
    return children;
};

const AppRoutes = () => {
    const token = useSelector((state) => state.auth.token);

    return (
        <Routes>
            {/* Auth layout already handles redirect if token exists */}
            <Route path="/auth/*" element={<Auth />} />

            <Route
                path="/dashboard/*"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            {/* Catch-all: send to dashboard if logged in, else sign-in */}
            <Route
                path="*"
                element={
                    token
                        ? <Navigate to="/dashboard/home" replace />
                        : <Navigate to="/auth/sign-in" replace />
                }
            />
        </Routes>
    );
};

export default AppRoutes;

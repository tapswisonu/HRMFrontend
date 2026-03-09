import React from "react";
import { useSelector } from "react-redux";
import { isAtLeast } from "@/utils/rbac";

/**
 * RoleGuard — conditionally renders children based on the logged-in user's role.
 *
 * Props:
 *   roles     - Array of allowed roles (e.g. ["admin", "super_admin"]). If set, uses hasRole check.
 *   minRole   - Minimum role required (e.g. "manager"). Uses hierarchy-based isAtLeast check.
 *   fallback  - Optional element to render when access is denied (defaults to null).
 *
 * Usage Examples:
 *   <RoleGuard minRole="admin">                    → admin + super_admin can see
 *   <RoleGuard roles={["super_admin"]}>            → only super_admin
 *   <RoleGuard minRole="manager" fallback={<p>No access</p>}>
 */
export function RoleGuard({ roles, minRole, fallback = null, children }) {
    const user = useSelector((s) => s.auth.user);
    const userRole = user?.role;

    if (!userRole) return fallback;

    let allowed = false;
    if (minRole) {
        allowed = isAtLeast(userRole, minRole);
    } else if (Array.isArray(roles) && roles.length > 0) {
        allowed = roles.includes(userRole);
    } else {
        // No restriction specified — always render
        allowed = true;
    }

    return allowed ? <>{children}</> : fallback ?? null;
}

export default RoleGuard;

// ─── Role Constants ────────────────────────────────────────────────────────────
export const ROLES = {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    MANAGER: "manager",
    EMPLOYEE: "employee",
};

/** Numeric level per role — higher = more privileged */
const ROLE_LEVEL = {
    super_admin: 4,
    admin: 3,
    manager: 2,
    employee: 1,
};

/**
 * Returns true if `userRole` is AT OR ABOVE `minimumRole` in the hierarchy.
 * Example: isAtLeast("admin", "manager") → true
 */
export const isAtLeast = (userRole, minimumRole) =>
    (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minimumRole] || 0);

/** True if userRole is admin or super_admin */
export const isAdminOrAbove = (userRole) => isAtLeast(userRole, ROLES.ADMIN);

/** True if userRole is manager, admin, or super_admin */
export const isManagerOrAbove = (userRole) => isAtLeast(userRole, ROLES.MANAGER);

/** True if userRole is super_admin only */
export const isSuperAdmin = (userRole) => userRole === ROLES.SUPER_ADMIN;

/**
 * Check if a user has any of the given allowed roles.
 * Example: hasRole("manager", ["admin", "manager"]) → true
 */
export const hasRole = (userRole, allowedRoles = []) =>
    Array.isArray(allowedRoles) && allowedRoles.includes(userRole);

/** Human-friendly label for a role slug */
export const roleLabel = (role) => {
    const map = {
        super_admin: "Super Admin",
        admin: "Admin",
        manager: "Manager",
        employee: "Employee",
    };
    return map[role] || role;
};

/** Returns a Tailwind color class set for display badges per role */
export const roleBadgeClass = (role) => {
    const map = {
        super_admin: "bg-purple-100 text-purple-800 border-purple-200",
        admin: "bg-blue-100 text-blue-800 border-blue-200",
        manager: "bg-green-100 text-green-800 border-green-200",
        employee: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return map[role] || "bg-slate-100 text-slate-600";
};

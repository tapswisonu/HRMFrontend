import PropTypes from "prop-types";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { logout } from "@/features/auth/authSlice";
import { useDispatch } from "react-redux";

const sidenavTypes = {
  dark: "bg-gradient-to-br from-gray-900 to-gray-800",
  white: "bg-white shadow-sm",
  transparent: "bg-transparent",
};

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType, openSidenav } = controller;
  const navigate = useNavigate();
  const reduxDispatch = useDispatch();

  const isDark = sidenavType === "dark";
  const textColor = isDark ? "text-white" : "text-blue-gray-700";
  const subTextColor = isDark ? "text-blue-gray-300" : "text-blue-gray-400";
  const borderColor = isDark ? "border-white/10" : "border-blue-gray-100";
  const hoverBg = isDark ? "hover:bg-white/10" : "hover:bg-blue-gray-50";
  const activeBg = isDark ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600";
  const activeText = isDark ? "text-white" : "text-blue-600";

  const handleLogout = () => {
    reduxDispatch(logout());
    navigate("/auth/sign-in");
  };

  return (
    <aside
      className={`
        ${sidenavTypes[sidenavType]}
        ${openSidenav ? "translate-x-0" : "-translate-x-80"}
        fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-2xl 
        transition-transform duration-300 xl:translate-x-0 
        border ${borderColor}
        flex flex-col overflow-hidden
      `}
    >
      {/* ── Brand Block ─────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b ${borderColor}`}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-sm shrink-0">
          HR
        </div>
        <div className="flex flex-col min-w-0">
          <Link to="/">
            <span className={`text-sm font-bold tracking-wide ${textColor} truncate`}>
              {brandName}
            </span>
          </Link>
          <span className={`text-[10px] ${subTextColor}`}>Admin Panel</span>
        </div>
        {/* Mobile close */}
        <IconButton
          variant="text"
          color={isDark ? "white" : "blue-gray"}
          size="sm"
          className="ml-auto xl:hidden rounded-full"
          ripple={false}
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-4 w-4" />
        </IconButton>
      </div>

      {/* ── Nav Items ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {routes.map(({ layout: routeLayout, title, pages }, key) => (
          <div key={key} className="mb-4">
            {title && (
              <p
                className={`mx-3 mb-2 mt-2 text-[10px] font-black uppercase tracking-widest ${subTextColor} opacity-80`}
              >
                {title}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {pages.map(({ icon, name, path }) => (
                <li key={name || path}>
                  <NavLink to={`/${routeLayout || "dashboard"}${path}`}>
                    {({ isActive }) => (
                      <div
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                          transition-colors duration-150 text-sm font-medium
                          ${isActive
                            ? `${activeBg} font-semibold`
                            : `${textColor} ${hoverBg}`
                          }
                        `}
                      >
                        <span
                          className={`shrink-0 [&>svg]:w-[18px] [&>svg]:h-[18px] ${isActive ? activeText : subTextColor
                            }`}
                        >
                          {icon}
                        </span>
                        <span className="truncate">{name || "Untitled"}</span>
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Logout — pinned bottom ────────────────────────────────────────── */}
      <div className={`px-3 pb-4 pt-2 border-t ${borderColor}`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors duration-150`}
        >
          <ArrowRightOnRectangleIcon className="h-[18px] w-[18px] shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo.jpg",
  brandName: "HRM System",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;

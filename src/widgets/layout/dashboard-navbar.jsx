import { useLocation, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import {
  Navbar,
  Typography,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "@/context";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const authDispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    authDispatch(logout());
    navigate("/auth/sign-in");
  };

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${fixedNavbar
        ? "sticky top-4 z-40 py-3 shadow-sm shadow-blue-gray-500/5"
        : "px-0 py-1"
        }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex items-center justify-between gap-4">

        {/* ── Left: Breadcrumb + Page Title ─────────────────────────────── */}
        <div className="capitalize min-w-0">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${fixedNavbar ? "mt-1" : ""}`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {layout}
              </Typography>
            </Link>
            <Typography variant="small" color="blue-gray" className="font-normal">
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="blue-gray" className="leading-tight">
            {page}
          </Typography>
        </div>

        {/* ── Right: Search + Actions pill ──────────────────────────────── */}
        <div className="flex items-center gap-1.5 bg-blue-gray-50/60 border border-blue-gray-100 rounded-xl px-2 py-1.5">

          {/* Search input */}
          <div className="hidden md:flex items-center gap-2 px-2">
            <MagnifyingGlassIcon className="h-4 w-4 text-blue-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm text-blue-gray-700 placeholder-blue-gray-400 w-40"
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-5 bg-blue-gray-200 mx-1" />

          {/* Mobile: hamburger */}
          <IconButton
            variant="text"
            color="blue-gray"
            size="sm"
            className="xl:hidden rounded-lg"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-5 w-5 text-blue-gray-500" />
          </IconButton>

          {/* Notifications */}
          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray" size="sm" className="rounded-lg relative">
                <BellIcon className="h-4.5 w-4.5 text-blue-gray-500" />
                {/* notification dot */}
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
              </IconButton>
            </MenuHandler>
            <MenuList className="w-max border-0 shadow-lg">
              <MenuItem className="flex items-center gap-3">
                <Avatar
                  src="https://demos.creative-tim.com/material-dashboard/assets/img/team-2.jpg"
                  alt="item-1"
                  size="sm"
                  variant="circular"
                />
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-1 font-normal">
                    <strong>New message</strong> from Laur
                  </Typography>
                  <Typography variant="small" color="blue-gray" className="flex items-center gap-1 text-xs font-normal opacity-60">
                    <ClockIcon className="h-3.5 w-3.5" /> 13 minutes ago
                  </Typography>
                </div>
              </MenuItem>
              <MenuItem className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-gray-800 to-blue-gray-900">
                  <CreditCardIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-1 font-normal">
                    Payment successfully completed
                  </Typography>
                  <Typography variant="small" color="blue-gray" className="flex items-center gap-1 text-xs font-normal opacity-60">
                    <ClockIcon className="h-3.5 w-3.5" /> 2 days ago
                  </Typography>
                </div>
              </MenuItem>
            </MenuList>
          </Menu>



          {/* Profile Dropdown */}
          <Menu placement="bottom-end">
            <MenuHandler>
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-blue-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold uppercase">
                  {user?.name?.[0] || "U"}
                </div>
                <div className="hidden xl:flex flex-col items-start pr-1">
                  <span className="text-xs font-bold text-blue-gray-800 leading-tight">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-gray-500 uppercase tracking-widest leading-none">
                    {user?.role || "Role"}
                  </span>
                </div>
              </div>
            </MenuHandler>
            <MenuList className="w-56 p-2 border-brand-border shadow-xl shadow-blue-gray-500/10 rounded-xl">
              <div className="px-3 md:hidden pb-3 mb-2 border-b border-blue-gray-50">
                <Typography variant="small" color="blue-gray" className="font-bold">
                  {user?.name || "User"}
                </Typography>
                <Typography variant="small" className="text-xs font-normal text-blue-gray-500">
                  {user?.email || "user@company.com"}
                </Typography>
              </div>

              <Link to="/dashboard/profile" className="outline-none">
                <MenuItem className="flex items-center gap-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors py-2.5">
                  <UserCircleIcon className="h-4.5 w-4.5 text-inherit" />
                  <Typography variant="small" className="font-semibold text-inherit">
                    My Profile
                  </Typography>
                </MenuItem>
              </Link>

              <hr className="my-2 border-blue-gray-100" />

              <MenuItem
                className="flex items-center gap-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors py-2.5 text-red-500"
                onClick={handleLogout}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5 text-inherit">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <Typography variant="small" className="font-semibold text-inherit">
                  Sign Out
                </Typography>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>

      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";
export default DashboardNavbar;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersByRole } from "../../features/users/userSlice";
import { Link } from "react-router-dom";
import AdminMap from "../../components/AdminMap";

import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Button,
} from "@material-tailwind/react";

import {
  HomeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";

export function Users() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((s) => s.users);

  const [role, setRole] = useState("employee");

  useEffect(() => {
    dispatch(fetchUsersByRole(role));
  }, [dispatch, role]);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card className="shadow-lg">

        {/* ======================== */}
        {/* TOP HEADER */}
        {/* ======================== */}
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center rounded-t-lg"
        >
          <Typography variant="h6" color="white">
            Users Table — {role}
          </Typography>

          <div className="flex items-center gap-4">

            {/* ==== BUTTON GROUP ==== */}
            <div className="flex bg-gray-800 rounded-lg overflow-hidden shadow-md">

              <button
                onClick={() => setRole("employee")}
                className={`px-5 py-2 flex items-center gap-2 transition-all duration-200
                  ${role === "employee"
                    ? "bg-white text-gray-900 font-semibold"
                    : "text-white hover:bg-gray-700"
                  }`}
              >
                <HomeIcon className="h-5 w-5" />
                Employees
              </button>

              <button
                onClick={() => setRole("admin")}
                className={`px-5 py-2 flex items-center gap-2 transition-all duration-200
                  ${role === "admin"
                    ? "bg-white text-gray-900 font-semibold"
                    : "text-white hover:bg-gray-700"
                  }`}
              >
                <UserCircleIcon className="h-5 w-5" />
                Admins
              </button>

            </div>

            {/* ==== CREATE USER BUTTON ==== */}
            <Link to="/dashboard/create-user">
              <Button color="blue" className="px-6 py-2 shadow-md">
                Create User
              </Button>
            </Link>

          </div>
        </CardHeader>

        {/* ======================== */}
        {/* TABLE SECTION */}
        {/* ======================== */}
        <CardBody className="overflow-x-auto px-0 pt-0 pb-4">

          {/* Loading */}
          {loading && (
            <Typography className="text-center py-4 font-medium">
              Loading...
            </Typography>
          )}

          {/* Error */}
          {error && (
            <Typography className="text-center py-4 font-medium text-red-600">
              {error}
            </Typography>
          )}

          {/* TABLE */}
          <table className="w-full min-w-[640px] table-auto rounded-lg overflow-hidden">

            <thead className="bg-gray-100">
              <tr>
                {["User", "Email", "Role", "Status", "Location", "Joined", "Action"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-500"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white">
              {list.map((u, key) => {
                const className = `py-3 px-5 ${key !== list.length - 1 ? "border-b border-blue-gray-50" : ""}`;

                return (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50 transition-all duration-150"
                  >
                    {/* USER */}
                    <td className={className}>
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={"https://ui-avatars.com/api/?background=random&name=" + u.name}
                          alt={u.name}
                          size="sm"
                          className="shadow-md rounded-md"
                          variant="rounded"
                        />
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            {u.name}
                          </Typography>
                          <Typography className="text-xs text-blue-gray-500">
                            ID: {u._id}
                          </Typography>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className={className}>
                      <Typography className="text-sm text-blue-gray-700">
                        {u.email}
                      </Typography>
                    </td>

                    {/* ROLE */}
                    <td className={className}>
                      <Chip
                        variant="filled"
                        color={u.role === "manager" ? "green" : "blue"}
                        value={u.role.toUpperCase()}
                        className="py-0.5 px-2 text-[11px] font-medium w-fit"
                      />
                    </td>

                    {/* STATUS & ATTENDANCE */}
                    <td className={className}>
                      <div>
                        <Typography className="text-xs font-semibold" color={u.status === "Checked In" ? "green" : "blue-gray"}>
                          {u.status || "Offline"}
                        </Typography>
                        {u.checkInTime && (
                          <Typography className="text-[10px] text-gray-500">
                            In: {new Date(u.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        )}
                        {u.checkOutTime && (
                          <Typography className="text-[10px] text-gray-500">
                            Out: {new Date(u.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        )}
                      </div>
                    </td>

                    {/* LOCATION */}
                    <td className={className}>
                      <div className="flex flex-col">
                        <Typography className="text-xs font-medium text-blue-gray-600">
                          {u.location?.lat ? `${u.location.lat.toFixed(4)}, ${u.location.lng.toFixed(4)}` : "N/A"}
                        </Typography>
                        <Typography className="text-[10px] text-gray-400">
                          {u.deviceId || "No Device"}
                        </Typography>
                      </div>
                    </td>

                    {/* JOINED DATE */}
                    <td className={className}>
                      <Typography className="text-sm text-blue-gray-700 font-medium">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </Typography>
                    </td>

                    {/* EDIT BUTTON */}
                    <td className={className}>
                      <Link
                        to={`/dashboard/edit-user/${u._id}`}
                        className="text-sm font-semibold text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </CardBody>
      </Card>

      {/* ======================== */}
      {/* ADMIN MAP SECTION */}
      {/* ======================== */}
      <AdminMap />
    </div>
  );
}

export default Users;

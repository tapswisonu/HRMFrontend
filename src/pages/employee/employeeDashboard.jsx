import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Avatar,
  Chip,
  Tabs,
  TabsHeader,
  Tab,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { fetchAttendance } from "../../redux/slices/attendanceSlice";
import CheckIn from "./CheckIn";

import {
  FaCalendarAlt,
  FaClock,
  FaMobileAlt,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";

import { toast } from "react-toastify";

export default function EmployeeDashboard() {
  const dispatch = useDispatch();
  const { attendanceList, loading } = useSelector((s) => s.attendance);
  const user = useSelector((s) => s.auth.user);

  const [today, setToday] = useState(null);

  useEffect(() => {
    dispatch(fetchAttendance());
  }, [dispatch]);

  useEffect(() => {
    if (attendanceList.length > 0) {
      const todayRec = attendanceList.find(
        (r) => new Date(r.date).toDateString() === new Date().toDateString()
      );
      setToday(todayRec || null);
    }
  }, [attendanceList]);

  // const handleActionComplete = (type) => {
  //   dispatch(fetchAttendance());
  //   toast.success(type === "in" ? "Checked In Successfully!" : "Checked Out Successfully!");
  // };
  const handleActionComplete = () => {
  dispatch(fetchAttendance());
};


  const statusClasses = (status) => {
    switch ((status || "").toLowerCase()) {
      case "checked in":
        return "bg-green-100 text-green-800";
      case "checked out":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      {/* Top Background Banner */}
      <div className="relative mt-8 h-64 w-full rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Main Card */}
      <Card className="mx-4 -mt-20 shadow-xl border border-blue-gray-100">
        <CardBody className="p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar
                src="/img/user.png"
                size="xl"
                className="rounded-lg shadow-md shadow-blue-gray-400/30"
              />
              <div>
                <Typography variant="h4">
                  Welcome, {user?.name}
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  Track your daily attendance and work activity
                </Typography>
              </div>
            </div>
          </div>

          {/* Check In / Check Out Section */}
          <CheckIn onActionComplete={handleActionComplete} />

          {/* Today Info Card */}
          {today && (
            <Card className="p-5 mt-6 border border-blue-gray-50 shadow-sm">
              <Typography variant="h6" className="mb-3">Today's Summary</Typography>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaClock className="text-blue-600 text-xl" />
                  <div>
                    <Typography variant="small" className="text-gray-600">Check-In</Typography>
                    <Typography className="font-semibold">
                      {today?.checkInTime ? new Date(today.checkInTime).toLocaleTimeString() : "--"}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaMobileAlt className="text-green-700 text-xl" />
                  <div>
                    <Typography variant="small" className="text-gray-600">Device</Typography>
                    <Typography className="font-semibold">{today?.deviceId || "--"}</Typography>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaMapMarkerAlt className="text-red-600 text-xl" />
                  <div>
                    <Typography variant="small" className="text-gray-600">Location</Typography>
                    <Typography className="font-semibold">
                      {today?.location?.lat
                        ? `${today.location.lat.toFixed(4)}, ${today.location.lng.toFixed(4)}`
                        : "—"}
                    </Typography>
                  </div>
                </div>

              </div>
            </Card>
          )}

          {/* Attendance Table */}
          <Card className="mt-10 border shadow-md">
            <CardHeader floated={false} className="p-4 bg-gray-50 border-b">
              <Typography variant="h6">Attendance Records</Typography>
            </CardHeader>

            <CardBody className="overflow-x-auto p-0">
              {loading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : attendanceList.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No records found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-3"><div className="flex items-center gap-2"><FaCalendarAlt /> Date</div></th>
                      <th className="p-3"><div className="flex items-center gap-2"><FaClock /> In</div></th>
                      <th className="p-3"><div className="flex items-center gap-2"><FaClock /> Out</div></th>
                      <th className="p-3"><div className="flex items-center gap-2"><FaMobileAlt /> Device</div></th>
                      <th className="p-3"><div className="flex items-center gap-2"><FaMapMarkerAlt /> Location</div></th>
                      <th className="p-3"><div className="flex items-center gap-2"><FaUser /> Status</div></th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendanceList.map((rec, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50 transition">
                        <td className="p-3">{new Date(rec.date).toLocaleDateString()}</td>
                        <td className="p-3">
                          {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "--"}
                        </td>
                        <td className="p-3">
                          {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "--"}
                        </td>
                        <td className="p-3">{rec.deviceId}</td>
                        <td className="p-3">
                          {rec.location?.lat
                            ? `${rec.location.lat.toFixed(4)}, ${rec.location.lng.toFixed(4)}`
                            : "—"}
                        </td>
                        <td className="p-3">
                          <Chip value={rec.status} size="sm" className={statusClasses(rec.status)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>

        </CardBody>
      </Card>
    </>
  );
}

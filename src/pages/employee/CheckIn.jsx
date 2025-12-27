import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  doCheckIn,
  doCheckOut,
  fetchAttendance,
  clearWarnings,
} from "../../redux/slices/attendanceSlice";

import { getDeviceId } from "../../utils/getDeviceId";
import { getLocation } from "../../utils/getLocation";

import {
  Button,
  Card,
  Typography,
  Spinner,
} from "@material-tailwind/react";

import { toast } from "react-toastify";

import {
  FaSignInAlt,
  FaSignOutAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function CheckIn({ onActionComplete }) {
  const dispatch = useDispatch();
  const attendance = useSelector((s) => s.attendance);
  const { user } = useSelector((s) => s.auth);

  const deviceId = getDeviceId();

  const todayRecord = attendance.attendanceList?.find(
    (r) => new Date(r.date).toDateString() === new Date().toDateString()
  );

  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const captureLocation = async () => {
    try {
      const loc = await getLocation();
      return loc;
    } catch (err) {
      toast.error("Unable to fetch location. Please check permissions.");
      return null;
    }
  };

  const refresh = async () => {
    await dispatch(fetchAttendance());
    if (onActionComplete) onActionComplete();
  };

  const handleCheckIn = async () => {
    if (attendance.loading) return;
    setCheckingIn(true);

    try {
      const loc = await captureLocation();
      if (!loc) {
        toast.error("Location access is required to check in.");
        setCheckingIn(false);
        return;
      }
      await dispatch(
        doCheckIn({
          deviceId,
          lat: loc?.lat,
          lng: loc?.lng,
          email: user?.email,
          userId: user?._id,
          name: user?.name,
        })
      ).unwrap();

      toast.success("Checked In Successfully!");
      if (onActionComplete) onActionComplete();

      if (onActionComplete) onActionComplete();

      await refresh();
    } catch (err) {
      toast.error(err?.message || "Check-In Failed");
    }

    setCheckingIn(false);
  };

  const handleCheckOut = async () => {
    if (attendance.loading) return;
    setCheckingOut(true);

    try {
      const loc = await captureLocation();
      if (!loc) {
        toast.error("Location access is required to check out.");
        setCheckingOut(false);
        return;
      }
      await dispatch(
        doCheckOut({
          deviceId,
          lat: loc?.lat,
          lng: loc?.lng,
          email: user?.email,
          userId: user?._id,
          name: user?.name,
        })
      ).unwrap();

      toast.success("Checked Out Successfully!");
      if (onActionComplete) onActionComplete();

      if (onActionComplete) onActionComplete();

      await refresh();
    } catch (err) {
      toast.error(err?.message || "Check-Out Failed");
    }

    setCheckingOut(false);
  };

  const alreadyCheckedIn = !!todayRecord?.checkInTime;
  const alreadyCheckedOut = !!todayRecord?.checkOutTime;

  return (
    <Card className="p-6 border border-blue-gray-50 shadow-lg rounded-xl">

      <Typography variant="h5" className="font-semibold mb-5 text-blue-gray-800">
        Attendance Actions
      </Typography>

      <div className="flex gap-4 flex-wrap">

        {/* CHECK IN BUTTON */}
        {/* <Button
          color="green"
          className="flex items-center gap-2 px-6 py-3 shadow-md"
          disabled={checkingIn || attendance.loading || alreadyCheckedIn}
          onClick={handleCheckIn}
        >
          {checkingIn ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <FaSignInAlt className="text-lg" />
          )}
          {alreadyCheckedIn ? "Checked In" : "Check In"}
        </Button> */}

        <Button
          color="green"
          className="flex items-center gap-2 px-6 py-3 shadow-md"
          disabled={
            checkingIn ||
            attendance.loading ||
            (alreadyCheckedIn && !alreadyCheckedOut)   // ❗ New logic
          }
          onClick={handleCheckIn}
        >
          {checkingIn ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <FaSignInAlt className="text-lg" />
          )}
          {alreadyCheckedIn && !alreadyCheckedOut ? "Checked In" : "Check In"}
        </Button>


        {/* CHECK OUT BUTTON */}
        <Button
          color="red"
          className="flex items-center gap-2 px-6 py-3 shadow-md"
          disabled={
            checkingOut ||
            attendance.loading ||
            !alreadyCheckedIn ||
            alreadyCheckedOut
          }
          onClick={handleCheckOut}
        >
          {checkingOut ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <FaSignOutAlt className="text-lg" />
          )}
          {alreadyCheckedOut ? "Checked Out" : "Check Out"}
        </Button>

      </div>

      {/* WARNINGS SECTION */}
      {attendance.lastActionWarnings?.length > 0 && (
        <div className="mt-5 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-800" />
            <Typography className="font-semibold text-yellow-800">
              Warnings
            </Typography>
          </div>

          <ul className="mt-2 text-yellow-900 text-sm">
            {attendance.lastActionWarnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>

          <Button
            onClick={() => dispatch(clearWarnings())}
            size="sm"
            color="amber"
            className="mt-3"
          >
            Clear
          </Button>
        </div>
      )}
    </Card>
  );
}

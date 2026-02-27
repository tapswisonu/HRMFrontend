import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  doCheckIn,
  doCheckOut,
  fetchAttendance,
  clearWarnings,
} from "../../redux/slices/attendanceSlice";
import { fetchTrackingSettings } from "../../redux/slices/trackingSlice";
import { getDeviceId } from "../../utils/getDeviceId";
import { getLocation } from "../../utils/getLocation";
import { toast } from "react-toastify";
import {
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export default function CheckIn({ onActionComplete }) {
  const dispatch = useDispatch();
  const attendance = useSelector((s) => s.attendance);
  const { user } = useSelector((s) => s.auth);
  const { settings: trackingSettings } = useSelector((s) => s.tracking);

  const deviceId = getDeviceId();

  const todayRecord = attendance.attendanceList?.find(
    (r) => new Date(r.date).toDateString() === new Date().toDateString()
  );

  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => { dispatch(fetchTrackingSettings()); }, [dispatch]);

  const alreadyCheckedIn = !!todayRecord?.checkInTime;
  const alreadyCheckedOut = !!todayRecord?.checkOutTime;

  // ── Build payload respecting tracking settings ──────────────────────────────
  const buildPayload = async (forCheckin = true) => {
    const payload = { email: user?.email, userId: user?._id, name: user?.name };

    // Device
    if (trackingSettings.deviceTracking) {
      if (!deviceId && trackingSettings.deviceMandatory) {
        toast.error("Device ID is required but could not be determined.");
        return null;
      }
      payload.deviceId = deviceId || undefined;
    }

    // Location
    if (trackingSettings.locationTracking) {
      try {
        const loc = await getLocation();
        payload.lat = loc.lat;
        payload.lng = loc.lng;
      } catch {
        if (trackingSettings.locationMandatory) {
          toast.error("Location access is required. Please enable GPS permissions.");
          return null;
        }
        // not mandatory — skip silently
      }
    }

    return payload;
  };

  const refresh = async () => {
    await dispatch(fetchAttendance());
    if (onActionComplete) onActionComplete();
  };

  const handleCheckIn = async () => {
    if (attendance.loading) return;
    setCheckingIn(true);
    try {
      const payload = await buildPayload(true);
      if (!payload) return; // validation blocked it
      await dispatch(doCheckIn(payload)).unwrap();
      toast.success("Checked In Successfully!");
      await refresh();
    } catch (err) {
      toast.error(err?.message || "Check-In Failed");
    } finally { setCheckingIn(false); }
  };

  const handleCheckOut = async () => {
    if (attendance.loading) return;
    setCheckingOut(true);
    try {
      const payload = await buildPayload(false);
      if (!payload) return;
      await dispatch(doCheckOut(payload)).unwrap();
      toast.success("Checked Out Successfully!");
      await refresh();
    } catch (err) {
      toast.error(err?.message || "Check-Out Failed");
    } finally { setCheckingOut(false); }
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Attendance Actions</h3>
          <span className="text-[11px] font-bold text-slate-400">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short" })}
          </span>
        </div>

        {/* Tracking indicators */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Badge
            variant={trackingSettings.locationTracking ? "success" : "neutral"}
            icon={<MapPinIcon className="w-3.5 h-3.5" />}
          >
            Location {trackingSettings.locationTracking ? (trackingSettings.locationMandatory ? "Mandatory" : "Enabled") : "Disabled"}
          </Badge>
          <Badge
            variant={trackingSettings.deviceTracking ? "primary" : "neutral"}
            icon={<DevicePhoneMobileIcon className="w-3.5 h-3.5" />}
          >
            Device {trackingSettings.deviceTracking ? (trackingSettings.deviceMandatory ? "Mandatory" : "Enabled") : "Disabled"}
          </Badge>
        </div>
      </div>

      <div>
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* CHECK IN */}
          <button
            onClick={handleCheckIn}
            disabled={checkingIn || attendance.loading || (alreadyCheckedIn && !alreadyCheckedOut)}
            className={`
              flex-1 h-14 flex items-center justify-center gap-2
              rounded-xl text-sm font-bold transition-all duration-200 uppercase tracking-widest
              ${alreadyCheckedIn && !alreadyCheckedOut
                ? "bg-green-50 text-brand-success border border-green-200 cursor-not-allowed"
                : "bg-brand-success text-white shadow-md shadow-brand-success/20 hover:bg-green-600 hover:-translate-y-0.5"
              }
              disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
            `}
          >
            {checkingIn ? <Spinner /> : <ArrowRightOnRectangleIcon className="w-5 h-5 font-bold" />}
            {alreadyCheckedIn && !alreadyCheckedOut ? "✓ Checked In" : "Check In"}
          </button>

          {/* CHECK OUT */}
          <button
            onClick={handleCheckOut}
            disabled={checkingOut || attendance.loading || !alreadyCheckedIn || alreadyCheckedOut}
            className={`
              flex-1 h-14 flex items-center justify-center gap-2
              rounded-xl text-sm font-bold transition-all duration-200 uppercase tracking-widest
              ${alreadyCheckedOut
                ? "bg-rose-50 text-rose-400 border border-rose-200 cursor-not-allowed"
                : !alreadyCheckedIn
                  ? "bg-slate-50 text-slate-400 border border-brand-border cursor-not-allowed"
                  : "bg-brand-danger text-white shadow-md shadow-brand-danger/20 hover:bg-red-600 hover:-translate-y-0.5"
              }
              disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
            `}
          >
            {checkingOut ? <Spinner /> : <ArrowLeftOnRectangleIcon className="w-5 h-5 font-bold" />}
            {alreadyCheckedOut ? "✓ Checked Out" : "Check Out"}
          </button>
        </div>

        {/* Warnings */}
        {attendance.lastActionWarnings?.length > 0 && (
          <div className="mt-5 flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 font-bold" />
            <div className="flex-1">
              <p className="text-xs font-black text-amber-700 tracking-widest uppercase mb-1.5">Warnings</p>
              <ul className="text-xs font-semibold text-amber-700 space-y-1">
                {attendance.lastActionWarnings.map((w, i) => (
                  <li key={i}>· {w}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => dispatch(clearWarnings())}
              className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-500 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

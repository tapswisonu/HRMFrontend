import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrackingSettings, updateTrackingSettings } from "../../features/tracking/trackingSlice";
import { toast } from "react-toastify";
import {
    MapPinIcon, DevicePhoneMobileIcon, ShieldCheckIcon,
    InformationCircleIcon, CheckIcon, ClockIcon,
    AdjustmentsHorizontalIcon, TagIcon,
} from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// ── Toggle Switch ──────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, disabled }) {
    return (
        <button type="button" role="switch" aria-checked={enabled}
            onClick={() => !disabled && onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary/20
        ${disabled ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer"}
        ${enabled ? "bg-brand-primary" : "bg-slate-200 hover:bg-slate-300"}`}
        >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0
        transition-transform duration-200 ease-in-out ${enabled ? "translate-x-5" : "translate-x-0"}`} />
        </button>
    );
}

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHeader({ children }) {
    return (
        <div className="px-6 pt-6 pb-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{children}</p>
        </div>
    );
}

// ── Setting Row (toggle) ───────────────────────────────────────────────────────
function SettingRow({ icon: Icon, iconColor, title, description, value, onChange, disabled, tag }) {
    return (
        <div className={`flex items-start justify-between gap-6 py-5 ${disabled ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/50 shadow-sm ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800">{title}</p>
                        {tag && <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200">{tag}</span>}
                    </div>
                    <p className="text-xs font-semibold text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
                </div>
            </div>
            <Toggle enabled={value} onChange={onChange} disabled={disabled} />
        </div>
    );
}

// ── Input Field ────────────────────────────────────────────────────────────────
const inputCls = "w-full h-10 px-3 rounded-xl text-sm text-slate-800 bg-white border border-slate-200 outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 hover:border-slate-300";

function InputRow({ icon: Icon, iconColor, title, description, children }) {
    return (
        <div className="flex items-start justify-between gap-6 py-5">
            <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/50 shadow-sm ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{title}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
                    <div className="mt-3">{children}</div>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function TrackingSettingsPage() {
    const dispatch = useDispatch();
    const { settings, loading, saving } = useSelector((s) => s.tracking);
    const [local, setLocal] = useState({ ...settings });
    const [deviceInput, setDeviceInput] = useState("");

    useEffect(() => { dispatch(fetchTrackingSettings()); }, [dispatch]);
    useEffect(() => { setLocal({ ...settings }); }, [settings]);

    const set = (key, value) => setLocal((p) => ({ ...p, [key]: value }));
    const setNested = (key, subKey, value) =>
        setLocal((p) => ({ ...p, [key]: { ...(p[key] || {}), [subKey]: value } }));

    const addDevice = () => {
        const id = deviceInput.trim();
        if (!id) return;
        const existing = local.allowedDeviceIds || [];
        if (!existing.includes(id)) set("allowedDeviceIds", [...existing, id]);
        setDeviceInput("");
    };
    const removeDevice = (id) =>
        set("allowedDeviceIds", (local.allowedDeviceIds || []).filter((d) => d !== id));

    const handleSave = async () => {
        const res = await dispatch(updateTrackingSettings(local));
        if (res.meta.requestStatus === "fulfilled") toast.success("Tracking settings saved!");
        else toast.error(res.payload || "Failed to save settings");
    };

    const hasChanges = JSON.stringify(local) !== JSON.stringify(settings);

    // Compute "Late after" preview label
    const lateAfterPreview = () => {
        const [h, m] = (local.officeStartTime || "09:00").split(":").map(Number);
        const grace = local.lateGraceMinutes || 0;
        const totalM = h * 60 + m + grace;
        const ph = Math.floor(totalM / 60);
        const pm = (totalM % 60).toString().padStart(2, "0");
        const ampm = ph >= 12 ? "PM" : "AM";
        return `${ph % 12 || 12}:${pm} ${ampm}`;
    };

    return (
        <div className="mt-8 mb-24 flex flex-col gap-6 max-w-[800px] mx-auto pb-10">

            <PageHeader
                title={<span className="flex items-center gap-2"><ShieldCheckIcon className="w-7 h-7 text-brand-primary" />Tracking Settings</span>}
                subtitle="Control how employee location, device, and timing rules are enforced during attendance"
            />

            {/* Info Banner */}
            <div className="flex gap-3 px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                <InformationCircleIcon className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-blue-800 leading-relaxed">
                    Changes take effect immediately for the next check-in or check-out. All thresholds are configurable — no code changes required.
                </p>
            </div>

            {/* ──────────────────────────────────────────────────────────────────── */}
            {/* SECTION 1: OFFICE TIMING                                            */}
            {/* ──────────────────────────────────────────────────────────────────── */}
            <Card noPadding>
                <SectionHeader>⏰ Office Timing</SectionHeader>
                <div className="px-6 divide-y divide-slate-100/60">
                    <InputRow
                        icon={ClockIcon} iconColor="bg-blue-50 text-blue-600"
                        title="Office Hours"
                        description="Define the official working window. Used for late detection and salary thresholds."
                    >
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Time</label>
                                <input type="time" className={inputCls} style={{ width: 130 }}
                                    value={local.officeStartTime || "09:00"}
                                    onChange={(e) => set("officeStartTime", e.target.value)} />
                            </div>
                            <span className="text-slate-300 font-bold mt-4">→</span>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">End Time</label>
                                <input type="time" className={inputCls} style={{ width: 130 }}
                                    value={local.officeEndTime || "18:00"}
                                    onChange={(e) => set("officeEndTime", e.target.value)} />
                            </div>
                        </div>
                    </InputRow>

                    <InputRow
                        icon={ClockIcon} iconColor="bg-amber-50 text-amber-600"
                        title="Late Arrival Grace Period"
                        description={`Minutes after start time before check-in is flagged as Late. Currently: Late after ${lateAfterPreview()}.`}
                    >
                        <div className="flex items-center gap-3">
                            <input type="number" min={0} max={120} className={inputCls} style={{ width: 90 }}
                                value={local.lateGraceMinutes ?? 15}
                                onChange={(e) => set("lateGraceMinutes", Math.max(0, +e.target.value))} />
                            <span className="text-xs text-slate-500 font-semibold">minutes</span>
                        </div>
                    </InputRow>
                </div>
            </Card>

            {/* ──────────────────────────────────────────────────────────────────── */}
            {/* SECTION 2: HOURS THRESHOLDS                                         */}
            {/* ──────────────────────────────────────────────────────────────────── */}
            <Card noPadding>
                <SectionHeader>📊 Hours & Day-Type Thresholds</SectionHeader>
                <div className="px-6 divide-y divide-slate-100/60">
                    <InputRow
                        icon={AdjustmentsHorizontalIcon} iconColor="bg-green-50 text-green-600"
                        title="Half Day Threshold"
                        description="Employees who work fewer than this many hours will be classified as Half Day."
                    >
                        <div className="flex items-center gap-3">
                            <input type="number" min={1} max={12} step={0.5} className={inputCls} style={{ width: 90 }}
                                value={local.halfDayThresholdHours ?? 4}
                                onChange={(e) => set("halfDayThresholdHours", Math.max(1, +e.target.value))} />
                            <span className="text-xs text-slate-500 font-semibold">hours</span>
                        </div>
                    </InputRow>

                    <InputRow
                        icon={AdjustmentsHorizontalIcon} iconColor="bg-brand-primary/10 text-brand-primary"
                        title="Full Day Threshold (Auto-Elevation)"
                        description="If an employee works this many hours or more, they are automatically promoted from Half Day to Full Day."
                    >
                        <div className="flex items-center gap-3">
                            <input type="number" min={1} max={24} step={0.5} className={inputCls} style={{ width: 90 }}
                                value={local.fullDayThresholdHours ?? 8}
                                onChange={(e) => set("fullDayThresholdHours", Math.max(1, +e.target.value))} />
                            <span className="text-xs text-slate-500 font-semibold">hours</span>
                        </div>
                    </InputRow>
                </div>

                {/* Threshold preview */}
                <div className="mx-6 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-6 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
                        <span className="text-slate-600">Under <strong>{local.halfDayThresholdHours ?? 4}h</strong> → Half Day</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                        <span className="text-slate-600"><strong>{local.halfDayThresholdHours ?? 4}h</strong>–<strong>{local.fullDayThresholdHours ?? 8}h</strong> → Half Day</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                        <span className="text-slate-600"><strong>{local.fullDayThresholdHours ?? 8}h+</strong> → Full Day ✅</span>
                    </div>
                </div>
            </Card>

            {/* ──────────────────────────────────────────────────────────────────── */}
            {/* SECTION 3: LOCATION TRACKING                                        */}
            {/* ──────────────────────────────────────────────────────────────────── */}
            <Card noPadding>
                <SectionHeader>📍 Location Tracking</SectionHeader>
                <div className="px-6 divide-y divide-slate-100/60">
                    <SettingRow icon={MapPinIcon} iconColor="bg-green-50 text-brand-success"
                        title="Enable Location Tracking"
                        description="Capture GPS coordinates when employees check in and check out."
                        value={local.locationTracking}
                        onChange={(v) => { set("locationTracking", v); if (!v) set("locationMandatory", false); }}
                    />
                    <SettingRow icon={MapPinIcon} iconColor="bg-amber-50 text-amber-600"
                        title="Location is Mandatory"
                        description="Block check-in / check-out if the employee's location cannot be determined."
                        value={local.locationMandatory}
                        onChange={(v) => set("locationMandatory", v)}
                        disabled={!local.locationTracking}
                        tag={!local.locationTracking ? "Requires tracking ON" : undefined}
                    />
                    <InputRow icon={MapPinIcon} iconColor="bg-violet-50 text-violet-600"
                        title="Office GPS Coordinates"
                        description="Center point for geofence validation. Leave blank to skip radius check."
                    >
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latitude</label>
                                <input type="number" step="0.0001" className={inputCls} style={{ width: 140 }}
                                    placeholder="e.g. 28.6139"
                                    value={local.officeLatLng?.lat || ""}
                                    onChange={(e) => setNested("officeLatLng", "lat", e.target.value ? +e.target.value : null)} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Longitude</label>
                                <input type="number" step="0.0001" className={inputCls} style={{ width: 140 }}
                                    placeholder="e.g. 77.2090"
                                    value={local.officeLatLng?.lng || ""}
                                    onChange={(e) => setNested("officeLatLng", "lng", e.target.value ? +e.target.value : null)} />
                            </div>
                        </div>
                    </InputRow>
                    <InputRow icon={MapPinIcon} iconColor="bg-rose-50 text-rose-500"
                        title="Allowed Radius"
                        description="Employees must check in within this distance from the office."
                    >
                        <div className="flex items-center gap-3">
                            <input type="number" min={10} max={50000} className={inputCls} style={{ width: 110 }}
                                value={local.locationRadiusMeters ?? 200}
                                onChange={(e) => set("locationRadiusMeters", Math.max(10, +e.target.value))} />
                            <span className="text-xs text-slate-500 font-semibold">metres</span>
                        </div>
                    </InputRow>
                </div>
            </Card>

            {/* ──────────────────────────────────────────────────────────────────── */}
            {/* SECTION 4: DEVICE TRACKING                                          */}
            {/* ──────────────────────────────────────────────────────────────────── */}
            <Card noPadding>
                <SectionHeader>📱 Device Tracking</SectionHeader>
                <div className="px-6 divide-y divide-slate-100/60">
                    <SettingRow icon={DevicePhoneMobileIcon} iconColor="bg-violet-50 text-violet-600"
                        title="Enable Device ID Tracking"
                        description="Record and verify the device used by employees during attendance."
                        value={local.deviceTracking}
                        onChange={(v) => { set("deviceTracking", v); if (!v) set("deviceMandatory", false); }}
                    />
                    <SettingRow icon={DevicePhoneMobileIcon} iconColor="bg-amber-50 text-amber-600"
                        title="Device ID is Mandatory"
                        description="Block check-in / check-out if no device ID can be identified."
                        value={local.deviceMandatory}
                        onChange={(v) => set("deviceMandatory", v)}
                        disabled={!local.deviceTracking}
                        tag={!local.deviceTracking ? "Requires tracking ON" : undefined}
                    />
                    <InputRow icon={TagIcon} iconColor="bg-slate-50 text-slate-600"
                        title="Allowed Device Whitelist"
                        description="Only these device IDs are permitted. Leave empty to allow any device."
                    >
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <input type="text" className={inputCls}
                                    placeholder="Enter device ID and press Add"
                                    value={deviceInput}
                                    onChange={(e) => setDeviceInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDevice())}
                                />
                                <button onClick={addDevice}
                                    className="h-10 px-4 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 transition-colors whitespace-nowrap">
                                    Add
                                </button>
                            </div>
                            {(local.allowedDeviceIds || []).length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {(local.allowedDeviceIds).map((id) => (
                                        <span key={id} className="flex items-center gap-1.5 text-xs font-semibold bg-violet-50 text-violet-800 border border-violet-200 rounded-full pl-3 pr-2 py-1">
                                            {id}
                                            <button onClick={() => removeDevice(id)}
                                                className="text-violet-400 hover:text-red-500 transition-colors font-bold ml-0.5">✕</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            {(local.allowedDeviceIds || []).length === 0 && (
                                <p className="text-xs text-slate-400 italic">No devices added — any device ID will be accepted.</p>
                            )}
                        </div>
                    </InputRow>
                </div>
            </Card>

            {/* ──────────────────────────────────────────────────────────────────── */}
            {/* CURRENT STATE PREVIEW                                                */}
            {/* ──────────────────────────────────────────────────────────────────── */}
            <Card>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">📋 Current State Preview</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: "Location", active: local.locationTracking },
                        { label: "Loc. Mandatory", active: local.locationMandatory },
                        { label: "Device", active: local.deviceTracking },
                        { label: "Device Mandatory", active: local.deviceMandatory },
                    ].map(({ label, active }) => (
                        <div key={label} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-colors ${active ? "bg-green-50 border-green-200 shadow-sm" : "bg-white border-brand-border"}`}>
                            <span className={`text-sm font-black tracking-widest ${active ? "text-brand-success" : "text-slate-300"}`}>{active ? "ON" : "OFF"}</span>
                            <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{label}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl border bg-blue-50 border-blue-200">
                        <span className="text-sm font-black text-blue-700">{local.officeStartTime || "09:00"}</span>
                        <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Start Time</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl border bg-blue-50 border-blue-200">
                        <span className="text-sm font-black text-blue-700">Grace: {local.lateGraceMinutes ?? 15}m</span>
                        <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Late After {lateAfterPreview()}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl border bg-amber-50 border-amber-200">
                        <span className="text-sm font-black text-amber-700">&lt; {local.halfDayThresholdHours ?? 4}h</span>
                        <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Half Day</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl border bg-green-50 border-green-200">
                        <span className="text-sm font-black text-green-700">≥ {local.fullDayThresholdHours ?? 8}h</span>
                        <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Full Day</span>
                    </div>
                </div>
            </Card>

            {/* Save */}
            <div className="flex items-center justify-end gap-4 mt-2">
                {hasChanges && (
                    <span className="text-[11px] uppercase tracking-widest text-amber-600 font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                        Unsaved changes
                    </span>
                )}
                <Button onClick={handleSave} disabled={saving || loading || !hasChanges} variant="primary" icon={<CheckIcon />}>
                    {saving ? "Saving…" : "Save Settings"}
                </Button>
            </div>
        </div>
    );
}

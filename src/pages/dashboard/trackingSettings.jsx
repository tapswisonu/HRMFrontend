import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchTrackingSettings,
    updateTrackingSettings,
} from "../../redux/slices/trackingSlice";
import { toast } from "react-toastify";
import {
    MapPinIcon,
    DevicePhoneMobileIcon,
    ShieldCheckIcon,
    InformationCircleIcon,
    CheckIcon
} from "@heroicons/react/24/outline";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// ── Toggle Switch ──────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, disabled }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => !disabled && onChange(!enabled)}
            className={`
        relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary/20
        ${disabled ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer"}
        ${enabled ? "bg-brand-primary" : "bg-slate-200 hover:bg-slate-300"}
      `}
        >
            <span className={`
        inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0
        transition-transform duration-200 ease-in-out
        ${enabled ? "translate-x-5" : "translate-x-0"}
      `} />
        </button>
    );
}

// ── Setting Row ────────────────────────────────────────────────────────────────
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
                        {tag && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                                {tag}
                            </span>
                        )}
                    </div>
                    <p className="text-xs font-semibold text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
                </div>
            </div>
            <Toggle enabled={value} onChange={onChange} disabled={disabled} />
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function TrackingSettingsPage() {
    const dispatch = useDispatch();
    const { settings, loading, saving } = useSelector((s) => s.tracking);

    const [local, setLocal] = useState({ ...settings });

    useEffect(() => { dispatch(fetchTrackingSettings()); }, [dispatch]);
    useEffect(() => { setLocal({ ...settings }); }, [settings]);

    const set = (key, value) => setLocal((p) => ({ ...p, [key]: value }));

    const handleSave = async () => {
        const res = await dispatch(updateTrackingSettings(local));
        if (res.meta.requestStatus === "fulfilled") {
            toast.success("Tracking settings saved!");
        } else {
            toast.error(res.payload || "Failed to save settings");
        }
    };

    const hasChanges = JSON.stringify(local) !== JSON.stringify(settings);

    return (
        <div className="mt-8 mb-24 flex flex-col gap-6 max-w-[800px] mx-auto pb-10">

            {/* Page Header */}
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-7 h-7 text-brand-primary" />
                        Tracking Settings
                    </span>
                }
                subtitle="Control how employee location and device data is captured during attendance"
            />

            {/* Info Banner */}
            <div className="flex gap-3 px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                <InformationCircleIcon className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-blue-800 leading-relaxed">
                    Changes take effect immediately. Employees will follow these rules on their next check-in or check-out.
                    If a field is disabled, data will not be captured or compared.
                </p>
            </div>

            {/* Settings Card */}
            <Card noPadding>

                {/* Location Section */}
                <div className="px-6 pt-6 pb-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Location Tracking</p>
                </div>
                <div className="px-6 divide-y divide-slate-100/60">
                    <SettingRow
                        icon={MapPinIcon}
                        iconColor="bg-green-50 text-brand-success"
                        title="Enable Location Tracking"
                        description="Capture GPS coordinates when employees check in and check out."
                        value={local.locationTracking}
                        onChange={(v) => {
                            set("locationTracking", v);
                            if (!v) set("locationMandatory", false);
                        }}
                    />
                    <SettingRow
                        icon={MapPinIcon}
                        iconColor="bg-amber-50 text-amber-600"
                        title="Location is Mandatory"
                        description="Block check-in / check-out if the employee's location cannot be determined."
                        value={local.locationMandatory}
                        onChange={(v) => set("locationMandatory", v)}
                        disabled={!local.locationTracking}
                        tag={!local.locationTracking ? "Requires tracking ON" : undefined}
                    />
                </div>

                <div className="border-t border-brand-border my-2" />

                {/* Device Section */}
                <div className="px-6 pt-5 pb-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Device Tracking</p>
                </div>
                <div className="px-6 divide-y divide-slate-100/60">
                    <SettingRow
                        icon={DevicePhoneMobileIcon}
                        iconColor="bg-violet-50 text-violet-600"
                        title="Enable Device ID Tracking"
                        description="Record and verify the device used by employees during attendance."
                        value={local.deviceTracking}
                        onChange={(v) => {
                            set("deviceTracking", v);
                            if (!v) set("deviceMandatory", false);
                        }}
                    />
                    <SettingRow
                        icon={DevicePhoneMobileIcon}
                        iconColor="bg-amber-50 text-amber-600"
                        title="Device ID is Mandatory"
                        description="Block check-in / check-out if no device ID can be identified."
                        value={local.deviceMandatory}
                        onChange={(v) => set("deviceMandatory", v)}
                        disabled={!local.deviceTracking}
                        tag={!local.deviceTracking ? "Requires tracking ON" : undefined}
                    />
                </div>

                {/* Current State Preview */}
                <div className="mx-6 my-6 p-5 bg-brand-bg rounded-xl border border-brand-border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Current State Preview</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-4 mt-2">
                {hasChanges && (
                    <span className="text-[11px] uppercase tracking-widest text-amber-600 font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                        Unsaved changes
                    </span>
                )}
                <Button
                    onClick={handleSave}
                    disabled={saving || loading || !hasChanges}
                    variant="primary"
                    icon={<CheckIcon />}
                >
                    {saving ? "Saving…" : "Save Settings"}
                </Button>
            </div>

        </div>
    );
}

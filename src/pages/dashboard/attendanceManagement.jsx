import React, { useState } from "react";
import { ClockIcon, DocumentCheckIcon, CalendarIcon } from "@heroicons/react/24/outline";

// Import individual pages
import Attendance from "./attendance";
import AttendanceRequests from "./attendanceRequests";
import HolidayRequests from "./holidayRequests";

export function AttendanceManagement() {
    const [activeTab, setActiveTab] = useState("daily");

    const tabs = [
        {
            id: "daily",
            label: "Daily Attendance",
            icon: <ClockIcon className="w-5 h-5" />,
            content: <Attendance />,
        },
        {
            id: "requests",
            label: "Attendance Requests",
            icon: <DocumentCheckIcon className="w-5 h-5" />,
            content: <AttendanceRequests />,
        },
        {
            id: "holidays",
            label: "Holiday Requests",
            icon: <CalendarIcon className="w-5 h-5" />,
            content: <HolidayRequests />,
        },
    ];

    return (
        <div className="flex flex-col h-full bg-brand-bg relative">
            <div className="bg-white border-b border-brand-border sticky top-0 z-30 shadow-sm">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="pt-8 pb-6">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <ClockIcon className="w-7 h-7 text-brand-primary" />
                            Attendance Management
                        </h1>
                        <p className="text-sm font-semibold text-slate-500 mt-1">
                            Monitor daily logs, process missing attendance corrections, and manage holiday requests.
                        </p>
                    </div>

                    <div className="flex gap-8 border-b border-white">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all ${activeTab === tab.id
                                        ? "text-brand-primary border-b-2 border-brand-primary"
                                        : "text-slate-400 hover:text-slate-600 border-b-2 border-transparent"
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full max-w-[1200px] mx-auto pb-10">
                <div className="attendance-content-wrapper">
                    <style>{`
            /* Hide repetitive headers from child components */
            .attendance-content-wrapper > div > div:first-child > h1 { display: none; }
            .attendance-content-wrapper .page-header-container { display: none; }
          `}</style>

                    <div className="animate-fade-in-up mt-2">
                        {tabs.find((t) => t.id === activeTab)?.content}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AttendanceManagement;

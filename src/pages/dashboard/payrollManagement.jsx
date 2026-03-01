import React, { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CurrencyDollarIcon, CalendarDaysIcon, ChartBarIcon } from "@heroicons/react/24/outline";

// Import the existing pages to render exactly as they are within the tabs
import { Salary } from "./salary";
import AttendanceSalary from "./attendanceSalary";
import SalaryReport from "./salaryReport";

export function PayrollManagement() {
    const [activeTab, setActiveTab] = useState("setup");

    const tabs = [
        {
            id: "setup",
            label: "Salary Setup",
            icon: <CurrencyDollarIcon className="w-5 h-5" />,
            content: <Salary />,
        },
        {
            id: "calculate",
            label: "Calculate Current Month",
            icon: <CalendarDaysIcon className="w-5 h-5" />,
            content: <AttendanceSalary />,
        },
        {
            id: "report",
            label: "Salary Reports",
            icon: <ChartBarIcon className="w-5 h-5" />,
            content: <SalaryReport />,
        },
    ];

    return (
        <div className="flex flex-col h-full bg-brand-bg relative">
            <div className="bg-white border-b border-brand-border sticky top-0 z-30 shadow-sm">
                <div className="max-w-[1200px] mx-auto px-6">
                    {/* Custom Minimalist Header for the combined view */}
                    <div className="pt-8 pb-6">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <CurrencyDollarIcon className="w-7 h-7 text-brand-primary" />
                            Payroll Management
                        </h1>
                        <p className="text-sm font-semibold text-slate-500 mt-1">
                            Configure base pay, calculate monthly attendance, and finalize payroll.
                        </p>
                    </div>

                    {/* Sticky Tabs */}
                    <div className="flex gap-8 border-b border-white (to avoid double border with parent)">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 pb-4 text-sm font-bold transition-all
                  ${activeTab === tab.id
                                        ? "text-brand-primary border-b-2 border-brand-primary"
                                        : "text-slate-400 hover:text-slate-600 border-b-2 border-transparent"
                                    }
                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Render Active Content */}
            <div className="flex-1 w-full max-w-[1200px] mx-auto pb-10">
                {/* We wrap the content to hide the repetitive PageHeaders from the sub-components using CSS */}
                <div className="payroll-content-wrapper">
                    <style>{`
            /* Hide the individual PageHeaders from sub-components */
            .payroll-content-wrapper .page-header {
                display: none;
            }
          `}</style>
                    <div className="animate-fade-in-up mt-2">
                        {tabs.find((t) => t.id === activeTab)?.content}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PayrollManagement;

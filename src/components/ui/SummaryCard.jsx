import React from "react";
import { Card } from "@/components/ui/Card";

export function SummaryCard({ icon: Icon, label, value, accent }) {
    const accents = {
        blue: { bar: "bg-brand-primary", bg: "bg-blue-50", icon: "text-brand-primary" },
        green: { bar: "bg-brand-success", bg: "bg-green-50", icon: "text-brand-success" },
        red: { bar: "bg-brand-danger", bg: "bg-rose-50", icon: "text-brand-danger" },
        violet: { bar: "bg-violet-500", bg: "bg-violet-50", icon: "text-violet-600" },
    };
    const c = accents[accent] || accents.blue;
    return (
        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow" noPadding>
            <div className={`absolute left-0 top-0 h-full w-1.5 ${c.bar}`} />
            <div className="px-5 py-4 flex items-center gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl border border-white/50 shadow-sm shrink-0 transition-transform group-hover:scale-105 ${c.bg}`}>
                    <Icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                <div>
                    <p className="text-2xl font-black tracking-tight text-slate-800 leading-none">{value}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">{label}</p>
                </div>
            </div>
        </Card>
    );
}

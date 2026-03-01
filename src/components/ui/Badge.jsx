import React from "react";

export function Badge({ children, variant = "neutral", className = "" }) {
    const base = "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider border";

    const variants = {
        neutral: "bg-slate-100 text-slate-600 border-slate-200",
        success: "bg-green-50 text-green-700 border-green-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        danger: "bg-red-50 text-red-700 border-red-200",
        primary: "bg-blue-50 text-blue-700 border-blue-200",
    };

    return (
        <span className={`${base} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}

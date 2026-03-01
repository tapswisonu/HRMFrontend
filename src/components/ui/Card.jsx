import React from "react";

export function Card({ children, className = "", noPadding = false }) {
    return (
        <div className={`bg-white rounded-2xl shadow-soft border border-brand-border overflow-hidden ${noPadding ? "" : "p-6"} ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, action, className = "" }) {
    return (
        <div className={`flex items-center justify-between pb-4 mb-4 border-b border-brand-border ${className}`}>
            <div>
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                {subtitle && <p className="text-sm font-medium text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

export function CardBody({ children, className = "" }) {
    return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>;
}

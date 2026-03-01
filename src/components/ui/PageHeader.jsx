import React from "react";
import { Link } from "react-router-dom";

export function PageHeader({ title, subtitle, breadcrumbs, actionNode }) {
    return (
        <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="text-sm font-medium text-slate-500 mt-1">{subtitle}</p>
                )}
                {breadcrumbs && (
                    <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-400">
                        {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={crumb.label}>
                                {crumb.path ? (
                                    <Link to={crumb.path} className="hover:text-brand-primary transition-colors">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-slate-600">{crumb.label}</span>
                                )}
                                {idx < breadcrumbs.length - 1 && <span>/</span>}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            {actionNode && (
                <div className="flex items-center gap-3">
                    {actionNode}
                </div>
            )}
        </div>
    );
}

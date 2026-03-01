import React, { forwardRef } from "react";

export const FormInput = forwardRef(({
    label,
    error,
    icon,
    prefix,
    className = "",
    containerClassName = "",
    ...props
}, ref) => {
    return (
        <div className={`flex flex-col gap-2 ${containerClassName}`}>
            {label && (
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </span>
                )}
                {prefix && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        {prefix}
                    </span>
                )}
                <input
                    ref={ref}
                    className={`
            w-full h-11 rounded-xl border bg-slate-50 text-sm font-semibold text-slate-900 
            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition
            placeholder:font-normal placeholder:text-slate-400
            disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
            ${(icon || prefix) ? "pl-10" : "px-4"} 
            ${error ? "border-red-300 ring-1 ring-red-500" : "border-slate-200"}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}
        </div>
    );
});

FormInput.displayName = 'FormInput';

export const FormSelect = forwardRef(({
    label,
    error,
    options = [],
    className = "",
    containerClassName = "",
    placeholder = "— Select —",
    ...props
}, ref) => {
    return (
        <div className={`flex flex-col gap-2 ${containerClassName}`}>
            {label && (
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`
          w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm font-semibold text-slate-700
          focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition
          disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
          ${error ? "border-red-300 ring-1 ring-red-500" : "border-slate-200"}
          ${className}
        `}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt, i) => (
                    <option key={i} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}
        </div>
    );
});

FormSelect.displayName = 'FormSelect';

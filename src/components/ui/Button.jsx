import React from 'react';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    fullWidth = false,
    disabled = false,
    icon = null,
    ...props
}) {
    const baseStyle = "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0";

    const variants = {
        primary: "bg-brand-primary text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primaryHover hover:shadow-lg hover:-translate-y-0.5",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
        danger: "bg-brand-danger text-white shadow-md shadow-red-500/20 hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5",
        outline: "bg-transparent text-brand-primary border-2 border-brand-primary hover:bg-blue-50",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    };

    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3 text-base"
    };

    const classes = `${baseStyle} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`;

    return (
        <button className={classes} disabled={disabled} {...props}>
            {icon && <span className="w-5 h-5">{icon}</span>}
            {children}
        </button>
    );
}

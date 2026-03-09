import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import {
    UsersIcon,
    ChartBarIcon,
    BanknotesIcon,
} from "@heroicons/react/24/solid";

// ── Reusable Input ─────────────────────────────────────────────────────────────
function FormInput({ id, label, type = "text", placeholder, value, onChange, required, rightElement }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-semibold text-slate-700">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="
            w-full h-12 px-4 pr-12 rounded-xl text-sm text-slate-800
            bg-white border border-slate-200
            placeholder-slate-400
            outline-none
            transition-all duration-200
            focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15
            hover:border-slate-300
          "
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20">
                <Icon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
                <p className="text-white font-bold text-lg leading-none">{value}</p>
                <p className="text-blue-100 text-xs mt-0.5">{label}</p>
            </div>
        </div>
    );
}

// ── Main Sign In ───────────────────────────────────────────────────────────────
export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [passwordShown, setPasswordShown] = useState(false);
    const prevErrorRef = React.useRef(null);
    const dispatch = useDispatch();
    const { loading, error } = useSelector((s) => s.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (error && error !== prevErrorRef.current) {
            toast.error(error, { autoClose: 2500 });
        }
        prevErrorRef.current = error;
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!role) {
            toast.error("Please select a role before logging in.");
            return;
        }
        const res = await dispatch(login({ email, password, role }));
        if (res.meta.requestStatus === "fulfilled") {
            toast.success("Login successful!");
            navigate("/dashboard/home");
        }
    };

    return (
        <section className="min-h-screen flex bg-slate-50">

            {/* ── Left Column — Form ─────────────────────────────────────────────── */}
            <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12 xl:px-20">
                <div className="w-full max-w-[420px]">

                    {/* Logo + Brand */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm shrink-0 shadow-md shadow-blue-600/30">
                            HR
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 leading-none">HRM System</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Human Resource Management</p>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Welcome back
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Sign in to your account to continue
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.07)] p-8">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                            {/* Email */}
                            <FormInput
                                id="email"
                                label="Email Address"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            {/* Password */}
                            <FormInput
                                id="password"
                                label="Password"
                                type={passwordShown ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setPasswordShown((v) => !v)}
                                        className="text-slate-400 hover:text-slate-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {passwordShown
                                            ? <EyeIcon className="w-4.5 h-4.5" />
                                            : <EyeSlashIcon className="w-4.5 h-4.5" />
                                        }
                                    </button>
                                }
                            />

                            {/* Role Select */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="role" className="text-sm font-semibold text-slate-700">
                                    Sign in as
                                </label>
                                <div className="relative">
                                    <select
                                        id="role"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        required
                                        className="
                      w-full h-12 px-4 rounded-xl text-sm text-slate-800 appearance-none
                      bg-white border border-slate-200
                      outline-none cursor-pointer
                      transition-all duration-200
                      focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15
                      hover:border-slate-300
                    "
                                    >
                                        <option value="" disabled>Select your role</option>
                                        <option value="admin">🛡 Admin</option>
                                        <option value="employee">👤 Employee</option>
                                    </select>
                                    {/* Custom chevron */}
                                    <svg
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                                    </svg>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="
                  mt-2 w-full h-12 flex items-center justify-center gap-2
                  rounded-xl text-sm font-semibold text-white
                  bg-blue-600 hover:bg-blue-700
                  shadow-md shadow-blue-600/25
                  hover:shadow-lg hover:shadow-blue-600/30
                  hover:-translate-y-0.5
                  active:translate-y-0 active:shadow-md
                  transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                "
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>

                        </form>
                    </div>

                    {/* Footer note */}
                    <p className="mt-6 text-center text-xs text-slate-400">
                        <ShieldCheckIcon className="inline w-3.5 h-3.5 mr-1 text-slate-400" />
                        Secured by 256-bit SSL encryption
                    </p>

                </div>
            </div>

            {/* ── Right Column — Illustration Panel ──────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">

                {/* Subtle decorative circles */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
                <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />
                <div className="absolute top-1/2 right-8 w-40 h-40 rounded-full bg-indigo-900/40" />

                {/* Auth Banner Image */}
                <img
                    src="/img/auth-banner.jpg"
                    alt="HRM Dashboard Illustration"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
                />

                {/* Content overlay */}
                <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">

                    {/* Top: tag */}
                    <div>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-100 bg-white/10 border border-white/20 rounded-full px-4 py-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                            Enterprise HR Platform
                        </span>
                    </div>

                    {/* Middle: headline */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
                                Manage your<br />
                                <span className="text-blue-200">entire workforce</span><br />
                                in one place.
                            </h2>
                            <p className="mt-4 text-blue-100 text-base leading-relaxed max-w-sm">
                                Attendance tracking, salary management, employee records — all seamlessly unified.
                            </p>
                        </div>

                        {/* Stats pills */}
                        <div className="grid grid-cols-3 gap-3">
                            <StatPill icon={UsersIcon} value="500+" label="Employees" />
                            <StatPill icon={ChartBarIcon} value="98%" label="Uptime" />
                            <StatPill icon={BanknotesIcon} value="₹0" label="Setup cost" />
                        </div>
                    </div>


                </div>
            </div>

        </section>
    );
}

export default Login;

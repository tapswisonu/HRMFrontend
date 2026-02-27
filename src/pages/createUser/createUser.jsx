import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser } from "../../features/users/userSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  EyeIcon,
  EyeSlashIcon,
  UserPlusIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

// ── Reusable Field Component ───────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

// ── Input base classes ─────────────────────────────────────────────────────────
const inputCls = `
  w-full h-12 px-4 rounded-xl text-sm text-slate-800
  bg-white border border-slate-200
  placeholder-slate-400 outline-none
  transition-all duration-200
  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15
  hover:border-slate-300
  disabled:opacity-60 disabled:cursor-not-allowed
`.trim();

// ── Role descriptions ─────────────────────────────────────────────────────────
const ROLES = [
  { value: "employee", label: "Employee", desc: "Access attendance, salary & profile" },
  { value: "admin", label: "Admin", desc: "Full system access and user management" },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CreateUser() {
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", password: "", role: "employee",
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.users);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  };

  // Client-side validation
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile.trim()))
      e.mobile = "Enter a valid 10-digit number";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Min 6 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      password: form.password,
      role: form.role,
    };

    const res = await dispatch(createUser(payload));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("User created successfully!");
      navigate("/dashboard/users");
    } else {
      toast.error(res.payload || "Failed to create user.");
    }
  };

  return (
    <div className="mt-10 mb-12 flex flex-col items-center">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl mb-6 flex items-center gap-4">
        <Link
          to="/dashboard/users"
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Create New User</h1>
          <p className="text-sm text-slate-400 mt-0.5">Add a new user to the HRM system</p>
        </div>
      </div>

      {/* ── Form Card ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.07)] overflow-hidden">

        {/* Card top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

        <div className="px-8 py-8">

          {/* ── Section: Account Info ────────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
              <UserPlusIcon className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Account Information</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* 2-column grid on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Full Name */}
              <Field label="Full Name" required error={errors.name}>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className={inputCls}
                />
              </Field>

              {/* Email */}
              <Field label="Email Address" required error={errors.email}>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={inputCls}
                />
              </Field>

              {/* Mobile */}
              <Field label="Mobile Number" required error={errors.mobile}>
                <input
                  name="mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  maxLength={10}
                  className={inputCls}
                />
              </Field>

              {/* Password */}
              <Field label="Password" required error={errors.password}>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPass
                      ? <EyeIcon className="w-4.5 h-4.5" />
                      : <EyeSlashIcon className="w-4.5 h-4.5" />
                    }
                  </button>
                </div>
              </Field>
            </div>

            {/* ── Divider ──────────────────────────────────────────────────── */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-start">
                <span className="bg-white pr-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Role & Permissions
                </span>
              </div>
            </div>

            {/* Role selector — radio cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
              {ROLES.map(({ value, label, desc }) => (
                <label
                  key={value}
                  className={`
                    flex items-start gap-3 p-4 rounded-xl border cursor-pointer
                    transition-all duration-150
                    ${form.role === value
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/15"
                      : "border-slate-200 bg-white hover:border-slate-300"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={form.role === value}
                    onChange={handleChange}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <p className={`text-sm font-semibold ${form.role === value ? "text-blue-700" : "text-slate-700"}`}>
                      {label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* ── Actions ──────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="
                  flex-1 h-12 flex items-center justify-center gap-2
                  rounded-xl text-sm font-semibold text-white
                  bg-blue-600 hover:bg-blue-700
                  shadow-md shadow-blue-600/25
                  hover:shadow-lg hover:shadow-blue-600/30
                  hover:-translate-y-0.5 active:translate-y-0
                  transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                "
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="w-4 h-4" />
                    Create User
                  </>
                )}
              </button>

              <Link
                to="/dashboard/users"
                className="
                  flex-1 sm:flex-none sm:w-32 h-12 flex items-center justify-center
                  rounded-xl text-sm font-semibold text-slate-600
                  bg-white border border-slate-200
                  hover:bg-slate-50 hover:border-slate-300
                  transition-all duration-200
                "
              >
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}

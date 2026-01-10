import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./../../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import {
  Input,
  Button,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => setPasswordShown((cur) => !cur);
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
      if (role === "admin") navigate("/dashboard/home");
      if (role === "employee") navigate("/dashboard/employeeDashboard");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px]">

        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
          <div className="text-center lg:text-left mb-10">
            <img src="/img/logo.jpg" alt="Logo" className="h-12 mx-auto lg:mx-0 mb-4" />
            <Typography variant="h3" className="font-bold text-brand-blue">
              Sign In
            </Typography>
            <Typography variant="paragraph" className="mt-2 font-normal text-blue-gray-500">
              Welcome back! Please enter your details.
            </Typography>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Show redux error */}
            {error && toast.error(error)}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Typography variant="small" className="font-bold text-brand-blue">
                Email Address
              </Typography>
              <Input
                size="lg"
                placeholder="name@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="!border-blue-gray-100 focus:!border-brand-teal bg-white"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Typography variant="small" className="font-bold text-brand-blue">
                  Password
                </Typography>
                <Typography
                  as="button"
                  type="button"
                  variant="small"
                  className="font-medium flex items-center gap-1 cursor-pointer text-brand-teal hover:text-brand-blue transition-colors"
                  onClick={togglePasswordVisiblity}
                >
                  {passwordShown ? (
                    <EyeIcon className="h-4 w-4" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" />
                  )}
                  {passwordShown ? "Hide" : "Show"}
                </Typography>
              </div>
              <Input
                type={passwordShown ? "text" : "password"}
                size="lg"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!border-blue-gray-100 focus:!border-brand-teal bg-white"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                required
              />
            </div>

            {/* Role Selection */}
            <div className="flex flex-col gap-2">
              <Typography variant="small" className="font-bold text-brand-blue">
                Select Role
              </Typography>
              <Select
                label="Select role"
                value={role}
                onChange={(val) => setRole(val)}
                className="!border-blue-gray-100 focus:!border-brand-teal bg-white"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                menuProps={{ className: "bg-white p-2" }}
              >
                <Option value="admin">Admin</Option>
                <Option value="employee">Employee</Option>
              </Select>
            </div>

            {/* Submit */}
            <Button type="submit" className="mt-4 bg-brand-blue hover:shadow-lg shadow-md text-white normal-case text-base font-bold py-3" fullWidth disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        {/* Right Side - Banner Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="/img/auth-banner.jpg"
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        </div>

      </div>
    </section>
  );
}

export default SignIn;

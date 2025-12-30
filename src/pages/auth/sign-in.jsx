import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./../../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

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

      // role-based redirection
      // role-based redirection
      if (role === "admin") navigate("/dashboard/home");
      if (role === "employee") navigate("/dashboard/employeeDashboard");
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Sign In</Typography>

        </div>

        {/* FORM START */}
        <form
          className="mt-8 mb-2 mx-auto w-full max-w-screen-lg lg:w-1/2 px-4"
          onSubmit={handleSubmit}
        >
          {/* Show redux error */}
          {error && (
            toast.error({ error })
          )}

          <div className="mb-1 flex flex-col gap-6">
            {/* EMAIL */}
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Email Address
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* PASSWORD */}
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* ROLE SELECTION */}
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Select Role
            </Typography>

            <Select
              label="Select role"
              value={role}
              onChange={(val) => setRole(val)}
            >
              <Option value="admin">Admin</Option>
              <Option value="employee">Employee</Option>
            </Select>
          </div>

          <Button type="submit" className="mt-6" fullWidth disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {/* <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Not registered?
            <Link to="/auth/sign-up" className="text-gray-900 ml-1">
              Create account
            </Link>
          </Typography> */}
        </form>
        {/* FORM END */}
      </div>

      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
    </section>
  );
}

export default SignIn;

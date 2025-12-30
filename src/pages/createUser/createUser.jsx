import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser } from "../../features/users/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";

export default function CreateUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "employee",
  });

  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.users);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔒 STRICT VALIDATION
    if (!form.email || form.email.trim() === "") {
      toast.error("Email is required!");
      return;
    }

    // 🔍 Explicit Payload Construction
    const payload = {
      name: form.name,
      email: form.email.trim(),
      mobile: form.mobile,
      password: form.password,
      role: form.role,
    };



    const res = await dispatch(createUser(payload));

    if (res.meta.requestStatus === "fulfilled") {
      navigate("/users");
    }
  };

  return (
    <div className="mt-10 flex justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader
          variant="gradient"
          color="black"
          className="mb-4 p-6"
        >
          <Typography variant="h5" color="black">
            Create New User
          </Typography>
        </CardHeader>

        <CardBody>
          {error && (
            toast.error({ error })
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Name */}
            <div>
              <Typography variant="small" className="font-medium mb-1">
                Full Name
              </Typography>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>

            {/* Email */}
            <div>
              <Typography variant="small" className="font-medium mb-1">
                Email Address
              </Typography>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
              />
            </div>
            <div>
              <Typography variant="small" className="font-medium mb-1">
                Mobile number
              </Typography>
              <Input
                name="mobile"
                type="mobile"
                value={form.mobile}
                onChange={handleChange}
                required
                placeholder="Enter mobile number"
              />
            </div>

            {/* Password */}
            <div>
              <Typography variant="small" className="font-medium mb-1">
                Password
              </Typography>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
              />
            </div>

            {/* Role */}
            <div>
              <Typography variant="small" className="font-medium mb-1">
                Select Role
              </Typography>
              <Select
                value={form.role}
                onChange={(value) => setForm((f) => ({ ...f, role: value }))}
              >
                <Option value="employee">employee</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              color="black"
              disabled={loading}
              className="mt-2"
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";

export function SignUp() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px]">

        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
          <div className="text-center lg:text-left mb-10">
            <img src="/img/logo.jpg" alt="Logo" className="h-12 mx-auto lg:mx-0 mb-4" />
            <Typography variant="h3" className="font-bold text-brand-blue">
              Sign Up
            </Typography>
            <Typography variant="paragraph" className="mt-2 font-normal text-blue-gray-500">
              Enter your email to register.
            </Typography>
          </div>

          <form className="flex flex-col gap-6">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <Typography variant="small" className="font-bold text-brand-blue">
                Email
              </Typography>
              <Input
                size="lg"
                placeholder="Enter your email address"
                className="!border-blue-gray-100 focus:!border-brand-teal bg-white"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            {/* Terms Checkbox */}
            <Checkbox
              label={
                <Typography
                  variant="small"
                  color="gray"
                  className="flex items-center justify-start font-medium"
                >
                  I agree the&nbsp;
                  <a
                    href="#"
                    className="font-normal text-brand-blue transition-colors hover:text-brand-teal underline"
                  >
                    Terms and Conditions
                  </a>
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
              className="checked:bg-brand-blue checked:border-brand-blue"
            />

            {/* Submit */}
            <Button className="mt-4 bg-brand-blue hover:shadow-lg shadow-md text-white normal-case text-base font-bold py-3" fullWidth>
              Sign up
            </Button>

            {/* Footer */}
            <Typography variant="small" className="text-center font-normal text-gray-600 mt-4">
              Already have an account?
              <Link to="/auth/sign-in" className="text-brand-blue ml-1 font-bold underline">
                Log in
              </Link>
            </Typography>
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

export default SignUp;

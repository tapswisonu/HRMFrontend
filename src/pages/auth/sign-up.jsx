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
    <section className="min-h-screen grid place-items-center bg-brand-bg p-8">
      <div className="w-full max-w-[600px] bg-brand-bg">
        <img src="/img/auth-banner.jpg" alt="Banner" className="w-full rounded-xl mb-8 object-cover shadow-sm" />
        <div className="text-center mb-10">
          <img src="/img/logo.jpg" alt="Logo" className="h-12 mx-auto mb-4" />
          <Typography variant="h3" className="font-bold text-brand-blue">
            Sign up with your email address
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

          {/* Terms Checkbox - Kept from original requirement of having a Terms agreement */}
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
    </section>
  );
}

export default SignUp;

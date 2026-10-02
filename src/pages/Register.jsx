
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Package, ShieldCheck, ArrowRight, CircleAlert } from "lucide-react";

import useAuth from "../hooks/useAuth";
import authService from "../services/authService";
import appConfig from "../config/appConfig";

import Input from "../components/common/Input";
import Button from "../components/common/Button";
import {
  isRequired,
  isStrongPassword,
  isValidEmail
} from "../utils/validators";

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organizationName: "",
    password: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setSubmitError("");
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!isRequired(formData.name)) errors.name = "Name is required";
    if (!isValidEmail(formData.email)) errors.email = "Enter a valid email address";
    if (!isRequired(formData.organizationName)) {
      errors.organizationName = "Organization name is required";
    }
    if (!isRequired(formData.password)) {
      errors.password = "Password is required";
    } else if (!isStrongPassword(formData.password)) {
      errors.password =
       "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character."    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setSubmitError("");
      return;
    }

    setFieldErrors({});
    setSubmitError("");
    setIsLoading(true);

    try {
      await authService.register({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        organizationName: formData.organizationName.trim()
      });

      toast.success(
        "Account created successfully. Please login."
      );

      navigate("/login");

    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
        "We couldn’t create your account. Please review your details and try again."
      );

    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="theme-page-background min-h-dvh p-2 sm:p-3">

      <div className="theme-surface theme-shadow-lg mx-auto flex min-h-[calc(100dvh-16px)] max-w-8xl overflow-hidden rounded-3xl sm:min-h-[calc(100dvh-24px)]">

        {/* Left Section */}
        <div className="theme-primary-soft relative hidden w-1/2 overflow-hidden lg:flex">

          <div className="theme-decoration absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl" />

          <div className="theme-decoration-muted absolute -bottom-32 -right-20 h-96 w-96 rounded-full blur-3xl" />

          <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">

            {/* Brand */}
            <div className="flex items-center gap-3">

              <img
                src={appConfig.logo}
                alt={appConfig.appName}
                className="h-11 w-11"
              />

              <div>
                <p className="text-lg font-bold theme-text-primary">
                  {appConfig.appName}
                </p>

                <p className="text-xs theme-text-muted">
                  {appConfig.tagline}
                </p>
              </div>

            </div>

            {/* Content */}
            <div className="max-w-lg">

              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] theme-primary-text">
                Get started today
              </p>

              <h2 className="text-4xl font-bold leading-tight tracking-tight theme-text-primary xl:text-5xl">
                Start managing your inventory
                <span className="theme-primary-text"> smarter.</span>
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 theme-text-secondary">
                Create your account and get a simple workspace
                to manage products, stock and inventory.
              </p>

              {/* Features */}
              <div className="mt-8 space-y-4">

                <div className="flex items-center gap-3">

                  <div className="theme-surface theme-primary-text flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
                    <Package size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold theme-text-primary">
                      Easy inventory management
                    </p>

                    <p className="text-xs theme-text-muted">
                      Manage products from one workspace.
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <div className="theme-surface theme-primary-text flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold theme-text-primary">
                      Secure account
                    </p>

                    <p className="text-xs theme-text-muted">
                      Your account is protected.
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* Bottom */}
            <p className="text-xs theme-text-muted">
              {appConfig.appName} · Built for smarter inventory management
            </p>

          </div>

        </div>

        {/* Right Section */}
        <div className="theme-surface flex w-full items-center justify-center px-6 py-4 sm:px-10 sm:py-10 lg:w-1/2 lg:px-14 xl:px-20">

          <div className="w-full max-w-md">

            {/* Mobile Brand */}
            <div className="mb-3 flex items-center gap-3 lg:hidden">

              <img
                src={appConfig.logo}
                alt={appConfig.appName}
                className="h-10 w-10"
              />

              <p className="text-base font-bold theme-text-primary">
                {appConfig.appName}
              </p>

            </div>

            {/* Heading */}
            <div>

              <h1 className="mt-2 text-3xl font-bold tracking-tight theme-text-primary">
                Create your account
              </h1>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-4 space-y-3 sm:mt-6 sm:space-y-4"
            >
              {submitError && (
                <div role="alert" className="flex items-start gap-2.5 rounded-xl border theme-danger-border theme-danger-soft p-3.5 text-sm theme-danger">
                  <CircleAlert size={18} className="mt-0.5 shrink-0" />
                  <p>{submitError}</p>
                </div>
              )}

              <Input
                label="Full name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                disabled={isLoading}
                error={fieldErrors.name}
              />

              <Input
                label="Email address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                disabled={isLoading}
                error={fieldErrors.email}
              />

              <Input
                label="Organization name"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Enter your organization name"
                required
                disabled={isLoading}
                error={fieldErrors.organizationName}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                disabled={isLoading}
                showPasswordToggle
                error={fieldErrors.password}
              />

              <Button
                type="submit"
                loading={isLoading}
                loadingText="Creating account..."
                className="group w-full rounded-xl theme-primary-action-bg py-3 shadow-sm sm:py-3.5"
              >
                <span>Create account</span>

                {!isLoading && (
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </Button>

            </form>

            {/* Login */}
            <div className="mt-4 border-t theme-border-subtle pt-4 text-center sm:mt-5 sm:pt-5">

              <p className="text-sm theme-text-muted">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold theme-primary-text hover:underline"
                >
                  Sign in
                </Link>
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;

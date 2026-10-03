
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Package, ShieldCheck, ArrowRight, CircleAlert } from "lucide-react";

import useAuth from "../hooks/useAuth";
import appConfig from "../config/appConfig";

import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { isRequired, isValidEmail } from "../utils/validators";

const Login = () => {
  const navigate = useNavigate();

  const {
    login,
    isAuthenticated
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

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
    if (!isValidEmail(formData.email)) {
      errors.email = "Enter a valid email address";
    }
    if (!isRequired(formData.password)) {
      errors.password = "Password is required";
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setSubmitError("");
      return;
    }
    setFieldErrors({});
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await login({ ...formData, email: formData.email.trim() });

      toast.success("Login successful");

      navigate("/dashboard");
    } catch (error) {
      const message = error.response?.data?.message || "";
      setSubmitError(
        error.response?.status === 401 || message.toLowerCase().includes("invalid email or password")
          ? "Email or password is incorrect. Check your details and try again."
          : message || "We couldn’t sign you in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && !isSubmitting) {
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
                Smart inventory control
              </p>

              <h2 className="text-4xl font-bold leading-tight tracking-tight theme-text-primary xl:text-5xl">
                Manage your inventory
                <span className="theme-primary-text"> smarter.</span>
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 theme-text-secondary">
                Track products, monitor stock and manage your inventory
                from one simple workspace.
              </p>

              {/* Features */}
              <div className="mt-8 space-y-4">

                <div className="flex items-center gap-3">

                  <div className="theme-surface theme-primary-text flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
                    <Package size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold theme-text-primary">
                      Real-time inventory
                    </p>

                    <p className="text-xs theme-text-muted">
                      Keep your products organized.
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <div className="theme-surface theme-primary-text flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold theme-text-primary">
                      Secure workspace
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
                Sign in to continue
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
                label="Email address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                disabled={isSubmitting}
                error={fieldErrors.email}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
                showPasswordToggle
                error={fieldErrors.password}
              />

              <Button
                type="submit"
                loading={isSubmitting}
                loadingText="Signing in..."
                className="group w-full rounded-xl theme-primary-action-bg py-3 shadow-sm sm:py-3.5"
              >
                <span>Sign in</span>

                {!isSubmitting && (
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </Button>

            </form>

            {/* Register */}
            <div className="mt-4 border-t theme-border-subtle pt-4 text-center sm:mt-5 sm:pt-5">

              <p className="text-sm theme-text-muted">
                New to {appConfig.appName}?{" "}
                <Link
                  to="/register"
                  className="font-semibold theme-primary-text hover:underline"
                >
                  Create an account
                </Link>
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Package, ShieldCheck, ArrowRight } from "lucide-react";

import authService from "../services/authService";
import appConfig from "../config/appConfig";

import Input from "../components/common/Input";
import Button from "../components/common/Button";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      await authService.register(formData);

      toast.success(
        "Account created successfully. Please login."
      );

      navigate("/login");

    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      toast.error(message);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="theme-page-background min-h-screen p-2 sm:p-3 lg:p-3">

      <div className="theme-surface theme-shadow-lg mx-auto flex min-h-[calc(100vh-24px)] max-w-8xl overflow-hidden rounded-3xl">

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
        <div className="theme-surface flex w-full items-center justify-center px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14 xl:px-20">

          <div className="w-full max-w-md">

            {/* Mobile Brand */}
            <div className="mb-8 lg:hidden">

              <img
                src={appConfig.logo}
                alt={appConfig.appName}
                className="h-11 w-11"
              />

              <p className="mt-3 text-sm font-bold theme-text-primary">
                {appConfig.appName}
              </p>

            </div>

            {/* Heading */}
            <div>

              <p className="text-sm font-semibold theme-primary-text">
                Get started
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight theme-text-primary">
                Create your account
              </h1>

              <p className="mt-2 text-sm leading-6 theme-text-muted">
                Create your inventory account to get started.
              </p>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              <Input
                label="Full name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                disabled={isLoading}
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
              />

              <Button
                type="submit"
                loading={isLoading}
                className="group w-full rounded-xl theme-primary-action-bg py-3.5 shadow-sm"
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
            <div className="mt-7 border-t theme-border-subtle pt-6 text-center">

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

            {/* Security */}
            <div className="theme-security-note mt-6 flex items-center gap-3 rounded-xl p-4">

              <ShieldCheck
                size={20}
                className="shrink-0 theme-primary-text"
              />

              <div>
                <p className="text-xs font-semibold theme-text-secondary">
                  Secure account
                </p>

                <p className="mt-0.5 text-[11px] theme-text-muted">
                  Your account is secured with the inventory API.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;


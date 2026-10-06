import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, CircleAlert } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import useAuth from "../hooks/useAuth";
import { isRequired, isStrongPassword, isValidEmail } from "../utils/validators";
import authService from "../services/authService";

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organizationName: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setSubmitError("");
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!isRequired(formData.name)) errors.name = "Name is required";
    if (!isValidEmail(formData.email)) errors.email = "Enter a valid email address";
    if (!isRequired(formData.organizationName)) errors.organizationName = "Organization name is required";
    if (!isRequired(formData.password)) {
      errors.password = "Password is required";
    } else if (!isStrongPassword(formData.password)) {
      errors.password = "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";
    }
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
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
        name: formData.name.trim(),
        email: formData.email.trim(),
        organizationName: formData.organizationName.trim(),
        password: formData.password
      });
      toast.success("Verification code sent to your email.");
      navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim())}`, {
        state: { resendAfter: Date.now() + 60_000 }
      });
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
        "We couldn’t create your account. Please review your details and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setSubmitError("");
    setIsLoading(true);
    try {
      const data = await googleLogin({ credential });
      if (data.requiresOrganization) {
        navigate("/create-organization", {
          state: { registrationToken: data.registrationToken },
          replace: true
        });
        return;
      }
      toast.success("Google sign-in successful");
      navigate(data.user.mustChangePassword ? "/change-password" : "/dashboard", { replace: true });
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
        "Google registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Set up your workspace and start managing your inventory."
      compact
      footer={(
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold theme-primary-text hover:underline">Sign in</Link>
        </p>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-2">
        {submitError && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
          autoComplete="name"
          compact
          required
          autoFocus
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
          autoComplete="email"
          compact
          required
          disabled={isLoading}
          error={fieldErrors.email}
        />
        <Input
          label="Organization name"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleChange}
          placeholder="Your business name"
          autoComplete="organization"
          compact
          required
          disabled={isLoading}
          error={fieldErrors.organizationName}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            autoComplete="new-password"
            compact
            required
            disabled={isLoading}
            showPasswordToggle
            error={fieldErrors.password}
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            autoComplete="new-password"
            compact
            required
            disabled={isLoading}
            showPasswordToggle
            error={fieldErrors.confirmPassword}
          />
        </div>
        <p className="text-[11px] leading-4 theme-text-muted">
          Use at least 8 characters with uppercase, lowercase, a number and a symbol.
        </p>
        <Button type="submit" loading={isLoading} loadingText="Sending verification code..." className="group w-full">
          <span>Create account</span>
          {!isLoading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />}
        </Button>
        <div className="relative text-center">
          <span className="relative z-10 bg-white px-3 text-xs font-medium text-slate-500">or continue with</span>
          <span aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-slate-200" />
        </div>
        <GoogleSignInButton onCredential={handleGoogleCredential} disabled={isLoading} />
      </form>
    </AuthLayout>
  );
};

export default Register;

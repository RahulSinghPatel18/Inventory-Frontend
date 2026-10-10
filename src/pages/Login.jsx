import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, CircleAlert } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import useAuth from "../hooks/useAuth";
import { isRequired, isValidEmail } from "../utils/validators";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, verifyTwoFactor, resendTwoFactor, isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [challengeToken, setChallengeToken] = useState(location.state?.challengeToken || "");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timeout = window.setTimeout(() => setResendCooldown((remaining) => remaining - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [resendCooldown]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setSubmitError("");
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const completeLogin = (data) => {
    if (data.requiresTwoFactor) {
      setChallengeToken(data.challengeToken);
      setOtp("");
      setResendCooldown(60);
      toast.success("A verification code was sent to your email.");
      return;
    }
    toast.success(data.user.mustChangePassword
      ? "Sign in successful. Change your password to continue."
      : "Login successful");
    navigate(data.user.mustChangePassword ? "/change-password" : "/dashboard");
  };

  const handleResendTwoFactor = async () => {
    if (!challengeToken || resendCooldown > 0 || isSubmitting) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const data = await resendTwoFactor(challengeToken);
      setChallengeToken(data.challengeToken);
      setOtp("");
      setResendCooldown(60);
      toast.success("A new verification code was sent to your email.");
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Unable to resend the code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    if (challengeToken) {
      if (!/^\d{6}$/.test(otp)) {
        setSubmitError("Enter the 6-digit verification code sent to your email.");
        return;
      }
      setIsSubmitting(true);
      try {
        completeLogin(await verifyTwoFactor({ challengeToken, otp }));
      } catch (error) {
        setSubmitError(error.response?.data?.message || "Unable to verify the code. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const errors = {};
    if (!isValidEmail(formData.email)) errors.email = "Enter a valid email address";
    if (!isRequired(formData.password)) errors.password = "Password is required";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      completeLogin(await login({ ...formData, email: formData.email.trim() }));
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
        (error.response?.status === 401
          ? "Email or password is incorrect. Check your details and try again."
          : "We couldn’t sign you in. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const data = await googleLogin({ credential });
      if (data.requiresOrganization) {
        navigate("/create-organization", {
          state: { registrationToken: data.registrationToken },
          replace: true
        });
        return;
      }
      completeLogin(data);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "Google sign-in failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && !isSubmitting) {
    return <Navigate to={user?.mustChangePassword ? "/change-password" : "/dashboard"} replace />;
  }

  return (
    <AuthLayout
      eyebrow={challengeToken ? "Two-step verification" : ""}
      title={challengeToken ? "Check your email" : "Welcome back"}
      description={challengeToken
        ? "Enter the 6-digit sign-in code. It expires in 10 minutes."
        : "Sign in to continue to your workspace."}
      compact
      footer={(
        <p className="text-center text-sm text-slate-500">
          New to MYStockHub?{" "}
          <Link to="/register" className="font-semibold theme-primary-text hover:underline">Create an account</Link>
        </p>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {submitError && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            <p>{submitError}</p>
          </div>
        )}

        {challengeToken ? (
          <>
            <Input
              label="6-digit verification code"
              name="otp"
              type="text"
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                setSubmitError("");
              }}
              placeholder="000000"
              autoComplete="one-time-code"
              inputMode="numeric"
              compact
              required
              autoFocus
              disabled={isSubmitting}
              error={fieldErrors.otp}
            />
            <Button type="submit" loading={isSubmitting} loadingText="Verifying..." className="w-full">
              Verify and sign in
            </Button>
            <button
              type="button"
              onClick={handleResendTwoFactor}
              disabled={isSubmitting || resendCooldown > 0}
              className="w-full text-sm font-semibold theme-primary-text disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend verification code"}
            </button>
            <button
              type="button"
              onClick={() => {
                setChallengeToken("");
                setOtp("");
                setSubmitError("");
              }}
              className="w-full text-sm font-semibold theme-primary-text hover:underline"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
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
              autoFocus
              disabled={isSubmitting}
              error={fieldErrors.email}
            />
            <div>
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                compact
                required
                disabled={isSubmitting}
                showPasswordToggle
                error={fieldErrors.password}
              />
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-sm font-semibold text-[#15803D] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]">
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" loading={isSubmitting} loadingText="Signing in..." className="group w-full">
              <span>Sign in</span>
              {!isSubmitting && <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />}
            </Button>
            <div className="relative text-center">
              <span className="relative z-10 bg-white px-3 text-xs font-medium text-slate-500">or continue with</span>
              <span aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-slate-200" />
            </div>
            <GoogleSignInButton onCredential={handleGoogleCredential} disabled={isSubmitting} />
          </>
        )}
      </form>
    </AuthLayout>
  );
};

export default Login;

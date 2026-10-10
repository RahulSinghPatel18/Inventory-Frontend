import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";
import Button from "../components/common/Button";
import BrandLogo from "../components/common/BrandLogo";
import Input from "../components/common/Input";
import authService from "../services/authService";
import useAuth from "../hooks/useAuth";
import { isStrongPassword, isValidEmail } from "../utils/validators";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const legacyToken = searchParams.get("token") || "";
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState(legacyToken);
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(() => {
    const queryResendAfter = Number(searchParams.get("resendAfter"));
    const resendAfter = Number.isFinite(queryResendAfter) && queryResendAfter > 0
      ? queryResendAfter
      : location.state?.resendAfter || 0;
    return Math.max(0, Math.ceil((resendAfter - Date.now()) / 1000));
  });
  const isVerified = Boolean(resetToken);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timeout = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [cooldown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (!isVerified) {
      if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
        setError("Enter a valid email address and the 6-digit verification code.");
        return;
      }
      setIsSubmitting(true);
      try {
        const result = await authService.verifyResetOtp(email.trim(), otp);
        setResetToken(result.resetToken);
        toast.success("Code verified. Choose a new password.");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "The code is invalid or expired. Request another code.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError("Use at least 8 characters with uppercase, lowercase, a number, a symbol, and no more than 72 UTF-8 bytes.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword({ token: resetToken, password: formData.password });
      logout();
      toast.success("Password reset successfully. Sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to reset password. Request a new code and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (isVerified || !isValidEmail(email) || cooldown > 0 || isResending) return;
    setError("");
    setIsResending(true);
    try {
      const result = await authService.forgotPassword(email.trim());
      toast.success(result.message);
      setOtp("");
      setResetToken("");
      setCooldown(60);
      const params = new URLSearchParams(searchParams);
      params.set("resendAfter", String(Date.now() + 60_000));
      setSearchParams(params, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to resend the code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="theme-page-background flex min-h-dvh items-center justify-center px-4 py-6 sm:p-8">
      <section className="theme-surface theme-shadow-lg w-full max-w-lg rounded-2xl border theme-border p-5 sm:p-8">
        <Link
          to="/login"
          className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium theme-text-secondary transition theme-hover-neutral hover:theme-primary-text"
        >
          <ArrowLeft size={17} />
          Back to sign in
        </Link>

        <Link to="/" className="mb-6 inline-flex">
          <BrandLogo size="md" />
        </Link>

        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl theme-primary-soft theme-primary-text">
            <KeyRound size={21} />
          </span>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-xl font-bold tracking-tight theme-text-primary sm:text-2xl">
              {isVerified ? "Set a new password" : "Verify your reset code"}
            </h1>
            <p className="mt-1 text-sm leading-6 theme-text-muted">
              {isVerified
                ? "Choose a strong password for your account."
                : "Enter the 6-digit code sent to your email. It expires in 10 minutes."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p role="alert" aria-live="polite" className="rounded-xl theme-danger-soft p-3 text-sm leading-5 theme-danger">
              {error}
            </p>
          )}
          {!isVerified ? (
            <>
              <Input
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                required
                disabled={isSubmitting || isResending}
              />
              <div>
                <label htmlFor="resetOtp" className="mb-1.5 block text-sm font-semibold theme-text-primary">
                  Verification code
                </label>
                <input
                  id="resetOtp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  required
                  disabled={isSubmitting || isResending}
                  aria-label="6-digit password reset code"
                  aria-describedby="reset-otp-help"
                  className="theme-input w-full rounded-xl border px-4 py-3 text-center text-lg tracking-[0.4em] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--theme-focus-ring)] disabled:cursor-not-allowed disabled:opacity-70"
                />
                <p id="reset-otp-help" className="mt-1.5 text-xs leading-5 theme-text-muted">
                  Check your inbox and spam folder. The code is valid for 10 minutes.
                </p>
              </div>
            </>
          ) : (
            <>
              <Input
                label="New password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(event) => {
                  setFormData((current) => ({ ...current, password: event.target.value }));
                  setError("");
                }}
                required
                disabled={isSubmitting}
                showPasswordToggle
              />
              <Input
                label="Confirm new password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(event) => {
                  setFormData((current) => ({ ...current, confirmPassword: event.target.value }));
                  setError("");
                }}
                required
                disabled={isSubmitting}
                showPasswordToggle
              />
            </>
          )}
          <Button
            type="submit"
            loading={isSubmitting}
            loadingText={isVerified ? "Resetting password" : "Verifying code"}
            className="w-full"
          >
            {isVerified ? "Reset password" : "Verify code"}
          </Button>
        </form>

        {!isVerified && (
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending || isSubmitting || !isValidEmail(email)}
            className="mt-4 min-h-11 w-full rounded-xl px-3 text-center text-sm font-semibold theme-primary-text transition theme-hover-neutral disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending
              ? "Sending code..."
              : cooldown > 0
                ? `Send another code in ${cooldown}s`
                : "Send verification code"}
          </button>
        )}
      </section>
    </main>
  );
};

export default ResetPassword;

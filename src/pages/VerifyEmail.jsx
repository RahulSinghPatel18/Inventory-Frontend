import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "../components/auth/AuthLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import authService from "../services/authService";
import useAuth from "../hooks/useAuth";
import { isValidEmail } from "../utils/validators";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyRegistrationOtp } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(() => (
    Math.max(0, Math.ceil(((location.state?.resendAfter || 0) - Date.now()) / 1000))
  ));

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timeout = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [cooldown]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
      setError("Enter a valid email address and the 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await verifyRegistrationOtp(email.trim(), otp);
      toast.success("Email verified. Your account is ready.");
      navigate(data.user.mustChangePassword ? "/change-password" : "/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to verify the code. Request a new code and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!isValidEmail(email) || cooldown > 0 || isResending) return;
    setError("");
    setIsResending(true);
    try {
      const data = await authService.resendRegistrationOtp(email.trim());
      toast.success(data.message);
      setOtp("");
      setCooldown(60);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to resend the code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="One last step"
      title="Verify your email"
      description="Enter the 6-digit code sent to your email. It expires in 10 minutes."
      footer={(
        <p className="mt-5 text-center text-sm text-slate-500">
          <Link to="/register" className="font-semibold theme-primary-text hover:underline">Back to registration</Link>
        </p>
      )}
    >
      <form onSubmit={handleVerify} className="space-y-4">
        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-sm text-red-700">
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <Input
          label="Email address"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          disabled={isSubmitting || isResending}
        />
        <Input
          label="6-digit verification code"
          name="otp"
          type="text"
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          autoComplete="one-time-code"
          inputMode="numeric"
          required
          autoFocus
          disabled={isSubmitting || isResending}
        />
        <Button type="submit" loading={isSubmitting} loadingText="Verifying..." className="w-full">
          Verify and create account
        </Button>
      </form>
      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || isResending || !isValidEmail(email)}
        className="mt-4 w-full text-center text-sm font-semibold theme-primary-text disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isResending ? "Sending code..." : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend verification code"}
      </button>
    </AuthLayout>
  );
};

export default VerifyEmail;

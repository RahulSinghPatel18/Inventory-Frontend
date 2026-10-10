import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Button from "../components/common/Button";
import BrandLogo from "../components/common/BrandLogo";
import Input from "../components/common/Input";
import authService from "../services/authService";
import { isValidEmail } from "../utils/validators";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authService.forgotPassword(email.trim());
      toast.success(data.message);
      const resendAfter = Date.now() + 60_000;
      const params = new URLSearchParams({
        email: email.trim(),
        resendAfter: String(resendAfter)
      });
      navigate(`/reset-password?${params}`, { state: { resendAfter } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to request a password reset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="theme-page-background flex min-h-dvh items-center justify-center p-4">
      <section className="theme-surface theme-shadow-lg w-full max-w-md rounded-2xl p-6 sm:p-8">
        <Link to="/login" className="mb-6 inline-flex">
          <BrandLogo size="md" showMark={false} />
        </Link>
        <h1 className="text-2xl font-bold theme-text-primary">Forgot password?</h1>
        <p className="mt-2 text-sm theme-text-muted">
          Enter your account email and we’ll send a verification code if it matches an account.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <p role="alert" className="rounded-lg theme-danger-soft p-3 text-sm theme-danger">{error}</p>}
          <Input
            label="Email address"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={isSubmitting}
            autoFocus
          />
          <Button type="submit" loading={isSubmitting} loadingText="Sending code" className="w-full">
            Send verification code
          </Button>
        </form>
        <p className="mt-6 text-center text-sm theme-text-muted">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold theme-primary-text hover:underline">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPassword;

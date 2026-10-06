import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Button from "../components/common/Button";
import BrandLogo from "../components/common/BrandLogo";
import Input from "../components/common/Input";
import useAuth from "../hooks/useAuth";
import { isStrongPassword } from "../utils/validators";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { changePassword, logout, user } = useAuth();
  const mustChangePassword = Boolean(user?.mustChangePassword);
  const [formData, setFormData] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    if (error) setError("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");
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
      await changePassword({
        currentPassword: formData.currentPassword,
        password: formData.password
      });
      toast.success("Password changed successfully");
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to change your password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="theme-page-background flex min-h-dvh items-center justify-center px-4 py-6 sm:p-8">
      <section className="theme-surface theme-shadow-lg w-full max-w-lg rounded-2xl border theme-border p-5 sm:p-8">
        <div className="mb-6 flex min-h-11 items-center justify-between gap-3">
          {!mustChangePassword ? (
            <Link
              to="/settings"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium theme-text-secondary transition theme-hover-neutral hover:theme-primary-text"
            >
              <ArrowLeft size={16} />
              Back to Settings
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm font-medium theme-text-muted">
              <ShieldCheck size={17} />
              Secure your account
            </span>
          )}
          {mustChangePassword && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium theme-text-secondary transition theme-hover-neutral"
            >
              <LogOut size={16} />
              Sign out
            </button>
          )}
        </div>

        <Link to="/" className="mb-6 inline-flex">
          <BrandLogo size="md" />
        </Link>

        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl theme-primary-soft theme-primary-text">
            <KeyRound size={21} />
          </span>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-xl font-bold tracking-tight theme-text-primary sm:text-2xl">
              Change your password
            </h1>
            <p className="mt-1 text-sm leading-6 theme-text-muted">
              {mustChangePassword
                ? "Set a new password to continue to your workspace."
                : "Choose a new password to keep your account secure."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mustChangePassword && (
            <p className="rounded-xl border theme-info-soft p-3 text-sm leading-5 theme-text-secondary">
              Your current password is temporary. Change it before continuing.
            </p>
          )}
          {error && (
            <p role="alert" aria-live="polite" className="rounded-xl theme-danger-soft p-3 text-sm leading-5 theme-danger">
              {error}
            </p>
          )}
          <Input
            label="Current or temporary password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={formData.currentPassword}
            onChange={updateField("currentPassword")}
            required
            disabled={isSubmitting}
            showPasswordToggle
          />
          <Input
            label="New password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={updateField("password")}
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
            onChange={updateField("confirmPassword")}
            required
            disabled={isSubmitting}
            showPasswordToggle
          />
          <p className="text-xs leading-5 theme-text-muted">
            Use at least 8 characters with uppercase and lowercase letters, a number, and a symbol (maximum 72 UTF-8 bytes).
          </p>
          <Button type="submit" loading={isSubmitting} loadingText="Updating password" className="w-full">
            Change password
          </Button>
        </form>
      </section>
    </main>
  );
};

export default ChangePassword;

import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Building2, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "../components/auth/AuthLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import useAuth from "../hooks/useAuth";
import { isRequired } from "../utils/validators";

const CreateOrganization = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, registerGoogleOrganization } = useAuth();
  const registrationToken = location.state?.registrationToken;
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!isRequired(organizationName) || organizationName.trim().length > 120) {
      setError("Enter an organization name no longer than 120 characters.");
      return;
    }
    if (!registrationToken) {
      setError("Your Google registration session is missing or expired. Start again from registration.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerGoogleOrganization({
        registrationToken,
        organizationName: organizationName.trim()
      });
      toast.success("Organization created. Welcome to MYStockHHub.");
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create your organization. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      eyebrow="Google account verified"
      title="Create your organization"
      description="Choose a name for your workspace to finish setting up your account."
      footer={(
        <p className="mt-5 text-center text-sm text-slate-500">
          <Link to="/register" className="font-semibold theme-primary-text hover:underline">Back to registration</Link>
        </p>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-sm text-red-700">
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900">
          <Building2 size={19} className="shrink-0" />
          <p>Your verified Google identity will be used for the administrator account.</p>
        </div>
        <Input
          label="Organization name"
          name="organizationName"
          value={organizationName}
          onChange={(event) => {
            setOrganizationName(event.target.value);
            setError("");
          }}
          placeholder="Your business name"
          autoComplete="organization"
          required
          autoFocus
          disabled={isSubmitting}
          maxLength={120}
        />
        <Button type="submit" loading={isSubmitting} loadingText="Creating organization..." className="w-full">
          Create organization
        </Button>
      </form>
    </AuthLayout>
  );
};

export default CreateOrganization;

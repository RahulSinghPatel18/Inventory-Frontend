import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import { hasPermission } from "../utils/permissions";

const ProtectedRoute = ({ children, allowPasswordChange = false, adminOnly = false, permission }) => {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) return <Loader message="Loading your account..." />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword && !allowPasswordChange) {
    return <Navigate to="/change-password" replace />;
  }
  if (adminOnly && String(user.role || "").toLowerCase() !== "admin") {
    return <AccessDenied />;
  }
  if (permission && !(allowPasswordChange && user.mustChangePassword) && !hasPermission(user, permission)) {
    return <AccessDenied />;
  }

  return children;
};

const AccessDenied = () => (
  <main className="flex min-h-dvh items-center justify-center p-6 theme-background">
    <section className="w-full max-w-md rounded-2xl border theme-border theme-surface p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide theme-danger">403 · Access denied</p>
      <h1 className="mt-2 text-2xl font-bold theme-text-primary">You don’t have access to this page</h1>
      <p className="mt-2 text-sm theme-text-muted">Ask your organization administrator to grant the required permission.</p>
    </section>
  </main>
);

export default ProtectedRoute;
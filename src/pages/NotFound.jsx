import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileQuestion } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

const REDIRECT_DELAY_SECONDS = 3;

const NotFound = () => {
const navigate = useNavigate();
const [secondsRemaining, setSecondsRemaining] = useState(REDIRECT_DELAY_SECONDS);

useEffect(() => {
const interval = window.setInterval(() => {
setSecondsRemaining((seconds) => Math.max(seconds - 1, 0));
}, 1000);


const redirectTimer = window.setTimeout(() => {
  navigate("/dashboard", { replace: true });
}, REDIRECT_DELAY_SECONDS * 1000);

return () => {
  window.clearInterval(interval);
  window.clearTimeout(redirectTimer);
};


}, [navigate]);

const progress = ((REDIRECT_DELAY_SECONDS - secondsRemaining) / REDIRECT_DELAY_SECONDS) * 100;

return ( <main className="theme-page-background flex min-h-dvh items-center justify-center px-6 py-12">
<EmptyState
icon={FileQuestion}
headingLevel="h1"
title="Page not found"
message="The page you’re looking for doesn’t exist or may have moved."
className="min-h-0"
action={( <div className="flex flex-col items-center"> <Link
           to="/dashboard"
           className="theme-primary-action-bg inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
         > <ArrowLeft size={16} />
Back to dashboard </Link>


        <div className="mt-4 w-40">
          <div className="flex justify-between text-[11px] theme-text-muted">
            <span>Redirecting</span>
            <span>{secondsRemaining}s</span>
          </div>

          <div className="theme-surface-secondary mt-1.5 h-1 overflow-hidden rounded-full">
            <div
              className="theme-primary-bg h-full rounded-full transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )}
  />
</main>


);
};

export default NotFound;

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <main className="theme-page-background flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl text-center">
        <img
          src="/not_found.png"
          alt="Page not found"
          className="mx-auto h-[min(48vh,460px)] w-full object-contain"
        />

        

        <Link
          to="/dashboard"
          className="theme-primary-action-bg inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
        >
          <ArrowLeft size={16} />
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
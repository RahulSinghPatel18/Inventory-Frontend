import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="
          flex
          items-center
          gap-3
          rounded-lg
          px-2
          py-1.5
          transition
          theme-hover-neutral
        "
      >
        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            theme-primary-bg
            text-sm
            font-semibold
            text-white
          "
        >
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium theme-text-primary">
            {user?.name || "User"}
          </p>

          <p className="text-xs theme-text-muted">
            {user?.role || "user"}
          </p>
        </div>

        <span className="hidden text-xs theme-text-muted sm:block">
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          className="
            absolute
            right-0
            top-12
            z-50
            w-48
            rounded-xl
            border
            theme-border-subtle
            theme-surface
            p-2
            shadow-lg
          "
        >
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              navigate("/profile");
            }}
            className="
              w-full
              rounded-lg
              px-3
              py-2
              text-left
              text-sm
              theme-text-secondary
              theme-hover-surface
            "
          >
            Profile
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full
              rounded-lg
              px-3
              py-2
              text-left
              text-sm
              theme-danger
              theme-hover-danger
            "
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
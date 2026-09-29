import { NavLink } from "react-router-dom";

import appConfig from "../../config/appConfig";
import navigation from "../../config/navigation";

const MobileSidebar = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">

      {/* Overlay */}
      <div
        className="absolute inset-0 theme-overlay"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className="
          relative
          z-10
          flex
          h-full
          w-72
          max-w-[85%]
          flex-col
          theme-surface
          shadow-2xl
        "
      >

        <div className="flex h-16 items-center justify-between border-b theme-border-subtle px-5">

          <div className="flex items-center gap-3">

            <img
              src={appConfig.logo}
              alt={appConfig.appName}
              className="h-9 w-9"
            />

            <div>
              <p className="text-sm font-bold theme-text-primary">
                {appConfig.appName}
              </p>

              <p className="text-xs theme-text-muted">
                {appConfig.tagline}
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl theme-text-muted theme-hover-text-secondary"
          >
            ✕
          </button>

        </div>

        <nav className="flex-1 space-y-1 p-4">

          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                block
                rounded-lg
                px-3
                py-2.5
                text-sm
                font-medium
                transition
                ${
                  isActive
                    ? "theme-primary-soft theme-primary-text"
                    : "theme-text-secondary theme-hover-surface"
                }
              `}
            >
              {item.label}
            </NavLink>
          ))}

        </nav>

      </aside>

    </div>
  );
};

export default MobileSidebar;
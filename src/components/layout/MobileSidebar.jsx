import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

import BrandLogo from "../common/BrandLogo";
import appConfig from "../../config/appConfig";
import navigation from "../../config/navigation";
import useAuth from "../../hooks/useAuth";
import { hasPermission } from "../../utils/permissions";

const MobileSidebar = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const canAccess = (item) => (
    (!item.adminOnly || String(user?.role || "").toLowerCase() === "admin") &&
    (!item.permission || hasPermission(user, item.permission))
  );
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
          h-dvh
          w-72
          max-w-[85%]
          flex-col
        border-r theme-border
        theme-surface
        shadow-2xl
        "
      >

        <div className="flex h-16 items-center justify-between border-b theme-border-subtle px-5">

          <div>
            <BrandLogo size="sm" showMark={false} />
            <div>
              <p className="text-xs theme-text-muted">
                {appConfig.tagline}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl theme-text-muted theme-hover-neutral theme-hover-text-secondary"
          >
            <X size={19} />
          </button>

        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-4" aria-label="Main navigation">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] theme-text-muted">Main menu</p>

          {navigation
            .filter(canAccess)
            .map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                    flex min-h-11 items-center gap-3 rounded-xl border border-transparent px-3 text-sm font-medium transition
                    ${
                      isActive
                        ? "theme-primary-soft theme-primary-text ring-1 ring-inset theme-border"
                        : "theme-text-secondary theme-hover-surface"
                    }
                  `}
                >
                  {Icon && <Icon size={18} aria-hidden="true" />}
                  {item.label}
                  </NavLink>
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;
                    return <NavLink
                      key={child.path}
                      to={child.path}
                      onClick={onClose}
                      className={({ isActive }) => `ml-7 flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition ${isActive ? "theme-primary-soft theme-primary-text" : "theme-text-muted theme-hover-surface"}`}
                    >
                      {ChildIcon && <ChildIcon size={16} aria-hidden="true" />}
                      {child.label}
                    </NavLink>;
                  })}
                </div>
              );
            })}

        </nav>

      </aside>

    </div>
  );
};

export default MobileSidebar;
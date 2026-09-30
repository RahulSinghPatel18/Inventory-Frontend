import { NavLink } from "react-router-dom";
import { PanelRight, PanelLeft } from "lucide-react";
import appConfig from "../../config/appConfig";
import navigation from "../../config/navigation";
import useAuth from "../../hooks/useAuth";

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user } = useAuth();
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <aside
      className="
        hidden
        sticky
        top-16
        shrink-0
        self-start
        h-[calc(100vh-4rem)]
        overflow-y-auto
        border-r
        theme-border
        theme-surface
        transition-[width]
        duration-300
        ease-in-out
        lg:block
      "
      style={{ width: isCollapsed ? "76px" : "256px" }}
    >
      <div className="flex min-h-full flex-col">
        <div className={`flex h-16 shrink-0 items-center border-b theme-border-subtle ${isCollapsed ? "justify-center px-2" : "justify-between px-5"}`}>
          {!isCollapsed && (
            <p className="max-w-36 text-xs font-medium leading-snug theme-text-muted">
              {appConfig.tagline}
            </p>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-text-muted transition-colors duration-200 theme-hover-neutral theme-hover-text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {isCollapsed ? <PanelRight size={19} /> : <PanelLeft size={19} />}
          </button>
        </div>

        <nav className={`flex-1 ${isCollapsed ? "px-2 py-4" : "px-3 py-4"}`}>
          {!isCollapsed && (
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
              Workspace
            </p>
          )}
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) => `
                  group relative mb-1 flex h-12 items-center
                  overflow-hidden rounded-lg
                  text-sm font-medium
                  transition-[background-color,color,padding] duration-200
                  ${isCollapsed ? "justify-center px-0" : "gap-3 px-3.5"}
                  ${
                    isActive
                      ? "theme-primary-soft theme-primary-text shadow-sm"
                      : "theme-text-secondary theme-hover-surface theme-hover-text-primary"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full theme-primary-bg" />
                    )}

                    <span
                      className={`
                        flex h-9 w-9 shrink-0 items-center justify-center
                        rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? "theme-surface theme-primary-text shadow-sm"
                            : "theme-surface-secondary theme-text-muted theme-group-hover-surface theme-group-hover-primary-text"
                        }
                      `}
                    >
                      <Icon
                        size={19}
                        strokeWidth={isActive ? 2.2 : 1.8}
                        className="
                          transition-transform
                          duration-200
                          group-hover:scale-110
                        "
                      />
                    </span>

                    <span className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ${isCollapsed ? "max-w-0 -translate-x-2 opacity-0" : "max-w-40 translate-x-0 opacity-100"}`}>
                      {item.label}
                    </span>

                    {isActive && !isCollapsed && (
                      <span className="h-2 w-2 rounded-full theme-primary-bg shadow-sm" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className={`shrink-0 border-t theme-border-subtle ${isCollapsed ? "p-3" : "p-4"}`}>
          <NavLink
            to="/profile"
            title={isCollapsed ? user?.name || "Profile" : undefined}
            className={`flex min-w-0 items-center rounded-lg theme-hover-surface ${isCollapsed ? "justify-center p-1.5" : "gap-3 p-2"}`}
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full theme-primary-soft text-sm font-semibold theme-primary-text">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
              ) : userInitial}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 theme-surface theme-primary-bg" />
            </span>
            {!isCollapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium theme-text-primary">{user?.name || "Your profile"}</span>
                <span className="block truncate text-xs capitalize theme-text-muted">{user?.role || "Workspace member"}</span>
              </span>
            )}
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
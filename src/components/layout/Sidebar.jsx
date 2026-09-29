import { NavLink } from "react-router-dom";
import navigation from "../../config/navigation";

const Sidebar = () => {
  return (
    <aside
      className="
        hidden
        w-64
        shrink-0
        border-r
        theme-border
        theme-surface
        lg:block
      "
    >
      <div className="sticky top-0 flex h-screen flex-col">

        <nav className="flex-1 space-y-2 p-4">

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  group relative flex items-center gap-3
                  overflow-hidden rounded-xl px-3.5 py-3
                  text-sm font-medium
                  transition-all duration-200
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
                        flex h-9 w-9 items-center justify-center
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

                    <span className="flex-1">
                      {item.label}
                    </span>

                    {isActive && (
                      <span className="h-2 w-2 rounded-full theme-primary-bg shadow-sm" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

        </nav>

      </div>
    </aside>
  );
};

export default Sidebar;
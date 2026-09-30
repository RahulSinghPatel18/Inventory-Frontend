import appConfig from "../../config/appConfig";
import UserMenu from "./UserMenu";
import useUiStore from "../../store/uiStore";
import { Menu, Bell, Sun, Moon } from "lucide-react";

const Navbar = ({ onMenuClick }) => {
const { theme, toggleTheme } = useUiStore();

return ( <header className="sticky top-0 z-40 border-b theme-border theme-surface-glass"> <div className="flex h-16 items-center justify-between px-4 sm:px-6">


    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg theme-text-secondary theme-hover-neutral lg:hidden"
      >
        <Menu size={21} />
      </button>

      <div className="flex items-center gap-2.5">
        <img
          src={appConfig.logo}
          alt={appConfig.appName}
          className="h-9 w-9"
        />

        <div className="hidden sm:block">
          <p className="text-sm font-bold leading-tight theme-text-primary">
            {appConfig.appName}
          </p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">

      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="flex h-9 w-9 items-center justify-center rounded-lg theme-text-muted transition theme-hover-neutral theme-hover-text-primary"
      >
        {theme === "light" ? (
          <Moon size={19} />
        ) : (
          <Sun size={19} />
        )}
      </button>

      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg theme-text-muted theme-hover-neutral theme-hover-text-primary"
      >
        <Bell size={19} />
      </button>

      <UserMenu />

    </div>
  </div>
</header>


);
};

export default Navbar;

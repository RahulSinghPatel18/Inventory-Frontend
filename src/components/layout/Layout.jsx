import { useCallback, useState } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

const Layout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);
  const closeMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">

      <Navbar
        onMenuClick={() => setIsMobileSidebarOpen(true)}
      />

      <div className="flex min-h-0 flex-1">

        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>

      </div>

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
      />

    </div>
  );
};

export default Layout;
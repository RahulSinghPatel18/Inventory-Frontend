import { useState } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

const Layout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  return (
    <div className="min-h-dvh overflow-x-hidden">

      <Navbar
        onMenuClick={() => setIsMobileSidebarOpen(true)}
      />

      <div className="flex items-start">

        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        />

        <main className="min-w-0 flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>

      </div>

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

    </div>
  );
};

export default Layout;
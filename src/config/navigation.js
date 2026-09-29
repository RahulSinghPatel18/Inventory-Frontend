import {
  LayoutDashboard,
  Package,
  UserCircle,
  Settings,
  BarChart3
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard
  },
  {
    label: "Products",
    path: "/products",
    icon: Package
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3
  },
  {
    label: "Profile",
    path: "/profile",
    icon: UserCircle
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings
  }
];

export default navigation;
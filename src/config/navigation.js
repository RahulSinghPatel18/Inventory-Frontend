import {
  LayoutDashboard,
  Package,
  FolderKanban,
  UserCircle,
  Settings,
  BarChart3,
  ArrowLeftRight
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
    label: "Stock",
    path: "/stock",
    icon: ArrowLeftRight
  },
  {
    label: "Categories",
    path: "/categories",
    icon: FolderKanban
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
import {
  LayoutDashboard,
  Package,
  FolderKanban,
  UserCircle,
  Settings,
  BarChart3,
  ArrowLeftRight,
  Users,
  ShoppingCart,
  WalletCards
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    permission: ["dashboard.view", "dashboard.statistics"]
  },
  {
    label: "Products",
    path: "/products",
    icon: Package,
    permission: ["products.view", "products.create", "products.update", "products.delete"]
  },
  {
    label: "Stock",
    path: "/stock",
    icon: ArrowLeftRight,
    permission: ["stock.view", "stock.in", "stock.out", "stock.history", "stock.low-stock", "stock.out-of-stock", "reports.stock"]
  },
  {
    label: "Sales",
    path: "/sales",
    icon: ShoppingCart,
    permission: ["sales.view", "sales.create", "sales.statistics"]
  },
  {
    label: "Udhaar Khata",
    path: "/udhaar",
    icon: WalletCards,
    permission: ["udhaar.view", "udhaar.create", "udhaar.statistics"]
  },
  {
    label: "Categories",
    path: "/categories",
    icon: FolderKanban,
    permission: ["categories.view", "categories.create", "categories.update", "categories.delete"]
  },
  {
    label: "Members",
    path: "/members",
    icon: Users,
    adminOnly: true
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    permission: ["reports.view", "reports.products", "reports.stock", "reports.sales", "reports.udhaar"]
  },
  {
    label: "Profile",
    path: "/profile",
    icon: UserCircle,
    permission: ["profile.view", "profile.update"]
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
    permission: ["profile.view", "profile.change-password", "profile.two-factor"]
  }
];

export default navigation;
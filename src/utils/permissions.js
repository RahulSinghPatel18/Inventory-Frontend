export const DEFAULT_MEMBER_PERMISSIONS = [
  "dashboard.view",
  "products.view",
  "products.details",
  "stock.view",
  "sales.view",
  "udhaar.view",
  "customers.view",
  "notifications.view",
  "profile.view",
  "profile.update",
  "profile.change-password",
  "profile.two-factor"
];

export const permissionGroups = [
  {
    label: "Dashboard",
    items: [["dashboard.view", "View Dashboard"], ["dashboard.statistics", "View Dashboard Statistics"]]
  },
  {
    label: "Products",
    items: [
      ["products.view", "View Products"], ["products.details", "View Product Details"],
      ["products.create", "Create Product"], ["products.update", "Edit Product"],
      ["products.delete", "Delete Product"], ["products.statistics", "View Product Statistics"]
    ]
  },
  {
    label: "Categories",
    items: [
      ["categories.view", "View Categories"], ["categories.create", "Create Category"],
      ["categories.update", "Edit Category"], ["categories.delete", "Delete Category"],
      ["categories.statistics", "View Category Statistics"]
    ]
  },
  {
    label: "Stock",
    items: [
      ["stock.view", "View Stock"], ["stock.in", "Stock In"], ["stock.out", "Stock Out"],
      ["stock.history", "View Stock History"], ["stock.low-stock", "View Low Stock"],
      ["stock.out-of-stock", "View Out of Stock"], ["stock.statistics", "View Stock Statistics"]
    ]
  },
  {
    label: "Sales",
    items: [
      ["sales.view", "View Sales"], ["sales.create", "Create Sale"],
      ["sales.details", "View Sale Details"], ["sales.cancel", "Delete/Cancel Sale"],
      ["sales.statistics", "View Sales Statistics"]
    ]
  },
  {
    label: "Udhaar",
    items: [
      ["udhaar.view", "View Udhaar"], ["udhaar.create", "Create Udhaar"],
      ["udhaar.details", "View Udhaar Details"], ["udhaar.update", "Edit Udhaar"],
      ["udhaar.cancel", "Delete/Cancel Udhaar"], ["udhaar.statistics", "View Udhaar Statistics"]
    ]
  },
  {
    label: "Customers",
    items: [
      ["customers.view", "View Customers"], ["customers.details", "View Customer Details"],
      ["customers.create", "Create Customer"], ["customers.update", "Edit Customer"],
      ["customers.delete", "Delete Customer"], ["customers.ledger", "View Customer Ledger"]
    ]
  },
  {
    label: "Payments",
    items: [
      ["payments.create", "Record Payment"], ["payments.history", "View Payment History"],
      ["payments.details", "View Payment Details"]
    ]
  },
  {
    label: "Users",
    items: [
      ["users.view", "View Members"], ["users.create", "Create Member"],
      ["users.update", "Edit Member"], ["users.delete", "Delete Member"],
      ["users.reset-password", "Reset Member Password"],
      ["users.manage-permissions", "Manage Member Permissions"]
    ]
  },
  {
    label: "Profile",
    items: [
      ["profile.view", "View Profile"], ["profile.update", "Edit Profile"],
      ["profile.change-password", "Change Password"], ["profile.two-factor", "Manage 2FA"]
    ]
  },
  {
    label: "Notifications",
    items: [["notifications.view", "View notifications"]]
  },
  {
    label: "Organization",
    items: [
      ["organization.view", "View Organization"], ["organization.update", "Edit Organization"],
      ["organization.delete", "Delete Organization"]
    ]
  },
  {
    label: "Reports",
    items: [
      ["reports.view", "View Reports"], ["reports.sales", "Sales Reports"],
      ["reports.udhaar", "Udhaar Reports"], ["reports.stock", "Stock Reports"],
      ["reports.payments", "Payment Reports"], ["reports.products", "Product Reports"],
      ["reports.users", "User Reports"]
    ]
  }
];

const legacyPermissionKeys = {
  "customers.edit": "customers.update",
  "udhaar.edit": "udhaar.update",
  "udhaar.record-payment": "payments.create",
  "udhaar.payment-history": "payments.history",
  "analytics.sales": "sales.statistics",
  "analytics.udhaar": "udhaar.statistics"
};

const permissionAliases = {
  "customers.update": ["customers.edit"],
  "udhaar.update": ["udhaar.edit"],
  "payments.create": ["udhaar.record-payment"],
  "payments.history": ["udhaar.payment-history"],
  "sales.statistics": ["analytics.sales"],
  "udhaar.statistics": ["analytics.udhaar"]
};

export const normalizePermissions = (permissions) => [...new Set(
  (Array.isArray(permissions) ? permissions : DEFAULT_MEMBER_PERMISSIONS)
    .map((permission) => legacyPermissionKeys[permission] || permission)
)];

export const hasPermission = (user, requiredPermissions) => {
  if (String(user?.role || "").toLowerCase() === "admin") return true;
  const assigned = Array.isArray(user?.permissions)
    ? user.permissions
    : DEFAULT_MEMBER_PERMISSIONS;
  const required = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return required.some((permission) => (
    assigned.includes(permission) ||
    (permissionAliases[permission] || []).some((alias) => assigned.includes(alias))
  ));
};

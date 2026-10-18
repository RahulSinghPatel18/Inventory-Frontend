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
    items: [
      ["dashboard.view", "Open dashboard", "Dashboard page access"],
      ["dashboard.statistics", "View dashboard statistics", "Product/category stats, stock summary, sales and Udhaar analytics APIs"]
    ]
  },
  {
    label: "Products",
    items: [
      ["products.view", "View products", "GET /products/GetAll · GET /api/v1/export/products · category lookups"],
      ["products.details", "View product details", "GET /products/GetById/:id"],
      ["products.create", "Create products", "POST /products/Create · product and category lookups"],
      ["products.update", "Edit products", "PUT /products/Update/:id"],
      ["products.delete", "Delete products", "DELETE /products/Delete/:id"],
      ["products.statistics", "View product statistics", "GET /products/Stats"]
    ]
  },
  {
    label: "Categories",
    items: [
      ["categories.view", "View categories", "GET /categories/GetAll · GET /categories/GetById/:id"],
      ["categories.create", "Create categories", "POST /categories/Create · category list"],
      ["categories.update", "Edit categories", "PUT /categories/Update/:id · category list"],
      ["categories.delete", "Delete categories", "DELETE /categories/Delete/:id · category list"],
      ["categories.statistics", "View category statistics", "GET /categories/Stats"]
    ]
  },
  {
    label: "Stock",
    items: [
      ["stock.view", "View stock summary", "GET /stock/Summary"],
      ["stock.in", "Record stock received", "POST /stock/In · product lookup"],
      ["stock.out", "Record stock removed", "POST /stock/Out · product lookup"],
      ["stock.history", "View stock history", "GET /stock/History · GET /api/v1/export/stock-history"],
      ["stock.low-stock", "View low-stock items", "GET /stock/LowStock"],
      ["stock.out-of-stock", "View out-of-stock items", "GET /stock/OutOfStock"],
      ["stock.statistics", "View stock statistics", "GET /stock/Summary"]
    ]
  },
  {
    label: "Sales",
    items: [
      ["sales.view", "View sales", "GET /sales · GET /api/v1/export/sales"],
      ["sales.create", "Create sales", "POST /sales · product lookup"],
      ["sales.details", "View sale details", "GET /sales/:id"],
      ["sales.cancel", "Cancel sales", "POST /sales/:id/cancel"],
      ["sales.statistics", "View sales analytics", "GET /sales/analytics"]
    ]
  },
  {
    label: "Udhaar",
    items: [
      ["udhaar.view", "View Udhaar records", "GET /udhaar · GET /udhaar/customers · GET /api/v1/export/udhaar"],
      ["udhaar.create", "Create Udhaar records", "POST /udhaar · product lookup"],
      ["udhaar.details", "View Udhaar details", "GET /udhaar/:id"],
      ["udhaar.update", "Edit Udhaar records", "PUT /udhaar/:id"],
      ["udhaar.cancel", "Cancel Udhaar records", "POST /udhaar/:id/cancel"],
      ["udhaar.statistics", "View Udhaar analytics", "GET /udhaar/stats"]
    ]
  },
  {
    label: "Customers",
    items: [
      ["customers.view", "View customers", "GET /customers · GET /customers/:id · GET /udhaar/customers"],
      ["customers.details", "View customer details", "GET /customers/:id (also granted by View customers)"],
      ["customers.create", "Create customers", "POST /customers · POST /udhaar/customers"],
      ["customers.update", "Edit customers", "PUT /customers/:id · PUT /udhaar/customers/:id"],
      ["customers.delete", "Archive customers", "DELETE /customers/:id"],
      ["customers.ledger", "View customer ledger", "GET /customers/:id/ledger · GET /udhaar/customers/:id/ledger"]
    ]
  },
  {
    label: "Payments",
    items: [
      ["payments.create", "Record customer payments", "POST /customers/:id/payments · POST /udhaar/customers/:customerId/payments"],
      ["payments.history", "View payment history", "GET /customers/:id/payments · GET /udhaar/customers/:id/payments · payment details in ledgers"]
    ]
  },
  {
    label: "Profile",
    items: [
      ["profile.view", "View profile", "GET /users/Profile"],
      ["profile.update", "Edit profile", "PUT /users/UpdateProfile"],
      ["profile.change-password", "Change password", "PUT /users/ChangePassword"],
      ["profile.two-factor", "Manage two-step verification", "PUT /users/TwoFactor"],
      ["organization.view", "View organization details", "GET /users/Profile"]
    ]
  },
  {
    label: "Notifications",
    items: [["notifications.view", "View notifications", "GET /notifications · PATCH /notifications/:id/read"]]
  },
  {
    label: "Reports",
    items: [
      ["reports.view", "Open reports page", "Page access only; grant a report below to expose report data"],
      ["reports.products", "View product reports", "Product/category report APIs · product export"],
      ["reports.stock", "View stock reports", "Stock history, summary and movement APIs · stock export"],
      ["reports.sales", "View sales reports", "GET /sales/analytics · sales export"],
      ["reports.udhaar", "View Udhaar reports", "GET /udhaar/stats · GET /customers/stats · Udhaar export"]
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
    .filter((permission) => permissionGroups.some(({ items }) => items.some(([key]) => key === permission)))
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

const ProductStats = ({ stats, loading, error }) => {
  const items = [
    ["Total Products", stats?.totalProducts],
    ["Total Stock", stats?.totalStock],
    ["Inventory Value", stats ? `₹${stats.totalInventoryValue.toLocaleString("en-IN")}` : "—"],
    ["Low Stock Products", stats?.lowStockProducts]
  ];

  return (
    <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border theme-border theme-surface p-5 shadow-sm">
          <p className="text-sm theme-text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold theme-text-primary">
            {loading || error ? "—" : value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ProductStats;

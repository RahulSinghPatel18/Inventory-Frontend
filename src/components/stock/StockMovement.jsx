import { ArrowDownToLine, ArrowUpFromLine, Package, TrendingDown, TrendingUp } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";

const StockMovement = ({
  products,
  productsLoading,
  productsError,
  onRetryProducts,
  selectedProductId,
  onProductChange,
  selectedProduct,
  summary,
  summaryLoading,
  movementType,
  onMovementTypeChange,
  quantity,
  onQuantityChange,
  onSubmit,
  saving
}) => {
  const cards = [
    ["Current stock", summary?.product?.currentStock, Package],
    ["Total stock in", summary?.summary?.totalStockIn, TrendingUp],
    ["Total stock out", summary?.summary?.totalStockOut, TrendingDown]
  ];

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border theme-border theme-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm theme-text-muted">{label}</p>
              <Icon size={18} className="theme-text-muted" />
            </div>
            <p className="mt-2 text-2xl font-bold theme-text-primary">
              {productsLoading || summaryLoading ? "—" : value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      <section className="mb-6 rounded-2xl border theme-border theme-surface p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold theme-text-primary">Record stock movement</h2>
          <p className="mt-1 text-sm theme-text-muted">
            {selectedProduct
              ? `${selectedProduct.name} · ${selectedProduct.quantity} currently available`
              : "Select a product to record a movement"}
          </p>
        </div>

        <div className="mb-4 inline-flex rounded-xl border theme-border theme-surface-secondary p-1">
          {[
            ["in", "Stock In", ArrowDownToLine],
            ["out", "Stock Out", ArrowUpFromLine]
          ].map(([type, label, Icon]) => (
            <button
              key={type}
              type="button"
              aria-pressed={movementType === type}
              onClick={() => onMovementTypeChange(type)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${movementType === type ? (type === "in" ? "theme-success-soft theme-success" : "theme-warning-soft theme-warning") : "theme-text-muted theme-hover-surface"}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <Select
            label="Product"
            name="stockProduct"
            value={selectedProductId}
            onChange={(event) => onProductChange(event.target.value)}
            placeholder={productsLoading ? "Loading products..." : "Select a product"}
            options={products.map((product) => ({ value: product._id, label: product.name }))}
            disabled={productsLoading || products.length === 0 || saving}
          />
          <Input
            label="Quantity"
            name="quantity"
            type="number"
            min={1}
            step={1}
            value={quantity}
            onChange={(event) => onQuantityChange(event.target.value)}
            placeholder="Enter quantity"
            required
            disabled={!selectedProductId || saving}
          />
          <Button
            type="submit"
            loading={saving}
            loadingText="Saving movement..."
            disabled={!selectedProductId || !quantity}
            className="w-full sm:w-auto"
          >
            {movementType === "in" ? "Add stock" : "Remove stock"}
          </Button>
        </form>

        {productsError ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm theme-danger" role="alert">
            <span>{productsError}</span>
            <Button variant="outline" onClick={onRetryProducts}>Try again</Button>
          </div>
        ) : !productsLoading && products.length === 0 ? (
          <p className="mt-3 text-sm theme-text-muted">Add a product before recording stock movements.</p>
        ) : null}
      </section>
    </>
  );
};

export default StockMovement;

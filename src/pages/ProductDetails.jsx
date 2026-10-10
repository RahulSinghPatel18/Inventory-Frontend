import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeader from "../components/common/PageHeader";
import Spinner from "../components/common/Spinner";
import ProductImage from "../components/products/ProductImage";
import productService from "../services/productService";
import formatCurrency from "../utils/formatCurrency";

const ProductDetails = () => {
  const { id } = useParams();
  const [loadedProduct, setLoadedProduct] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    productService.getProductById(id)
      .then((data) => {
        if (active) {
          setLoadedProduct({ id, product: data.product });
          setLoadError(null);
        }
      })
      .catch((requestError) => {
        if (active) {
          setLoadError({
            id,
            message: requestError.response?.data?.message || "Unable to load this product."
          });
        }
      });
    return () => {
      active = false;
    };
  }, [id, retryCount]);

  const product = loadedProduct?.id === id ? loadedProduct.product : null;
  const error = loadError?.id === id ? loadError.message : "";
  const loading = !product && !error;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Product details"
          description="Product information and current inventory."
          action={<Link to="/products" className="text-sm font-medium theme-primary-text hover:underline">← All products</Link>}
        />
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center"><Spinner size="lg" /></div>
        ) : error ? (
          <div role="alert" className="rounded-xl border theme-danger-border theme-danger-soft p-4 text-sm theme-danger">
            <p>{error}</p>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="mt-3 min-h-10 rounded-lg border theme-danger-border px-3 font-semibold">Try again</button>
          </div>
        ) : product ? (
          <section className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm">
            <div className="grid gap-6 p-4 sm:grid-cols-[minmax(0,320px)_1fr] sm:gap-8 sm:p-7 lg:p-8">
              <ProductImage src={product.image} alt={product.name} className="aspect-square h-auto w-full rounded-2xl" />
              <div className="min-w-0 self-center">
                <p className="inline-flex rounded-full theme-neutral-soft px-3 py-1 text-xs font-semibold theme-text-secondary">{product.category?.name || "Uncategorized"}</p>
                <h2 className="mt-3 break-words text-2xl font-bold tracking-tight theme-text-primary sm:text-3xl">{product.name}</h2>
                <p className="mt-2 text-sm theme-text-muted">Current availability and inventory valuation for this product.</p>
                <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl theme-surface-secondary p-4">
                  <dt className="text-xs theme-text-muted">Unit price</dt>
                    <dd className="mt-1 text-lg font-semibold theme-text-primary">{formatCurrency(product.price)}</dd>
                  </div>
                  <div className="rounded-xl theme-surface-secondary p-4">
                  <dt className="text-xs theme-text-muted">Available stock</dt>
                    <dd className="mt-1 flex items-center gap-2 text-lg font-semibold theme-text-primary">
                      {product.quantity}
                      <span className={`rounded-full px-2.5 py-1 text-xs ${product.quantity === 0 ? "theme-danger-soft theme-danger" : product.quantity <= 5 ? "theme-warning-soft theme-warning" : "theme-success-soft theme-success"}`}>
                        {product.quantity === 0 ? "Out of stock" : product.quantity <= 5 ? "Low stock" : "In stock"}
                      </span>
                    </dd>
                  </div>
                  <div className="rounded-xl theme-surface-secondary p-4 sm:col-span-2">
                  <dt className="text-xs theme-text-muted">Inventory value</dt>
                    <dd className="mt-1 text-lg font-semibold theme-text-primary">{formatCurrency(product.price * product.quantity)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </Layout>
  );
};

export default ProductDetails;

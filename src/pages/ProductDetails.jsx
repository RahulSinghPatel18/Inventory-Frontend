import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeader from "../components/common/PageHeader";
import Spinner from "../components/common/Spinner";
import ProductImage from "../components/products/ProductImage";
import productService from "../services/productService";

const ProductDetails = () => {
  const { id } = useParams();
  const [loadedProduct, setLoadedProduct] = useState(null);
  const [loadError, setLoadError] = useState(null);

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
  }, [id]);

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
          <div role="alert" className="rounded-xl border theme-danger-border theme-danger-soft p-4 text-sm theme-danger">{error}</div>
        ) : product ? (
          <section className="grid gap-6 rounded-2xl border theme-border theme-surface p-5 shadow-sm sm:grid-cols-[minmax(0,240px)_1fr] sm:p-7">
            <ProductImage src={product.image} alt={product.name} className="aspect-square h-auto w-full rounded-2xl" />
            <div className="min-w-0 self-center">
              <p className="text-sm font-medium theme-text-muted">{product.category?.name || "Uncategorized"}</p>
              <h2 className="mt-2 break-words text-2xl font-bold theme-text-primary">{product.name}</h2>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl theme-surface-secondary p-4">
                  <dt className="text-xs theme-text-muted">Unit price</dt>
                  <dd className="mt-1 text-lg font-semibold theme-text-primary">₹{product.price}</dd>
                </div>
                <div className="rounded-xl theme-surface-secondary p-4">
                  <dt className="text-xs theme-text-muted">Available stock</dt>
                  <dd className="mt-1 text-lg font-semibold theme-text-primary">{product.quantity}</dd>
                </div>
                <div className="rounded-xl theme-surface-secondary p-4 sm:col-span-2">
                  <dt className="text-xs theme-text-muted">Inventory value</dt>
                  <dd className="mt-1 text-lg font-semibold theme-text-primary">₹{product.price * product.quantity}</dd>
                </div>
              </dl>
            </div>
          </section>
        ) : null}
      </div>
    </Layout>
  );
};

export default ProductDetails;

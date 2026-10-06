import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import Layout from "../components/layout/Layout";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import ProductModal from "../components/products/ProductModal";
import ProductStats from "../components/products/ProductStats";
import ProductFilters from "../components/products/ProductFilters";
import ProductResults from "../components/products/ProductResults";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useCategories from "../hooks/useCategories";
import useProducts from "../hooks/useProducts";
import productService from "../services/productService";
import useAuth from "../hooks/useAuth";
import { hasPermission } from "../utils/permissions";

const Products = () => {
  const { user } = useAuth();
  const canCreate = hasPermission(user, "products.create");
  const canUpdate = hasPermission(user, "products.update");
  const canDelete = hasPermission(user, "products.delete");
  const canViewStats = hasPermission(user, "products.statistics");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(canViewStats);
  const [statsError, setStatsError] = useState("");
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories
  } = useCategories();
  const { products, pagination, loading, error, refetch } = useProducts({
    name: debouncedSearch,
    category,
    sortBy,
    sortOrder,
    page
  });

  const getStats = useCallback(async () => {
    if (!canViewStats) return;
    try {
      setStatsLoading(true);
      setStatsError("");
      setStats(await productService.getProductStats());
    } catch (error) {
      const message = error.response?.data?.message || "Failed to load product statistics";
      setStatsError(message);
      toast.error(message);
    } finally {
      setStatsLoading(false);
    }
  }, [canViewStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    Promise.resolve().then(getStats);
  }, [getStats]);

  const refreshProducts = () => {
    refetch();
    getStats();
  };

  const handleSave = async (productData) => {
    try {
      setSaving(true);
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct._id, productData);
        toast.success("Product updated successfully");
      } else {
        await productService.createProduct(productData);
        toast.success("Product created successfully");
      }
      setShowModal(false);
      setSelectedProduct(null);
      refreshProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await productService.deleteProduct(productToDelete._id);
      toast.success("Product deleted successfully");
      setProductToDelete(null);
      refreshProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const closeProductModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Products"
          description="Manage and monitor your inventory"
          action={canCreate ? <Button onClick={() => setShowModal(true)}>+ Add</Button> : null}
        />

        {canViewStats && <ProductStats stats={stats} loading={statsLoading} error={statsError} />}

        <section className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm">
          <ProductFilters
            categories={categories}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
            onRetryCategories={refetchCategories}
            category={category}
            onCategoryChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(field, order) => {
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
            }}
          />
          <ProductResults
            products={products}
            loading={loading}
            error={error}
            hasFilters={Boolean(debouncedSearch.trim() || category)}
            onRetry={refetch}
            onEdit={(product) => {
              setSelectedProduct(product);
              setShowModal(true);
            }}
            onDelete={setProductToDelete}
            canEdit={canUpdate}
            canDelete={canDelete}
            pagination={pagination}
            onPageChange={setPage}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(field, order) => {
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
            }}
          />
        </section>
      </div>

      <ProductModal
        isOpen={showModal}
        onClose={closeProductModal}
        onSubmit={handleSave}
        loading={saving}
        product={selectedProduct}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        onRetryCategories={refetchCategories}
      />
      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        message={productToDelete ? `Are you sure you want to delete "${productToDelete.name}"?` : ""}
      />
    </Layout>
  );
};

export default Products;


import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import Layout from "../components/layout/Layout";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import ProductModal from "../components/products/ProductModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Input from "../components/common/Input";
import Pagination from "../components/common/Pagination";

import useProducts from "../hooks/useProducts";
import productService from "../services/productService";

import {  Pencil, Trash2 } from "lucide-react";

const Products = () => {

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [category, setCategory] = useState("");
const [sort, setSort] = useState("");
const [page, setPage] = useState(1);

useEffect(() => {
  if (search.length > 0 && search.length < 3) {
    return;
  }

  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1);
  }, 500);

  return () => clearTimeout(timer);
}, [search]);

const {products,pagination,loading,getProducts} = useProducts( {name: debouncedSearch,category,sort,page});
  const isEditing = !!selectedProduct;

  // Create / Update
  const handleSaveProduct = async (productData) => {
    try {
      setSaving(true);

      if (isEditing) {
        await productService.updateProduct(selectedProduct._id, productData);
        toast.success("Product updated successfully");
      } else {
        await productService.createProduct(productData);
        toast.success("Product created successfully");
      }

      setShowModal(false);
      setSelectedProduct(null);
      getProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  // Edit
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Delete
  const handleDelete = async () => {
    try {
      setDeleting(true);

      await productService.deleteProduct(deleteProduct._id);

      toast.success("Product deleted successfully");

      setDeleteProduct(null);
      getProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete product"
      );
    } finally {
      setDeleting(false);
    }
  };



  return (
    <Layout>
      <div className="mx-auto max-w-7xl">

        <PageHeader
          title="Products"
          description="Manage and monitor your inventory"
          icon={Package}
          action={
            <Button
              onClick={() => {
                setSelectedProduct(null);
                setShowModal(true);
              }}
            >
              + Add 
            </Button>
          }
        />

        {/* Summary */}
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border theme-border theme-surface p-5 shadow-sm transition hover:shadow-md">
            <p className="text-sm theme-text-muted">Total Products</p>
            <p className="mt-2 text-2xl font-bold theme-text-primary">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border theme-border theme-surface p-5 shadow-sm transition hover:shadow-md">
            <p className="text-sm theme-text-muted">Total Stock</p>
            <p className="mt-2 text-2xl font-bold theme-text-primary">
              {products.reduce(
                (total, product) => total + product.quantity,
                0
              )}
            </p>
          </div>

          <div className="rounded-2xl border theme-border theme-surface p-5 shadow-sm transition hover:shadow-md">
            <p className="text-sm theme-text-muted">Inventory Value</p>
            <p className="mt-2 text-2xl font-bold theme-text-primary">
              ₹
              {products.reduce(
                (total, product) =>
                  total + product.price * product.quantity,
                0
              )}
            </p>
          </div>
          <div className="rounded-2xl border theme-border theme-surface p-5 shadow-sm transition hover:shadow-md">
            <p className="text-sm theme-text-muted">Low Stock Products</p>
            <p className="mt-2 text-2xl font-bold theme-text-primary">
              {products.filter((product) => product.quantity <= 5).length}
            </p>
          </div>

        </div>

        {/* Products */}
        <div className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm">

          {/* Search */}
          <div className="flex flex-col gap-4 border-b theme-border-subtle p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-semibold theme-text-primary">
                All Products
              </h2>
              <p className="mt-1 text-sm theme-text-muted">
                View and manage your products
              </p>
            </div>

            <div className="w-full sm:w-72">
              <Input              
               name="search"             
                 value={search}             
                 onChange={(event) => {   setSearch(event.target.value);   setPage(1); }}
                placeholder="Search products..."
               showSearchIcon
              />
            </div>

          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
           <div className="flex min-h-[300px] items-center justify-center px-4">
 <div className="flex min-h-[320px] items-center justify-center px-4">
  <div className="text-center">

    <div className="relative mx-auto mb-5 h-40 w-40">

      <div className="theme-decoration absolute inset-0 rounded-full blur-2xl" />

      <div className="theme-product-empty relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border">
          <video   src="/notfound.mp4"   autoPlay   loop   muted   playsInline   className="h-full w-full object-contain" />
   </div>

    </div>

    <h3 className="text-lg font-semibold theme-text-primary">
      No products found
    </h3>

    <p className="mt-1 text-sm theme-text-muted">
      Try another search
    </p>

  </div>
</div>
</div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">

                  <thead>
                    <tr className="border-b theme-border-subtle theme-surface-secondary text-left">

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide theme-text-muted">
                        Product
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide theme-text-muted">
                        Category
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide theme-text-muted">
                        Price
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide theme-text-muted">
                        Stock
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide theme-text-muted">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product._id}
                        className="border-b theme-border-subtle transition theme-hover-surface"
                      >

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-primary-soft font-semibold theme-primary-text">
                              {product.name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <p className="font-medium theme-text-primary">
                                {product.name}
                              </p>
                             
                            </div>

                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full theme-neutral-soft px-3 py-1 text-xs font-medium theme-text-secondary">
                            {product.category}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-medium theme-text-primary">
                          ₹{product.price}
                        </td>

                        <td className="px-6 py-4">

                          {product.quantity === 0 ? (
                            <span className="inline-flex rounded-full theme-danger-soft px-3 py-1 text-xs font-medium theme-danger">
                              Out of stock
                            </span>
                          ) : product.quantity <= 5 ? (
                            <span className="inline-flex rounded-full theme-warning-soft px-3 py-1 text-xs font-medium theme-warning">
                              Low stock · {product.quantity}
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full theme-success-soft px-3 py-1 text-xs font-medium theme-success">
                              {product.quantity} available
                            </span>
                          )}

                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() => handleEdit(product)}
                              title="Edit product"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-primary theme-hover-border-primary"
                            >
                              <Pencil size={16} strokeWidth={2} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteProduct(product)}
                              title="Delete product"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-danger theme-hover-border-danger theme-hover-danger-text"
                            >
                              <Trash2 size={16} strokeWidth={2} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-3 p-4 md:hidden">

                {products.map((product) => (
                  <div
                    key={product._id}
                    className="rounded-xl border theme-border theme-surface p-4 shadow-sm"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-primary-soft font-semibold theme-primary-text">
                          {product.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium theme-text-primary">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-xs theme-text-muted">
                            {product.category}
                          </p>
                        </div>

                      </div>

                      <div className="flex shrink-0 gap-2">

                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          title="Edit product"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-primary theme-hover-text-primary"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteProduct(product)}
                          title="Delete product"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-danger theme-hover-danger-text"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-lg theme-surface-secondary p-3">
                        <p className="text-xs theme-text-muted">Price</p>
                        <p className="mt-1 font-semibold theme-text-primary">
                          ₹{product.price}
                        </p>
                      </div>

                      <div className="rounded-lg theme-surface-secondary p-3">
                        <p className="text-xs theme-text-muted">Stock</p>
                        <p className="mt-1 font-semibold theme-text-primary">
                          {product.quantity}
                        </p>
                      </div>

                    </div>

                  </div>
                ))}

              </div>
              <Pagination
  page={pagination.page}
  totalPages={pagination.totalPages}
  hasNextPage={pagination.hasNextPage}
  hasPreviousPage={pagination.hasPreviousPage}
  onPageChange={(newPage) => setPage(newPage)}
/>
            </>
          )}

        </div>
      </div>

      <ProductModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleSaveProduct}
        loading={saving}
        product={selectedProduct}
      />

      <ConfirmDialog
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        message={
          deleteProduct
            ? `Are you sure you want to delete "${deleteProduct.name}"?`
            : ""
        }
      />
      

    </Layout>
  );
};

export default Products;
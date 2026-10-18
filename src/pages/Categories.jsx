import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FolderKanban, Pencil, Plus, Trash2 } from "lucide-react";

import Layout from "../components/layout/Layout";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import Spinner from "../components/common/Spinner";
import Pagination from "../components/common/Pagination";
import SortableHeader from "../components/common/SortableHeader";
import categoryService from "../services/categoryService";
import useCategories from "../hooks/useCategories";
import { isRequired } from "../utils/validators";
import useAuth from "../hooks/useAuth";
import { hasPermission } from "../utils/permissions";

const Categories = () => {
  const { user } = useAuth();
  const canCreate = hasPermission(user, "categories.create");
  const canUpdate = hasPermission(user, "categories.update");
  const canDelete = hasPermission(user, "categories.delete");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const { categories, pagination, loading, error, refetch } = useCategories({
    search: debouncedSearch,
    sortBy,
    sortOrder,
    page
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [saving, setSaving] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const openCreateModal = () => {
    setSelectedCategory(null);
    setCategoryName("");
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setCategoryName("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const name = categoryName.trim();
    if (!isRequired(name)) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSaving(true);

      if (selectedCategory) {
        await categoryService.updateCategory(selectedCategory._id, { name });
        toast.success("Category updated successfully");
      } else {
        await categoryService.createCategory({ name });
        toast.success("Category created successfully");
      }

      closeModal();
      setPage(1);
      refetch();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await categoryService.deleteCategory(categoryToDelete._id);
      toast.success("Category deleted successfully");
      setCategoryToDelete(null);
      setPage(1);
      refetch();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Categories"
          description="Organize products by category"
          action={canCreate ? (
            <Button onClick={openCreateModal}>
              <Plus size={17} />
              Create 
            </Button>
          ) : null}
        />

        <div className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm">
          <div className="flex flex-col gap-3 border-b theme-border-subtle p-5 sm:flex-row sm:items-center sm:justify-between">
            <Input
              name="categorySearch"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              showSearchIcon
            />
          </div>
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : categories.length === 0 ? (
            <EmptyState
              title={debouncedSearch ? "No matching categories" : "No categories yet"}
              message={debouncedSearch
                ? "Try adjusting your search."
                : "Create a category to organize your products."}
              icon={FolderKanban}
              action={canCreate ? <Button onClick={openCreateModal}>Add Category</Button> : null}
              className="min-h-[360px]"
            />
          ) : (
            <>
            <div className="hidden overflow-x-auto min-[648px]:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b theme-border-subtle theme-surface-secondary text-left">
                    {[
                      ["Category", "name"],
                      ["Products", "totalProducts"],
                      ["Total stock", "totalStock"],
                      ["Inventory value", "inventoryValue"],
                      ["Created", "createdAt"]
                    ].map(([label, field]) => <th key={field} className="px-6 py-4 text-xs font-semibold uppercase tracking-wide theme-text-muted">
                      <SortableHeader
                        field={field}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={(nextField, nextOrder) => {
                          setSortBy(nextField);
                          setSortOrder(nextOrder);
                          setPage(1);
                        }}
                      >{label}</SortableHeader>
                    </th>)}
                    {(canUpdate || canDelete) && <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide theme-text-muted">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category._id}
                      className="border-b theme-border-subtle transition theme-hover-surface"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium capitalize theme-text-primary">
                          {category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 theme-text-secondary">{category.totalProducts.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 theme-text-secondary">{category.totalStock.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 theme-text-secondary">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(category.inventoryValue)}</td>
                      <td className="px-6 py-4 theme-text-secondary">{new Date(category.createdAt).toLocaleDateString()}</td>
                      {(canUpdate || canDelete) && <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {canUpdate && <button
                            type="button"
                            onClick={() => openEditModal(category)}
                            title="Edit category"
                            aria-label={`Edit ${category.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-primary theme-hover-border-primary"
                          >
                            <Pencil size={16} />
                          </button>}
                          {canDelete && <button
                            type="button"
                            onClick={() => setCategoryToDelete(category)}
                            title="Delete category"
                            aria-label={`Delete ${category.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-danger theme-hover-border-danger theme-hover-danger-text"
                          >
                            <Trash2 size={16} />
                          </button>}
                        </div>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 min-[648px]:hidden">
              {categories.map((category) => (
                <article key={category._id} className="rounded-xl border theme-border theme-surface p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 break-words font-semibold capitalize theme-text-primary">{category.name}</h3>
                    {(canUpdate || canDelete) && <div className="flex shrink-0 gap-2">
                      {canUpdate && <button
                        type="button"
                        onClick={() => openEditModal(category)}
                        aria-label={`Edit ${category.name}`}
                        className="flex h-11 w-11 items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-primary theme-hover-border-primary"
                      ><Pencil size={17} /></button>}
                      {canDelete && <button
                        type="button"
                        onClick={() => setCategoryToDelete(category)}
                        aria-label={`Delete ${category.name}`}
                        className="flex h-11 w-11 items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-danger theme-hover-border-danger theme-hover-danger-text"
                      ><Trash2 size={17} /></button>}
                    </div>}
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg theme-surface-secondary p-3">
                      <dt className="text-xs theme-text-muted">Products</dt>
                      <dd className="mt-1 font-semibold theme-text-primary">{category.totalProducts.toLocaleString("en-IN")}</dd>
                    </div>
                    <div className="rounded-lg theme-surface-secondary p-3">
                      <dt className="text-xs theme-text-muted">Total stock</dt>
                      <dd className="mt-1 font-semibold theme-text-primary">{category.totalStock.toLocaleString("en-IN")}</dd>
                    </div>
                    <div className="rounded-lg theme-surface-secondary p-3">
                      <dt className="text-xs theme-text-muted">Inventory value</dt>
                      <dd className="mt-1 font-semibold theme-text-primary">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(category.inventoryValue)}</dd>
                    </div>
                    <div className="rounded-lg theme-surface-secondary p-3">
                      <dt className="text-xs theme-text-muted">Created</dt>
                      <dd className="mt-1 font-semibold theme-text-primary">{new Date(category.createdAt).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
            </>
          )}
          {!loading && !error && pagination && categories.length > 0 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedCategory ? "Update category" : "Create category"}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Category Name"
            name="categoryName"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Enter category name"
            required
            autoFocus
            disabled={saving}
          />
          <div className="sticky bottom-0 -mx-4 -mb-4 flex flex-col-reverse gap-3 border-t theme-border-subtle theme-surface p-4 sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:p-6">
            <Button type="button" variant="outline" disabled={saving} onClick={closeModal} className="w-full sm:w-auto">Cancel</Button>
            <Button
              type="submit"
              loading={saving}
              loadingText={selectedCategory ? "Updating..." : "Saving..."}
              className="w-full sm:w-auto"
            >
              {selectedCategory ? "Update category" : "Create category"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Category"
        message={
          categoryToDelete
            ? `Are you sure you want to delete "${categoryToDelete.name}"?`
            : ""
        }
      />
    </Layout>
  );
};

export default Categories;
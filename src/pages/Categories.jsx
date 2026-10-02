import { useEffect, useState } from "react";
import { toast } from "react-toastify";
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
import categoryService from "../services/categoryService";
import useCategories from "../hooks/useCategories";

const PAGE_LIMIT = 10;

const Categories = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("oldest");
  const [page, setPage] = useState(1);
  const { categories, pagination, loading, error, refetch } = useCategories({
    search: debouncedSearch,
    sort,
    page,
    limit: PAGE_LIMIT
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
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const openCreateModal = () => {
    setSelectedCategory(null);
    setCategoryName("");
    setIsModalOpen(true);
  };

  const openEditModal = async (category) => {
    try {
      const data = await categoryService.getCategoryById(category._id);
      const categoryDetails = data.category;

      setSelectedCategory(categoryDetails);
      setCategoryName(categoryDetails.name);
      setIsModalOpen(true);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "Failed to load category details"
      );
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setCategoryName("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const name = categoryName.trim();
    if (!name) {
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
          action={
            <Button onClick={openCreateModal}>
              <Plus size={17} />
              Add Category
            </Button>
          }
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
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              aria-label="Sort categories"
              className="theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none sm:w-52"
            >
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
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
              action={<Button onClick={openCreateModal}>Add Category</Button>}
              className="min-h-[360px]"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b theme-border-subtle theme-surface-secondary text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide theme-text-muted">
                      Category
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide theme-text-muted">
                      Actions
                    </th>
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
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(category)}
                            title="Edit category"
                            aria-label={`Edit ${category.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-primary theme-hover-border-primary"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCategoryToDelete(category)}
                            title="Delete category"
                            aria-label={`Delete ${category.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border theme-border theme-surface theme-text-muted transition theme-hover-danger theme-hover-border-danger theme-hover-danger-text"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        title={selectedCategory ? "Update Category" : "Create Category"}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Category Name"
            name="categoryName"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Enter category name"
            required
            disabled={saving}
          />
          <Button type="submit" loading={saving} className="w-full">
            {selectedCategory ? "Update Category" : "Create Category"}
          </Button>
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
import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import Input from "../common/Input";
import Button from "../common/Button";
import Select from "../common/Select";
import ProductImage from "./ProductImage";
import { isPositiveNumber, isRequired } from "../../utils/validators";
import compressImageToDataUrl from "../../utils/compressImage";

const getCategoryId = (category) =>
  typeof category === "object" && category !== null
    ? String(category._id ?? "")
    : category ?? "";

const getCategoryName = (category) =>
  typeof category === "object" && category !== null
    ? category.name ?? ""
    : category ?? "";

const getInitialFormData = (product) => ({
  name: product?.name ?? "",
  price: product?.price ?? "",
  quantity: product?.quantity ?? "",
  category: getCategoryId(product?.category)
});

const MAX_PRODUCT_IMAGE_SIZE_BYTES = 300 * 1024;
const MAX_SOURCE_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ProductForm = ({
  product,
  onSubmit,
  loading,
  categories = [],
  categoriesLoading = false,
  categoriesError = "",
  onRetryCategories
}) => {
  const [formData, setFormData] = useState(() => getInitialFormData(product));
  const [image, setImage] = useState(product?.image ?? "");
  const [imageChanged, setImageChanged] = useState(false);
  const [compressingImage, setCompressingImage] = useState(false);
  const productCategoryId = getCategoryId(product?.category);
  const productCategoryName = getCategoryName(product?.category);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Choose a JPEG, PNG or WebP image");
      return;
    }
    if (file.size > MAX_SOURCE_IMAGE_SIZE_BYTES) {
      toast.error("Choose a product image that is 10 MB or smaller");
      return;
    }

    setCompressingImage(true);
    try {
      const compressedImage = await compressImageToDataUrl(file, {
        maxBlobSize: MAX_PRODUCT_IMAGE_SIZE_BYTES,
        sizeError: "Image could not be compressed below 300 KB"
      });
      setImage(compressedImage);
      setImageChanged(true);
      toast.success("Product image compressed and ready");
    } catch (error) {
      toast.error(error.message || "Could not prepare the product image");
    } finally {
      setCompressingImage(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = formData.name.trim();
    const price = Number(formData.price);
    const quantity = Number(formData.quantity);

    if (!isRequired(name)) {
      toast.error("Product name is required");
      return;
    }
    if (!isRequired(formData.price) || !isPositiveNumber(price)) {
      toast.error("Enter a valid price of 0 or more");
      return;
    }
    if (!product && (
      !isRequired(formData.quantity) ||
      !Number.isInteger(quantity) ||
      quantity < 0
    )) {
      toast.error("Enter a whole-number quantity of 0 or more");
      return;
    }
    if (!isRequired(formData.category)) {
      toast.error("Select a category");
      return;
    }

    onSubmit({
      name,
      price,
      ...(!product ? { quantity } : {}),
      category: formData.category,
      ...(imageChanged ? { image } : {})
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      <Input
        label="Product Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter product name"
        required
        autoFocus
        disabled={loading}
      />

      <div>
        <span className="mb-1.5 block text-sm font-semibold theme-text-primary">Product Image <span className="font-normal theme-text-muted">(optional)</span></span>
        <div className="flex items-center gap-3 rounded-xl border theme-border theme-surface-secondary p-3">
          <ProductImage src={image} alt="Product preview" className="h-16 w-16 rounded-lg" />
          <div className="min-w-0 flex-1">
            <label className="inline-flex cursor-pointer items-center rounded-lg border theme-border theme-surface px-3 py-2 text-sm font-medium theme-text-secondary transition theme-hover-surface">
              Choose image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={loading || compressingImage}
                className="sr-only"
              />
            </label>
            <p className="mt-1 text-xs theme-text-muted">
              {compressingImage ? "Compressing image..." : "JPEG, PNG or WebP · compressed to 300 KB"}
            </p>
          </div>
          {image && (
            <button
              type="button"
              onClick={() => {
                setImage("");
                setImageChanged(true);
              }}
              disabled={loading}
              aria-label="Remove product image"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg theme-text-muted transition theme-hover-danger theme-hover-danger-text disabled:opacity-60"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      <Input
        label="Price"
        name="price"
        type="number"
        step="any"
        value={formData.price}
        onChange={handleChange}
        placeholder="Enter price"
        required
        disabled={loading}
      />

      {product ? (
        <div className="rounded-xl border theme-border theme-surface-secondary p-3">
          <p className="text-xs font-medium theme-text-muted">Current quantity</p>
          <p className="mt-1 text-sm font-semibold theme-text-primary">{product.quantity}</p>
          <p className="mt-1 text-xs theme-text-muted">Use the Stock page to record an authorized stock-in or stock-out movement.</p>
        </div>
      ) : (
        <Input
          label="Opening quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Enter opening quantity"
          min={0}
          step={1}
          required
          disabled={loading}
        />
      )}

      <Select
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder={categoriesLoading ? "Loading categories..." : "Select a category"}
        options={[
          ...categories.map((category) => ({
            value: category._id,
            label: category.name
          })),
          ...(productCategoryId && !categories.some((category) => category._id === productCategoryId)
            ? [{ value: productCategoryId, label: productCategoryName }]
            : [])
        ]}
        error={categoriesError}
        required
        disabled={loading || categoriesLoading || (!categories.length && !product?.category)}
      />

      {categoriesError && onRetryCategories && (
        <button
          type="button"
          onClick={onRetryCategories}
          className="text-sm font-medium theme-primary-text theme-hover-text-primary"
        >
          Retry loading categories
        </button>
      )}

      {!categoriesLoading && !categoriesError && categories.length === 0 && !product?.category && (
        <p className="text-sm theme-text-muted">Create a category before adding a product.</p>
      )}

      <Button
        type="submit"
        loading={loading || compressingImage}
        loadingText={compressingImage ? "Compressing image..." : product ? "Updating product..." : "Saving product..."}
        className="w-full"
      >
        {product ? "Update " : "Create "}
      </Button>

    </form>
  );
};

export default ProductForm;
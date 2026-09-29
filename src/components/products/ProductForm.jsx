import { useEffect, useState } from "react";

import Input from "../common/Input";
import Button from "../common/Button";

const ProductForm = ({
  product,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    category: ""
  });

useEffect(() => {
  if (product) {
    setFormData({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      category: product.category
    });
  } else {
    setFormData({
      name: "",
      price: "",
      quantity: "",
      category: ""
    });
  }
}, [product]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      name: formData.name,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      category: formData.category
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
        disabled={loading}
      />

      <Input
        label="Price"
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        placeholder="Enter price"
        required
        disabled={loading}
      />

      <Input
        label="Quantity"
        name="quantity"
        type="number"
        value={formData.quantity}
        onChange={handleChange}
        placeholder="Enter quantity"
        min={0}
        required
        disabled={loading}
      />

      <Input
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="Example: Smartphone"
        required
        disabled={loading}
      />

      <Button
        type="submit"
        loading={loading}
        className="w-full"
      >
        {product ? "Update " : "Create "}
      </Button>

    </form>
  );
};

export default ProductForm;
const indianRupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

const formatCurrency = (amount) => indianRupees.format(amount);

export default formatCurrency;

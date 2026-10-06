export const isRequired = (value) => {
  return value !== undefined && value !== null && String(value).trim() !== "";
};

export const isValidEmail = (email) => {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidCustomerPhone = (phone) => {
  return typeof phone === "string" && /^[0-9]{10}$/.test(phone);
};

export const passwordRequirements = [
  { label: "At least 8 characters", test: (password) => password.length >= 8 },
  { label: "At least one uppercase letter", test: (password) => /[A-Z]/.test(password) },
  { label: "At least one lowercase letter", test: (password) => /[a-z]/.test(password) },
  { label: "At least one number", test: (password) => /\d/.test(password) },
  { label: "At least one symbol", test: (password) => /[^A-Za-z0-9]/.test(password) },
  {
    label: "No more than 72 UTF-8 bytes",
    test: (password) => new TextEncoder().encode(password).length <= 72
  }
];

export const isStrongPassword = (password) => {
  return typeof password === "string" &&
    passwordRequirements.every((requirement) => requirement.test(password));
};

export const isPositiveNumber = (value) => {
  if (!isRequired(value)) return false;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
};

export const isPositiveInteger = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
};
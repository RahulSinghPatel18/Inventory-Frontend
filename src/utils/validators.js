export const isRequired = (value) => {
  return value !== undefined && value !== null && value.trim() !== "";
};

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isPositiveNumber = (value) => {
  return Number(value) >= 0;
};
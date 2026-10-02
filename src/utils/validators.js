export const isRequired = (value) => {
  return value !== undefined && value !== null && String(value).trim() !== "";
};

export const isValidEmail = (email) => {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
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
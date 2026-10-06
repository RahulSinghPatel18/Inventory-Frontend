import { useEffect, useRef, useState } from "react";
import { Search, Eye, EyeOff } from "lucide-react";

const Input = ({
label,
name,
type = "text",
value,
onChange,
placeholder = "",
autoComplete,
error = "",
required = false,
disabled = false,
min,
step,
inputMode,
maxLength,
showSearchIcon = false,
showPasswordToggle = false,
autoFocus = false,
compact = false
}) => {
const [showPassword, setShowPassword] = useState(false);
const inputRef = useRef(null);

const inputType =
showPasswordToggle && showPassword ? "text" : type;

useEffect(() => {
  if (autoFocus && !disabled) inputRef.current?.focus({ preventScroll: true });
}, [autoFocus, disabled]);

return ( <div className="w-full">
{label && ( <label
       htmlFor={name}
      className={`block text-sm font-semibold theme-text-primary ${compact ? "mb-1" : "mb-1.5"}`}
     >
{label} </label>
)}


  <div className="relative">
    {showSearchIcon && (
      <Search
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
      />
    )}

    <input
      ref={inputRef}
      data-autofocus={autoFocus ? "true" : undefined}
      id={name}
      name={name}
      type={inputType}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      disabled={disabled}
      min={min}
      step={step}
      inputMode={inputMode}
      maxLength={maxLength}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={error ? `${name}-error` : undefined}
      className={`
        theme-input w-full rounded-xl border px-4 ${compact ? "py-2" : "py-3"}
        text-sm outline-none transition-all duration-200
        disabled:cursor-not-allowed disabled:opacity-70
        ${showSearchIcon ? "pl-10" : ""}
        ${showPasswordToggle ? "pr-11" : ""}
        ${
          error
            ? "theme-input-error"
            : ""
        }
      `}
    />

    {showPasswordToggle && (
      <button
        type="button"
        onClick={() => setShowPassword((previous) => !previous)}
        disabled={disabled}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted theme-hover-text-secondary transition disabled:cursor-not-allowed"
      >
        {showPassword ? (
          <EyeOff size={18} />
        ) : (
          <Eye size={18} />
        )}
      </button>
    )}
  </div>

  {error && (
    <p id={`${name}-error`} className="mt-1.5 text-xs font-medium theme-danger">
      {error}
    </p>
  )}
</div>


);
};

export default Input;

import { useState } from "react";
import { Search, Eye, EyeOff } from "lucide-react";

const Input = ({
label,
name,
type = "text",
value,
onChange,
placeholder = "",
error = "",
required = false,
disabled = false,
min,
showSearchIcon = false,
showPasswordToggle = false
}) => {
const [showPassword, setShowPassword] = useState(false);

const inputType =
showPasswordToggle && showPassword ? "text" : type;

return ( <div className="w-full">
{label && ( <label
       htmlFor={name}
      className="mb-1.5 block text-sm font-semibold theme-text-primary"
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
      id={name}
      name={name}
      type={inputType}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      min={min}
      className={`
        theme-input w-full rounded-xl border px-4 py-3
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
    <p className="mt-1.5 text-xs font-medium theme-danger">
      {error}
    </p>
  )}
</div>


);
};

export default Input;

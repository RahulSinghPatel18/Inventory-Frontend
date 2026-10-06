const Select = ({
label,
name,
value,
onChange,
options = [],
placeholder = "Select an option",
error = "",
required = false,
disabled = false
}) => {
return ( <div className="w-full">
{label && ( <label
       htmlFor={name}
      className="mb-1.5 block text-sm font-semibold theme-text-primary"
     >
{label} </label>
)}


  <select
    id={name}
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    disabled={disabled}
    aria-invalid={error ? "true" : undefined}
    aria-describedby={error ? `${name}-error` : undefined}
    className={`
      theme-input w-full rounded-xl border px-4 py-3
      text-sm outline-none transition-all duration-200
      disabled:cursor-not-allowed
      disabled:opacity-70
      ${value ? "theme-text-primary" : "theme-text-muted"}
      ${
        error
          ? "theme-input-error"
          : ""
      }
    `}
  >
    <option value="" disabled>
      {placeholder}
    </option>

    {options.map((option) => (
      <option
        key={option.value}
        value={option.value}
      >
        {option.label}
      </option>
    ))}
  </select>

  {error && (
    <p id={`${name}-error`} className="mt-1.5 text-xs font-medium theme-danger">
      {error}
    </p>
  )}
</div>


);
};

export default Select;

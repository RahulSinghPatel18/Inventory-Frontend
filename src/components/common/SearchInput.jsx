import { useState } from "react";
import { Search, X } from "lucide-react";

const SearchInput = ({
value = "",
onChange,
placeholder = "Search..."
}) => {
const [searchValue, setSearchValue] = useState(value);

const handleChange = (event) => {
const newValue = event.target.value;


setSearchValue(newValue);

if (onChange) {
  onChange(newValue);
}


};

const handleClear = () => {
setSearchValue("");


if (onChange) {
  onChange("");
}


};

return ( <div className="relative w-full max-w-sm"> <Search
     size={17}
     strokeWidth={2}
    className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
   />


  <input
    type="text"
    value={searchValue}
    onChange={handleChange}
    placeholder={placeholder}
    className="
      w-full
      rounded-xl
      border
      theme-input
      py-3
      pl-10
      pr-10
      text-sm
      outline-none
      transition-all
      duration-200
    "
  />

  {searchValue && (
    <button
      type="button"
      onClick={handleClear}
      aria-label="Clear search"
      className="
        absolute
        right-3
        top-1/2
        flex
        h-6
        w-6
        -translate-y-1/2
        items-center
        justify-center
        rounded-full
        theme-text-muted
        transition
        theme-hover-neutral
        theme-hover-text-secondary
      "
    >
      <X size={15} strokeWidth={2} />
    </button>
  )}
</div>


);
};

export default SearchInput;


import { useEffect, useState } from "react";
import { Boxes, Package, Warehouse } from "lucide-react";

const Spinner = ({ size = "md" }) => {
  const [index, setIndex] = useState(0);

  const icons = [Boxes, Package, Warehouse];
  const Icon = icons[index];

  const sizes = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-14 w-14"
  };

  const iconSizes = {
    sm: 15,
    md: 20,
    lg: 25
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((previous) => (previous + 1) % icons.length);
    }, 700);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`relative ${sizes[size]}`}>
      <div className="theme-spinner absolute inset-0 animate-spin rounded-full border-[3px]" />

      <div className="absolute inset-[5px] flex items-center justify-center rounded-full theme-primary-soft shadow-sm">
        <Icon
          size={iconSizes[size]}
          strokeWidth={1.8}
          className="theme-primary-text"
        />
      </div>
    </div>
  );
};

export default Spinner;


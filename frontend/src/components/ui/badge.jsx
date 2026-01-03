export const Badge = ({ children, variant = "outline", className = "" }) => {
  let baseStyle =
    "inline-flex items-center px-2 py-1 rounded text-sm font-medium border";

  let variantStyle = "";

  switch (variant) {
    case "outline":
      variantStyle = "border-gray-300 text-gray-800 bg-white";
      break;
    case "success":
      variantStyle = "border-green-400 text-green-700 bg-green-100";
      break;
    case "error":
      variantStyle = "border-red-400 text-red-700 bg-red-100";
      break;
    default:
      variantStyle = "border-gray-300 text-gray-800 bg-gray-100";
  }

  return <span className={`${baseStyle} ${variantStyle} ${className}`}>{children}</span>;
};

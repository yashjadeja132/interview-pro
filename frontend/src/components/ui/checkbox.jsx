import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked && "bg-blue-600 border-blue-600 text-white",
        className
      )}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      {checked && (
        <Check className="h-4 w-4" />
      )}
    </button>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }

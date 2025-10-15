import * as React from "react"
import { cn } from "@/lib/utils"

interface PropertyCellProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number | React.ReactNode
}

const PropertyCell = React.forwardRef<
  HTMLDivElement,
  PropertyCellProps
>(({ className, label, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md border border-[color:var(--border)] p-2 bg-[var(--card)] text-[var(--text)]",
      className
    )}
    {...props}
  >
    <div className="text-xs text-[var(--muted-foreground)]">{label}</div>
    <div className="font-medium mt-1">{value}</div>
  </div>
))
PropertyCell.displayName = "PropertyCell"

export { PropertyCell }
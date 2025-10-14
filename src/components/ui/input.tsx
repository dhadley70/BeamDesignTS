// src/components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Optional left adornment (icon, text). Adds left padding automatically. */
  startIcon?: React.ReactNode
  /** Optional right adornment (icon, text). Adds right padding automatically. */
  endIcon?: React.ReactNode
  /** Visual invalid state (adds red-ish border using your theme ring). */
  invalid?: boolean
  /** Class for the outer wrapper (useful when using icons). */
  wrapperClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      startIcon,
      endIcon,
      invalid,
      type = "text",
      ...props
    },
    ref
  ) => {
    const hasStart = Boolean(startIcon)
    const hasEnd = Boolean(endIcon)

    return (
      <div className={cn("relative", wrapperClassName)}>
        {hasStart && (
          <span
            className={cn(
              "pointer-events-none absolute inset-y-0 left-2 flex items-center text-[0.8rem]",
              "text-[color:var(--border)]/80"
            )}
          >
            {startIcon}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          className={cn(
            // Base field
            "flex h-9 w-full rounded-md border bg-[var(--input)] px-3 py-1 text-base shadow-sm transition-colors md:text-sm",
            // Theme tokens
            "border-[color:var(--border)] text-[var(--input-text)] focus-visible:ring-1 focus-visible:ring-[color:var(--ring)]",
            // File input normalization
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--text)]",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Icons padding
            hasStart && "pl-8",
            hasEnd && "pr-9",
            // Invalid state
            invalid && "border-[color:var(--destructive)] focus-visible:ring-[color:var(--destructive)]",
            className
          )}
          {...props}
        />

        {hasEnd && (
          <span
            className={cn(
              "pointer-events-none absolute inset-y-0 right-2 flex items-center text-[0.8rem]",
              "text-[color:var(--border)]/80"
            )}
          >
            {endIcon}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

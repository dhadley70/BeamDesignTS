import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"   // <- imports your existing Input from ui/Input.tsx

type Props = React.ComponentProps<typeof Input> & {
  unit: string
  unitAriaLabel?: string
  unitPosition?: "right" | "left"
  unitClassName?: string
}

/** Input with a non-interactive unit label inside the field */
export function InputWithUnit({
  unit,
  unitAriaLabel,
  unitPosition = "right",
  className,
  unitClassName,
  ...props
}: Props) {
  const pad = unitPosition === "right" ? "pr-10" : "pl-10"
  const side = unitPosition === "right" ? "right-3" : "left-3"

  return (
    <div className="relative">
      <Input {...props} className={cn(pad, "bg-[var(--input)] text-[var(--input-text)]", className)} />
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 flex items-center text-xs",
          "text-[color:var(--input-text)]/80", // or var(--deadTint) / var(--muted)
          side,
          unitClassName
        )}
        aria-hidden={unitAriaLabel ? undefined : true}
        aria-label={unitAriaLabel}
      >
        {unit}
      </span>
    </div>
  )
}

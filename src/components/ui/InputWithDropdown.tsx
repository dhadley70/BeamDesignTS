// src/components/ui/InputWithDropdown.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"   // <- imports your existing Input from ui/Input.tsx
import { ChevronDown } from "lucide-react"

type Option = { label: string; value: string }

export type InputWithDropdownProps = Omit<
  React.ComponentProps<typeof Input>,
  "endIcon" | "startIcon"
> & {
  options: Option[]
  selected?: string
  onSelect?: (value: string) => void
  /** place dropdown trigger on the "right" (default) or "left" inside the field */
  dropdownPosition?: "right" | "left"
  /** optional button aria-label */
  dropdownAriaLabel?: string
  /** custom class for the dropdown menu */
  menuClassName?: string
}

export function InputWithDropdown({
  className,
  options,
  selected,
  onSelect,
  dropdownPosition = "right",
  dropdownAriaLabel = "Open options",
  menuClassName,
  ...inputProps
}: InputWithDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const btnRef = React.useRef<HTMLButtonElement | null>(null)
  const menuRef = React.useRef<HTMLDivElement | null>(null)

  // close on outside click
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node
      if (!open) return
      if (btnRef.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [open])

  // keyboard handling on trigger
  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setOpen((v) => !v)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const isRight = dropdownPosition === "right"
  const padClass = isRight ? "pr-12" : "pl-12"
  const sideClass = isRight ? "right-1.5" : "left-1.5"

  return (
    <div className="relative">
      <Input
        {...inputProps}
        className={cn(
          // ensure room for the button inside the field
          padClass,
          "bg-[var(--input)] border-[color:var(--border)]",
          className
        )}
      />

      {/* in-field dropdown trigger */}
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={dropdownAriaLabel}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "absolute inset-y-0 my-1 flex items-center gap-1 rounded-md px-2 text-sm",
          "border border-transparent hover:border-[color:var(--border)]",
          "bg-[var(--card)] text-[var(--text)]",
          sideClass
        )}
      >
        <span className="truncate max-w-[6rem]">
          {options.find((o) => o.value === selected)?.label ?? "Select"}
        </span>
        <ChevronDown className="size-4 opacity-70" />
      </button>

      {/* menu */}
      {open && (
        <div
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          className={cn(
            "absolute z-50 mt-1 max-h-60 w-44 overflow-auto rounded-md border",
            "border-[color:var(--border)] bg-[var(--card)] text-[var(--text)] shadow-md",
            // align with trigger
            isRight ? "right-0" : "left-0",
            menuClassName
          )}
        >
          {options.map((opt) => {
            const active = opt.value === selected
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={active}
                type="button"
                onClick={() => {
                  onSelect?.(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm",
                  "hover:bg-[var(--muted)]/60",
                  active && "bg-[var(--muted)]/60"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {active ? <span className="text-xs opacity-70">✓</span> : null}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

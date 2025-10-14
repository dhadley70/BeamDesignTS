import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Paintbrush, ChevronDown, Check } from "lucide-react"
import useLocalStorage from "@/hooks/useLocalStorage"

/* ---------------- Theme Types ---------------- */
export const THEMES = ["Light", "Retro", "Wes Anderson", "Slate", "Octonauts", "Shaun Tan", 
  "Rainforest", "Midnight", "Citrus", "Lavender", "Sandstone", "Aurora", "Blade Runner", 
  "Dark", "Emerald", "Purple Breeze", "Sunset", "Ocean", "Rose", "Forest Night", "Slate Pro", 
  "High Contrast", "Solar", "C64", "Star Wars", "Barbie", "Matrix", "Dune", "Tron", 
  "Jurassic Park", "Lord of the Rings",] as const

export type ThemeName = typeof THEMES[number]

/* ---------------- Theme Hook ---------------- */
const THEME_KEY = "app-theme"

export function useTheme(): [ThemeName, (t: ThemeName) => void] {
  const [theme, setTheme] = useLocalStorage<ThemeName>(THEME_KEY, "Light")
  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])
  
  return [theme, setTheme]
}

/* ---------------- Simple dropdown hook (no shadcn dependency) ---------------- */
function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onOutside])
  return ref as React.RefObject<T>
}

/* ---------------- ThemeDropdown Component ---------------- */
interface ThemeDropdownProps {
  theme: ThemeName
  onChange: (t: ThemeName) => void
}

export function ThemeDropdown({ theme, onChange }: ThemeDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))
  const short = useMemo(() => (theme.length > 14 ? theme.slice(0, 14) + "…" : theme), [theme])

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        className="border-[color:var(--border)] text-[var(--text)] bg-[var(--card)] hover:bg-[var(--accent)] hover:text-[color:var(--card)]"
        onClick={() => setOpen((v) => !v)}
      >
        <Paintbrush className="mr-2 size-4" />
        {short}
        <ChevronDown className="ml-1 size-4 opacity-70" />
      </Button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-64 max-h-[60vh] overflow-y-auto rounded-lg border border-[color:var(--border)]
                     bg-[var(--card)] text-[var(--text)] shadow-lg z-50"
        >
          <div className="sticky top-0 z-10 bg-[var(--card)]/90 backdrop-blur px-3 py-2 text-xs opacity-70 border-b border-[color:var(--border)]/40">
            Theme
          </div>
          <ul className="py-1">
            {THEMES.map((t) => (
              <li key={t}>
                <button
                  onClick={() => { onChange(t); setOpen(false) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--muted)]/60"
                >
                  <span
                    className="inline-flex size-4 items-center justify-center rounded-full border border-[color:var(--border)]"
                    style={{ background: "var(--accent)" }}
                  />
                  <span className="flex-1">{t}</span>
                  {t === theme ? <Check className="size-4" /> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ThemeDropdown
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  )

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    localStorage.setItem("theme", isDark ? "dark" : "light")
  }, [isDark])

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved) setIsDark(saved === "dark")
  }, [])

  return (
    <Button
      variant="outline"
      className="border-border/60"
      onClick={() => setIsDark(v => !v)}
    >
      {isDark ? "Switch to Light" : "Switch to Dark"}
    </Button>
  )
}

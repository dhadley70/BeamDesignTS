import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  AlignLeft,
  Home,
  BarChart3,
  Settings,
  Search,
  ChevronRight,
  Rocket,
  Star,
  Paintbrush,
  Check,
  ChevronDown,
} from "lucide-react"

/* ---------------- Theming ---------------- */
const THEME_KEY = "app-theme"
const THEMES = [
  "C64",
  "Star Wars",
  "Barbie",
  "Matrix",
  "Dune",
  "Tron",
  "Jurassic Park",
  "Lord of the Rings",
  "Wes Anderson",
  "Octonauts",
  "Shaun Tan",
  "Rainforest",
  "Midnight",
  "Citrus",
  "Lavender",
  "Sandstone",
  "Aurora",
  "Slate",
  "Blade Runner",
  "Light",
  "Dark",
  "Emerald",
  "Purple Breeze",
  "Sunset",
  "Retro",
  "Ocean",
  "Rose",
  "Forest Night",
  "Slate Pro",
  "High Contrast",
  "Solar",
] as const
type ThemeName = typeof THEMES[number]

function useTheme(): [ThemeName, (t: ThemeName) => void] {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = (localStorage.getItem(THEME_KEY) as ThemeName) || "Light"
    return saved
  })
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])
  return [theme, setTheme]
}

/* ---------------- Simple dropdown (no shadcn dependency) ---------------- */
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
  return ref
}

function ThemeDropdown({
  theme,
  onChange,
}: {
  theme: ThemeName
  onChange: (t: ThemeName) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))
  const short = useMemo(() => (theme.length > 14 ? theme.slice(0, 14) + "…" : theme), [theme])

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        className="border-[color:var(--border)] text-[var(--text)] bg-[var(--card)] hover:bg-[var(--muted)]/60"
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

/* ---------------- App ---------------- */
export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useTheme()

  return (
    <div className="relative min-h-screen text-[var(--text)] bg-[var(--bg)]">
      {/* Accent blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 size-[26rem] rounded-full
                      blur-2xl [will-change:transform] motion-safe:animate-[blob1_12s_ease-in-out_infinite_alternate]
                      bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,var(--accent)_40%,transparent_70%)] opacity-30" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 size-[28rem] rounded-full
                      blur-2xl [will-change:transform] motion-safe:animate-[blob2_16s_ease-in-out_infinite_alternate]
                      bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,var(--accent)_40%,transparent_70%)] opacity-25" />

      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b bg-[color:var(--card)]/80 border-[color:var(--border)] backdrop-blur supports-[backdrop-filter]:bg-[color:var(--card)]/60">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <Button
            variant="outline"
            size="sm"
            className="border-[color:var(--border)] text-[color:var(--text)] hover:bg-[var(--muted)] md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <AlignLeft className="size-4" />
          </Button>

          <div className="hidden md:flex items-center gap-2 font-semibold tracking-tight">
            <Rocket className="size-4" />
            <span>Beam Design</span>
            <Badge className="bg-[var(--accent)] text-[var(--accent-contrast)]">demo</Badge>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 opacity-60" />
              <Input
                placeholder="Search…"
                className="pl-8 w-56 sm:w-72 bg-[var(--input)] text-[var(--text)] border-[color:var(--border)]"
              />
            </div>

            {/* Visible on all sizes */}
            <ThemeDropdown theme={theme} onChange={setTheme} />
          </div>
        </div>
      </header>

      {/* Subheader tabs */}
      <section className="sticky top-[56px] z-30 border-b bg-[var(--card)]/80 border-[color:var(--border)] backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-2 md:px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="h-9 bg-[var(--muted)]">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-[var(--accent-contrast)]">Overview</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-[var(--accent-contrast)]">Activity</TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-[var(--accent-contrast)]">Team</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Fixed sidebar (desktop) */}
      <aside
        className="fixed left-0 top-[96px] hidden h-[calc(100dvh-96px)] w-[240px] border-r border-[color:var(--border)]
                   bg-[var(--card)]/85 backdrop-blur md:block"
      >
        <div className="h-full overflow-auto">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 font-semibold">
              <Rocket className="size-4" />
              <span>Beam Design</span>
            </div>
          </div>
          <Nav />
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] border-r border-[color:var(--border)] bg-[var(--card)]/95 backdrop-blur
                    transition-transform duration-300 md:hidden
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Rocket className="size-4" />
            <span>Beam Design</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-[color:var(--border)]"
            onClick={() => setMobileOpen(false)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="h-[calc(100dvh-56px)] overflow-auto">
          <Nav />
        </div>
      </aside>

      {/* Main content */}
      <main className="relative mx-auto max-w-7xl p-4 md:ml-[240px] md:p-6">
        <Tabs defaultValue="overview">
          <TabsContent value="overview" className="mt-0">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Overview"
                kpi="Active jobs"
                value="12"
                icon={<Home className="size-4" />}
              />
              <StatCard
                title="Performance"
                kpi="Efficiency"
                value="92%"
                icon={<BarChart3 className="size-4" />}
              />
              <StatCard
                title="Reputation"
                kpi="Rating"
                value={
                  <span className="inline-flex items-center gap-1">
                    4.8 <Star className="size-4" />
                  </span>
                }
                icon={<Star className="size-4" />}
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
                <CardHeader>
                  <CardTitle className="text-xl">Recent activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[var(--muted)]/40 p-4"
                    >
                      <div className="text-sm opacity-80">Task #{i + 1} reviewed</div>
                      <Badge variant="secondary" className="bg-[var(--muted)] text-[var(--text)] border-[color:var(--border)]">ok</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
                <CardHeader>
                  <CardTitle className="text-xl">Quick actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90">
                    New project
                  </Button>
                  <Button variant="outline" className="w-full border-[color:var(--border)]">
                    Import data
                  </Button>
                  <Button variant="outline" className="w-full border-[color:var(--border)]">
                    Manage settings
                  </Button>
                </CardContent>
                <CardFooter>
                  <div className="text-xs opacity-60">Tip: use the top tabs to switch views</div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <Card className="bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
              <CardHeader>
                <CardTitle className="text-xl">Activity feed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-[color:var(--border)] p-3 text-sm opacity-80 bg-[var(--muted)]/40">
                    • Job {i + 101} updated — status set to <b>In Review</b>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2">
              {["Alice", "Ben", "Chloe", "Dinesh"].map((name) => (
                <Card key={name} className="border-[color:var(--border)] bg-[var(--card)] text-[var(--text)]">
                  <CardHeader>
                    <CardTitle className="text-lg">{name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm opacity-80">
                    Role: Engineer · Active jobs: {Math.floor(Math.random() * 5) + 1}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-xs opacity-60">
          © {new Date().getFullYear()} Cantilever · Vite · Tailwind v4 · shadcn/ui
        </div>
      </main>
    </div>
  )
}

/* ---------------- helpers ---------------- */

function Nav() {
  const items = [
    { label: "Home", icon: <Home className="size-4" /> },
    { label: "Analytics", icon: <BarChart3 className="size-4" /> },
    { label: "Settings", icon: <Settings className="size-4" /> },
  ]
  return (
    <nav className="p-3">
      <div className="mb-3 rounded-xl border border-[color:var(--border)]">
        <div className="rounded-xl bg-[var(--card)] p-3">
          <div className="text-sm opacity-80">Navigation</div>
        </div>
      </div>
      <ul className="space-y-1">
        {items.map((x) => (
          <li key={x.label}>
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm
                         hover:bg-[var(--muted)]/40 data-[active=true]:bg-[var(--muted)]/60 transition-colors"
              data-active={x.label === "Home"}
            >
              {x.icon}
              <span>{x.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function StatCard({
  title,
  kpi,
  value,
  icon,
}: {
  title: string
  kpi: string
  value: React.ReactNode
  icon: React.ReactNode
}) {
  return (
    <Card className="border-[color:var(--border)] bg-[var(--card)] text-[var(--text)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm opacity-70">{title}</div>
        <div className="opacity-70">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-xs opacity-70">{kpi}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  )
}

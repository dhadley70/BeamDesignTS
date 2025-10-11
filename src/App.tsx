import { useEffect, useMemo, useRef, useState } from "react"

interface ProjectInfoState {
  projectNumber?: string
  projectName?: string
  name?: string
  engineer?: string
  engineerDate?: string
  verifier?: string
  verifierDate?: string
  description?: string
}

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
  Circle,
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
  return ref as React.RefObject<T>
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

/* ---------------- Project Info Hook ---------------- */
function useProjectInfo() {
  const [projectInfo, setProjectInfoState] = useState({
    projectNumber: '',
    projectName: '',
    name: '',
    engineer: '',
    engineerDate: '',
    verifier: '',
    verifierDate: '',
    description: ''
  })

  // Load from local storage on initial render
  useEffect(() => {
    const savedProjectInfo = localStorage.getItem('projectInfo')
    if (savedProjectInfo) {
      setProjectInfoState(JSON.parse(savedProjectInfo))
    }
  }, [])

  // Save to local storage whenever projectInfo changes
  const setProjectInfo = (updates: Partial<typeof projectInfo>) => {
    const newProjectInfo = { ...projectInfo, ...updates }
    setProjectInfoState(newProjectInfo)
    localStorage.setItem('projectInfo', JSON.stringify(newProjectInfo))
  }

  // Optional: No alias function needed

  return [projectInfo, setProjectInfo] as const
}

/* ---------------- App ---------------- */
export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useTheme()
  const [projectInfo, setProjectInfo] = useProjectInfo()

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[var(--text)] bg-[var(--bg)]">
      {/* BG accents */}
      <div className="absolute inset-0 -z-10 overflow-x-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 size-[26rem] rounded-full
                        blur-2xl [will-change:transform] motion-safe:animate-[blob1_12s_ease-in-out_infinite_alternate]
                        bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,var(--accent)_40%,transparent_70%)] opacity-30" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 size-[28rem] rounded-full
                        blur-2xl [will-change:transform] motion-safe:animate-[blob2_16s_ease-in-out_infinite_alternate]
                        bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,var(--accent)_40%,transparent_70%)] opacity-25" />
      </div>

      {/* FULL-HEIGHT SIDEBAR (desktop) */}
      <aside
        className="fixed inset-y-0 left-0 hidden w-[240px] border-r border-[color:var(--border)]
                   bg-[var(--card)]/85 backdrop-blur md:block overflow-y-auto overflow-x-hidden z-30"
      >
        {/* updated brand: Circle icon + "Radial" link */}
        <div className="px-4 py-4 sticky top-0 bg-[var(--card)]/90 backdrop-blur border-b border-[color:var(--border)]/50">
          <div className="flex items-center gap-2 font-semibold">
            <Circle className="size-4" />
            <a
              href="https://www.radialsolutions.com.au"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:underline"
            >
              Radial
            </a>
          </div>
        </div>
        <Nav />
      </aside>

      {/* HEADER (unchanged brand) */}
      <header className="sticky top-0 z-40 border-b bg-[color:var(--card)]/80 border-[color:var(--border)] backdrop-blur supports-[backdrop-filter]:bg-[color:var(--card)]/60 md:ml-[240px]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-2 font-semibold tracking-tight">
            <Rocket className="size-4 shrink-0" />
            <span className="truncate">Beam Design</span>
            <Badge className="shrink-0 bg-[var(--accent)] text-[var(--accent-contrast)]">demo</Badge>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 opacity-60" />
              <Input
                placeholder="Search…"
                className="pl-8 w-56 sm:w-72 bg-[var(--input)] text-[var(--text)] border-[color:var(--border)]"
              />
            </div>
            <ThemeDropdown theme={theme} onChange={setTheme} />
            <Button
              variant="outline"
              size="sm"
              className="border-[color:var(--border)] text-[color:var(--text)] hover:bg-[var(--muted)] md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <AlignLeft className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* SUBHEADER */}
      <section className="sticky top-[56px] z-30 border-b bg-[var(--card)]/80 border-[color:var(--border)] backdrop-blur md:ml-[240px]">
        <div className="mx-auto max-w-7xl px-4 py-2 md:px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="flex h-9 w-full items-center justify-start gap-1 bg-[var(--muted)] overflow-x-auto">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-[var(--accent-contrast)] whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-[var(--accent-contrast)] whitespace-nowrap">Activity</TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-[var(--accent-contrast)] whitespace-nowrap">Team</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* MOBILE OVERLAY SIDEBAR (updated brand as well) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] border-r border-[color:var(--border)] bg-[var(--card)]/95 backdrop-blur
                    transition-transform duration-300 md:hidden overflow-x-hidden
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Circle className="size-4" />
            <a
              href="https://www.radialsolutions.com.au"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:underline"
            >
              Radial
            </a>
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
        <div className="h-[calc(100dvh-56px)] overflow-y-auto">
          <Nav />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="relative mx-auto max-w-7xl p-4 md:ml-[240px] md:p-6 overflow-x-hidden">
        <Tabs defaultValue="overview">
          <TabsContent value="overview" className="mt-0">
            <Card className="mb-6 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
              <CardHeader>
                <CardTitle className="text-xl">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[0.2fr_0.6fr_0.2fr] gap-4">
                  <Input 
                    placeholder="Project Number" 
                    value={projectInfo.projectNumber || ''}
                    onChange={(e) => setProjectInfo({ projectNumber: e.target.value })}
                    className="w-full bg-[var(--input)] text-[var(--text)] border-[color:var(--border)]" 
                  />
                  <Input 
                    placeholder="Project Name" 
                    value={projectInfo.projectName || ''}
                    onChange={(e) => setProjectInfo({ projectName: e.target.value })}
                    className="w-full bg-[var(--input)] text-[var(--text)] border-[color:var(--border)]" 
                  />
                  <Input 
                    placeholder="Name" 
                    value={projectInfo.name || ''}
                    onChange={(e) => setProjectInfo({ name: e.target.value })}
                    className="w-full bg-[var(--input)] text-[var(--text)] border-[color:var(--border)]" 
                  />
                </div>
                
                <div className="grid grid-cols-[0.25fr_0.25fr_0.25fr_0.25fr] gap-4">
                  <Input 
                    placeholder="Engineer" 
                    value={projectInfo.engineer || ''}
                    onChange={(e) => setProjectInfo({ engineer: e.target.value })}
                    className="w-full bg-[var(--input)] text-[var(--text)] border-[color:var(--border)]" 
                  />
                  <Input 
                    type="date"
                    value={projectInfo.engineerDate || ''}
                    onChange={(e) => setProjectInfo({ engineerDate: e.target.value })}
                    className="w-full bg-[var(--input)] text-[var(--text)] border-[color:var(--border)]" 
                  />
                  <Input 
                    placeholder="Verifier" 
                    value={projectInfo.verifier || ''}
                    onChange={(e) => setProjectInfo({ verifier: e.target.value })}
                    className="w-full bg-[var(--input)] text-[var(--text)] border-[color:var(--border)]" 
                  />
                  <Input 
                    type="date"
                    value={projectInfo.verifierDate || ''}
                    onChange={(e) => setProjectInfo({ verifierDate: e.target.value })}
                    className="w-full bg-[var(--input)] text-[var(--text)] border-[color:var(--border)]" 
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <textarea 
                    placeholder="Description" 
                    value={projectInfo.description || ''}
                    onChange={(e) => setProjectInfo({ description: e.target.value })}
                    className="w-full bg-[var(--input)] text-[var(--text)] border-[color:var(--border)] h-20 rounded-md p-2 resize-y" 
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

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
                  {[
                    "Beam Design Phase 1 Initiated",
                    "Structural Analysis Complete",
                    "Material Procurement Update",
                    "Environmental Impact Assessment",
                    "Client Consultation Scheduled"
                  ].map((projectInfo, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[var(--muted)]/40 p-4"
                    >
                      <div className="text-sm opacity-80">{projectInfo}</div>
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

      {/* MOBILE SCRIM */}
      {mobileOpen && (
        <button
          aria-label="Close sidebar scrim"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  )
}

/* ---------------- helpers ---------------- */

function Nav() {
  const [openSection, setOpenSection] = useState<string | null>("Navigation")
  
  const sections = [
    {
      title: "Navigation",
      icon: <Home className="size-4" />,
      items: [
        { label: "Home", icon: <Home className="size-4" /> },
        { label: "Analytics", icon: <BarChart3 className="size-4" /> },
      ]
    },
    {
      title: "Settings",
      icon: <Settings className="size-4" />,
      items: [
        { label: "Preferences", icon: <Settings className="size-4" /> },
        { label: "Account", icon: <Circle className="size-4" /> },
      ]
    }
  ]

  const toggleSection = (sectionTitle: string) => {
    setOpenSection(prev => prev === sectionTitle ? null : sectionTitle)
  }

  return (
    <nav className="p-3 space-y-2">
      {sections.map((section) => (
        <div key={section.title} className="border-b border-[color:var(--border)]/20 pb-2">
          <button 
            onClick={() => toggleSection(section.title)}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm 
                       hover:bg-[var(--muted)]/40 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-2">
              {section.icon}
              <span>{section.title}</span>
            </div>
            <ChevronDown 
              className={`size-4 transition-transform 
                          ${openSection === section.title ? 'rotate-180' : ''}`} 
            />
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out 
                        ${openSection === section.title 
                          ? 'max-h-96 opacity-100' 
                          : 'max-h-0 opacity-0'}`}
          >
            <div className="space-y-1 pt-2 pl-6">
              {section.items.map((x) => (
                <button
                  key={x.label}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm
                             hover:bg-[var(--muted)]/40 data-[active=true]:bg-[var(--muted)]/60 transition-colors"
                  data-active={x.label === "Home"}
                >
                  {x.icon}
                  <span>{x.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
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

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
import { InputWithUnit } from "@/components/ui/InputWithUnit"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
// Tabs import removed
import {
  AlignLeft,
  Home,
  BarChart3,
  Settings,
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
  "Light",
  "Wes Anderson",
  "Slate",
  "Octonauts",
  "Shaun Tan",
  "Rainforest",
  "Midnight",
  "Citrus",
  "Lavender",
  "Sandstone",
  "Aurora",
  "Blade Runner",
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
  "C64",
  "Star Wars",
  "Barbie",
  "Matrix",
  "Dune",
  "Tron",
  "Jurassic Park",
  "Lord of the Rings",
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

const memberOptions = [1, 2, 3, 4] as const; // Added missing memberOptions
const clampSpan = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? Math.max(0.1, n) : 0.1
}

type UsageOption = "Normal" | "No Traffic" | "Storage"

type GeneralInputs = {
  members: number | undefined
  span?: number
  usage?: UsageOption
  // ...
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
  const [generalInputs, setGeneralInputs] = useState({
    span: '3.0',
    usage: 'Normal',
    lateralRestraint: 'Full Lateral Restraint',
    members: '1'
  })

  const handleMembersChange = (val: string) => {
    setGeneralInputs(prev => ({
      ...prev,
      members: val,
    }));
  };

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

      {/* Sidebar removed */}

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-[color:var(--card)]/80 border-[color:var(--border)] backdrop-blur supports-[backdrop-filter]:bg-[color:var(--card)]/60">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-2 font-semibold tracking-tight">
            <Rocket className="size-4 shrink-0" />
            <span className="truncate">Beam Design</span>
            <Badge className="shrink-0 bg-[var(--accent)] text-[var(--accent-contrast)]">demo</Badge>
          </div>
          <div className="ml-auto flex items-center gap-2">
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
      <main className="relative mx-auto max-w-7xl p-4 md:p-6 overflow-x-hidden">

        <Card className="mb-6 lg:col-span-2 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
          <CardHeader>
            <CardTitle className="text-xl">Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[0.15fr_0.65fr_0.2fr] gap-4">
              <Input
                placeholder="Project Number"
                value={projectInfo.projectNumber || ''}
                onChange={(e) => setProjectInfo({ projectNumber: e.target.value })}
                className="w-full bg-[var(--input)] border-[color:var(--border)]"
              />
              <Input
                placeholder="Project Name"
                value={projectInfo.projectName || ''}
                onChange={(e) => setProjectInfo({ projectName: e.target.value })}
                className="w-full bg-[var(--input)] border-[color:var(--border)]"
              />
              <Input
                placeholder="Item Name"
                value={projectInfo.name || ''}
                onChange={(e) => setProjectInfo({ name: e.target.value })}
                className="w-full bg-[var(--input)] border-[color:var(--border)]"
              />
            </div>

            <div className="grid grid-cols-[0.25fr_0.25fr_0.25fr_0.25fr] gap-4">
              <Input
                placeholder="Engineer"
                value={projectInfo.engineer || ''}
                onChange={(e) => setProjectInfo({ engineer: e.target.value })}
                className="w-full bg-[var(--input)] border-[color:var(--border)]"
              />
              <Input
                type="date"
                value={projectInfo.engineerDate || ''}
                onChange={(e) => setProjectInfo({ engineerDate: e.target.value })}
                className="w-full bg-[var(--input)] border-[color:var(--border)]"
              />
              <Input
                placeholder="Verifier"
                value={projectInfo.verifier || ''}
                onChange={(e) => setProjectInfo({ verifier: e.target.value })}
                className="w-full bg-[var(--input)] border-[color:var(--border)]"
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
                className="w-full bg-[var(--input)] border-1 border-[color:var(--border)] rounded-md p-2 resize-y"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* STATS CARDS */}

        <Card className="mb-6 lg:col-span-2 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
          <CardHeader>
            <CardTitle className="text-xl">General Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">

              {/* * *--------------- SPAN ---------------------------- */}

              <div className="space-y-1.5">
                <label htmlFor="span" className="block text-sm font-medium text-[var(--text)]">
                  Span
                </label>

                <InputWithUnit
                  id="span"
                  unit="m"
                  type="number"
                  inputMode="decimal"
                  min={0.1}            // native hint; JS clamp is the real enforcement
                  step={0.01}
                  placeholder="Span"
                  value={(generalInputs.span ?? 0.1).toString()}  // always valid
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const clamped = clampSpan(e.currentTarget.value)
                    setGeneralInputs(p => ({ ...p, span: clamped.toString() }))
                  }}
                  className="w-full bg-[var(--input)] border-[color:var(--border)]"
                />
              </div>


              {/* * *--------------- NUMBER OF MEMBERS ----------------------- */}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--text)]">Number of members</label>
                <Select
                  // SelectComponent expects a string value
                  value={generalInputs.members !== undefined ? String(generalInputs.members) : ""}
                  onValueChange={handleMembersChange}
                >
                  <SelectTrigger className="w-full bg-[var(--input)] border-[color:var(--border)]">
                    <SelectValue placeholder="Number of members" />
                  </SelectTrigger>

                  <SelectContent>
                    {[1, 2, 3, 4].map(n => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              {/* * *--------------- USAGE ----------------------- */}

              <div className="space-y-1.5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text)]">
                    Usage
                  </label>

                  <Select
                    // Select expects a string; show placeholder if undefined
                    value={generalInputs.usage ?? ""}
                    onValueChange={(val: UsageOption) =>
                      setGeneralInputs(p => ({ ...p, usage: val }))
                    }
                  >
                    <SelectTrigger className="w-full bg-[var(--input)] border-[color:var(--border)]">
                      <SelectValue placeholder="Select usage" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="No Traffic">No Traffic</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>


              {/* * *--------------- LATERAL STABILITY ----------------------- */}



              <div className="space-y-1.5">
                <label htmlFor="lateralRestraint" className="block text-sm font-medium text-[var(--text)]">
                  Lateral Restraint
                </label>
                <Input
                  placeholder="Lateral Restraint"
                  value={generalInputs.lateralRestraint || ''}
                  onChange={(e) => setGeneralInputs(prev => ({ ...prev, lateralRestraint: e.target.value }))}
                  className="w-full bg-[var(--input)] border-[color:var(--border)]"
                />
              </div>
            </div>

          </CardContent>
        </Card>


        {/* ---------------- */}



        <div className="grid gap-4 space-y-4 md:grid-cols-3">
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

        <div className="grid gap-6 lg:grid-cols-3">
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
            <CardContent className="space-y-4">
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
              <div className="text-xs opacity-60">Tip: projects are tracked dynamically</div>
            </CardFooter>
          </Card>
        </div>

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

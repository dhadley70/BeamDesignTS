import { useEffect, useMemo, useRef, useState } from "react"

// Removed ProjectInfoState interface (now imported from projectInfo.tsx)

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GeneralInputsCard } from "@/components/generalInputs"
import { DeflectionLimitsCard } from "@/components/deflectionLimits"
import { LoadsInputCard, type UDLLoad } from "@/components/loadsInput"
import { AlignLeft, Home, BarChart3, Settings, ChevronRight, Rocket, Star, Paintbrush, Check, ChevronDown, Circle, } from "lucide-react"

/* ---------------- Theming ---------------- */
const THEME_KEY = "app-theme"
const THEMES = ["Light", "Retro", "Wes Anderson", "Slate", "Octonauts", "Shaun Tan", "Rainforest", "Midnight", "Citrus", "Lavender", "Sandstone", "Aurora", "Blade Runner", "Dark", "Emerald", "Purple Breeze", "Sunset", "Ocean", "Rose", "Forest Night", "Slate Pro", "High Contrast", "Solar", "C64", "Star Wars", "Barbie", "Matrix", "Dune", "Tron", "Jurassic Park", "Lord of the Rings",] as const
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

// memberOptions removed

const clampSpan = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? Math.max(0.01, n) : 0.01
}



type UsageOption = "Normal" | "No Traffic" | "Storage"

type GeneralInputs = {
  span: number            // metres, >= 0.1
  members: number         // 1..4
  usage: UsageOption      // enum
  lateralRestraint: string
  ws: number             // short-term deflection variable
  wl: number             // long-term deflection variable
}

const GENERAL_INPUTS_KEY = "generalInputs"
const DEFLECTION_LIMITS_KEY = "deflectionLimits"

import usageData from '@/data/usage.json'
import type { DeflectionLimits } from "@/components/deflectionLimits"

type UsageDataType = {
  Normal: { ws: number; wl: number },
  "No Traffic": { ws: number; wl: number },
  Storage: { ws: number; wl: number }
}

const typedUsageData = usageData as UsageDataType

function loadGeneralInputs(): GeneralInputs {
  try {
    const raw = localStorage.getItem(GENERAL_INPUTS_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      const usage = (["Normal", "No Traffic", "Storage"] as const).includes(data.usage) 
        ? data.usage 
        : "Normal"
      const usageDetails = typedUsageData[usage as keyof UsageDataType]
      return {
        span: clampSpan(data.span),
        members: Number.isFinite(Number(data.members)) ? Number(data.members) : 1,
        usage: usage,
        lateralRestraint: typeof data.lateralRestraint === "string" 
          ? data.lateralRestraint 
          : "Lateral Restraint",
        ws: data.ws ?? usageDetails.ws,
        wl: data.wl ?? usageDetails.wl,
      }
    }
  } catch { }
  // defaults
  const defaultUsage = "Normal"
  const usageDetails = typedUsageData[defaultUsage]
  return { 
    span: 3.0, 
    members: 1, 
    usage: defaultUsage, 
    lateralRestraint: "Lateral Restraint",
    ws: usageDetails.ws,
    wl: usageDetails.wl
  }
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
import { useProjectInfo, ProjectInfoCard } from "@/components/projectInfo"

/* ---------------- App ---------------- */
export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useTheme()
  const [projectInfo, setProjectInfo] = useProjectInfo()

  // Load general inputs once on mount, then persist on change
  const [generalInputs, setGeneralInputs] = useState<GeneralInputs>(() => loadGeneralInputs())
  
  // State for the UDL loads
  const [loads, setLoads] = useState<UDLLoad[]>([])
  useEffect(() => {
    // persist any change
    localStorage.setItem(GENERAL_INPUTS_KEY, JSON.stringify(generalInputs))
  }, [generalInputs])

  // Load deflection limits from local storage
  const calculateMaxDeflection = (span: number, spanRatio: number, maxLimit: number) => {
    // Convert span to mm
    const spanMm = span * 1000
    
    // Calculate deflection by span ratio
    const ratioDeflection = spanMm / spanRatio
    
    // Return the lesser of ratio-based deflection or max limit
    return Math.min(ratioDeflection, maxLimit)
  }

  const loadDeflectionLimits = (): DeflectionLimits => {
    try {
      const raw = localStorage.getItem(DEFLECTION_LIMITS_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        console.log('Loaded deflection limits data:', data)
        
        // Using 'initial' key consistently
        const initialData = data.initial || {}
        const shortData = data.short || {}
        const longData = data.long || {}
        
        console.log('Initial Data:', initialData)
        console.log('Short Data:', shortData)
        console.log('Long Data:', longData)
        
        return {
          initial: {
            spanRatio: Number.isInteger(initialData.spanRatio) ? initialData.spanRatio : 240,
            maxLimit: Number.isFinite(initialData.maxLimit) ? initialData.maxLimit : (generalInputs.span * 1000 / 240) / 1000,
            maxDeflection: calculateMaxDeflection(
              generalInputs.span, 
              Number.isInteger(initialData.spanRatio) ? initialData.spanRatio : 240, 
              Number.isFinite(initialData.maxLimit) ? initialData.maxLimit : (generalInputs.span * 1000 / 240) / 1000
            )
          },
          short: {
            spanRatio: Number.isInteger(shortData.spanRatio) ? shortData.spanRatio : 180,
            maxLimit: Number.isFinite(shortData.maxLimit) ? shortData.maxLimit : (generalInputs.span * 1000 / 180) / 1000,
            maxDeflection: calculateMaxDeflection(
              generalInputs.span, 
              Number.isInteger(shortData.spanRatio) ? shortData.spanRatio : 180, 
              Number.isFinite(shortData.maxLimit) ? shortData.maxLimit : (generalInputs.span * 1000 / 180) / 1000
            )
          },
          long: {
            spanRatio: Number.isInteger(longData.spanRatio) ? longData.spanRatio : 120,
            maxLimit: Number.isFinite(longData.maxLimit) ? longData.maxLimit : (generalInputs.span * 1000 / 120) / 1000,
            maxDeflection: calculateMaxDeflection(
              generalInputs.span, 
              Number.isInteger(longData.spanRatio) ? longData.spanRatio : 120, 
              Number.isFinite(longData.maxLimit) ? longData.maxLimit : (generalInputs.span * 1000 / 120) / 1000
            )
          }
        }
      }
    } catch (error) { 
      console.error('Error loading deflection limits:', error)
    }
    
    // Default limits 
    return {
      initial: {
        spanRatio: 240,  // Span/240
        maxLimit: (generalInputs.span * 1000 / 240) / 1000,
        maxDeflection: calculateMaxDeflection(generalInputs.span, 240, (generalInputs.span * 1000 / 240) / 1000)
      },
      short: {
        spanRatio: 180,  // Span/180
        maxLimit: (generalInputs.span * 1000 / 180) / 1000,
        maxDeflection: calculateMaxDeflection(generalInputs.span, 180, (generalInputs.span * 1000 / 180) / 1000)
      },
      long: {
        spanRatio: 120,  // Span/120
        maxLimit: (generalInputs.span * 1000 / 120) / 1000,
        maxDeflection: calculateMaxDeflection(generalInputs.span, 120, (generalInputs.span * 1000 / 120) / 1000)
      }
    }
  }

  // Deflection Limits State
  const [deflectionLimits, setDeflectionLimits] = useState<DeflectionLimits>(() => loadDeflectionLimits())

  // Persist deflection limits changes
  useEffect(() => {
    // Use 'initial' key consistently
    localStorage.setItem(DEFLECTION_LIMITS_KEY, JSON.stringify(deflectionLimits))
  }, [deflectionLimits])

  // Removed local states related to general inputs



  return (
    <div className="relative min-h-screen overflow-x-hidden text-[var(--text)] bg-[var(--bg)]">
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

      {/* MAIN CONTENT */}
      <main className="relative mx-auto max-w-7xl p-4 md:p-6 overflow-x-hidden">

        <ProjectInfoCard
          projectInfo={projectInfo}
          setProjectInfo={setProjectInfo}
        />

        <GeneralInputsCard
          generalInputs={generalInputs}
          setGeneralInputs={setGeneralInputs}
        />

        <DeflectionLimitsCard
          deflectionLimits={deflectionLimits}
          setDeflectionLimits={setDeflectionLimits}
          span={generalInputs.span}
        />

        <LoadsInputCard
          loads={loads}
          setLoads={setLoads}
          span={generalInputs.span}
        />

        {/* Stats */}
        <div className="grid gap-4 space-y-4 md:grid-cols-4">
          <StatCard title="Overview" kpi="Active jobs" value="12" icon={<Home className="size-4" />} />
          <StatCard
            title="Reputation"
            kpi="Rating"
            value={<span className="inline-flex items-center gap-1">4.8 <Star className="size-4" /></span>}
            icon={<Star className="size-4" />}
          />
          <StatCard title="Performance" kpi="Efficiency" value="92%" icon={<BarChart3 className="size-4" />} />
     
        </div>
        {/* Recent activity + Quick actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
            <CardHeader><CardTitle className="text-xl">Recent activity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                "Beam Design Phase 1 Initiated",
                "Structural Analysis Complete",
                "Material Procurement Update",
                "Environmental Impact Assessment",
                "Client Consultation Scheduled"
              ].map((txt, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[var(--muted)]/40 p-4">
                  <div className="text-sm opacity-80">{txt}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
            <CardHeader><CardTitle className="text-xl">Quick actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90">New project</Button>
              <Button variant="outline" className="w-full border-[color:var(--border)]">Import data</Button>
              <Button variant="outline" className="w-full border-[color:var(--border)]">Manage settings</Button>
            </CardContent>
            <CardFooter><div className="text-xs opacity-60">Tip: projects are tracked dynamically</div></CardFooter>
          </Card>
        </div>

        <div className="mt-8 space-y-4 text-xs opacity-60">
          © {new Date().getFullYear()} Cantilever · Vite · Tailwind v4 · shadcn/ui
        </div>
      </main>

      {/* MOBILE SCRIM */}
      {
        mobileOpen && (
          <button
            aria-label="Close sidebar scrim"
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )
      }
    </div >
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

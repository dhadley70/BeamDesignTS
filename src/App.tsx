import { useEffect, useState } from "react"
import useLocalStorage from "@/hooks/useLocalStorage"

// Removed ProjectInfoState interface (now imported from projectInfo.tsx)

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GeneralInputsCard, getDefaultGeneralInputs } from "@/components/generalInputs"
import { DeflectionLimitsCard } from "@/components/deflectionLimits"
import { LoadsInputCard, type UDLLoad } from "@/components/loadsInput"
import { SaveLoadDesign } from "@/components/saveLoadDesign"
import { HeaderSaveButtons } from "@/components/headerSaveButtons"
import { ThemeDropdown, type ThemeName, useTheme } from "@/components/theme-dropdown"
import { AlignLeft, Home, BarChart3, Settings, Rocket, Star, Circle, ChevronDown } from "lucide-react"

/* ---------------- Theming ---------------- */

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

import type { DeflectionLimits } from "@/components/deflectionLimits"

/* ---------------- Theme Utils ---------------- */

/* ---------------- Project Info Hook ---------------- */
import { useProjectInfo, ProjectInfoCard } from "@/components/projectInfo"
import deflectionPresets from "@/data/deflection_presets.json"

/* ---------------- App ---------------- */
export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useTheme()
  const [projectInfo, setProjectInfo] = useProjectInfo()

  // Use localStorage hook for general inputs
  const [generalInputs, setGeneralInputs] = useLocalStorage<GeneralInputs>(GENERAL_INPUTS_KEY, getDefaultGeneralInputs())
  
  // State for the UDL loads with localStorage persistence
  const [loads, setLoads] = useLocalStorage<UDLLoad[]>('beamLoads', [])

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
    
    // Use first preset from deflection_presets.json as default
    const firstPreset = deflectionPresets[0];
    
    return {
      initial: {
        spanRatio: firstPreset.inst.ratio,
        maxLimit: firstPreset.inst.max / 1000, // Convert from mm to meters
        maxDeflection: calculateMaxDeflection(generalInputs.span, firstPreset.inst.ratio, firstPreset.inst.max / 1000)
      },
      short: {
        spanRatio: firstPreset.short.ratio,
        maxLimit: firstPreset.short.max / 1000, // Convert from mm to meters
        maxDeflection: calculateMaxDeflection(generalInputs.span, firstPreset.short.ratio, firstPreset.short.max / 1000)
      },
      long: {
        spanRatio: firstPreset.long.ratio,
        maxLimit: firstPreset.long.max / 1000, // Convert from mm to meters
        maxDeflection: calculateMaxDeflection(generalInputs.span, firstPreset.long.ratio, firstPreset.long.max / 1000)
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
            <HeaderSaveButtons 
              onImportComplete={() => window.location.reload()}
            />
            <ThemeDropdown theme={theme} onChange={setTheme} />
            <Button
              variant="outline"
              size="sm"
              className="border-[color:var(--border)] text-[color:var(--text)] hover:bg-[var(--muted)] hover:text-[color:var(--card)] md:hidden"
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

        {/* Save & Load Design */}
        <SaveLoadDesign 
          onImportComplete={() => window.location.reload()}
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
              <Button 
                variant="outline" 
                className="w-full border-[color:var(--border)]"
                onClick={() => {
                  const importFileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                  if (importFileInput) importFileInput.click();
                }}
                >
                Open design
              </Button>
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

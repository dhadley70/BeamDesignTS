import { useEffect, useState } from "react"
import useLocalStorage from "@/hooks/useLocalStorage"
import { COLLAPSE_ALL_CARDS, EXPAND_ALL_CARDS, getGlobalCardState, saveGlobalCardState } from "@/lib/cardStateManager"

// Removed ProjectInfoState interface (now imported from projectInfo.tsx)

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GeneralInputsCard, getDefaultGeneralInputs } from "@/components/generalInputs"
import { DeflectionLimitsCard } from "@/components/deflectionLimits"
import { LoadsInputCard, type UDLLoad } from "@/components/loadsInput"
import { SectionsInputCard } from "@/components/sectionsInput"
import { DesignAnalysisCard } from "@/components/designAnalysis"
import { SaveLoadDesign } from "@/components/saveLoadDesign"
import { HeaderSaveButtons } from "@/components/headerSaveButtons"
import { ThemeDropdown, type ThemeName, useTheme } from "@/components/theme-dropdown"
import { SectionNavigator, type SectionName } from "@/components/SectionNavigator"
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



  // Track which section is currently active
  const [currentSection, setCurrentSection] = useState<SectionName>('project');
  
  // Global keyboard shortcut for expanding/collapsing all cards
  useEffect(() => {
    // Initialize with the saved state from localStorage
    let allCardsCollapsed = getGlobalCardState();
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.key === 'k' || event.key === 'K') && 
          (navigator.platform.indexOf('Mac') !== -1 ? event.metaKey : event.ctrlKey)) {
        
        // Prevent default browser behavior
        event.preventDefault();
        
        // Toggle between collapsed and expanded
        allCardsCollapsed = !allCardsCollapsed;
        
        // Save state to localStorage
        saveGlobalCardState(allCardsCollapsed);
        
        // Dispatch appropriate event based on current state
        if (allCardsCollapsed) {
          window.dispatchEvent(new CustomEvent(COLLAPSE_ALL_CARDS));
        } else {
          window.dispatchEvent(new CustomEvent(EXPAND_ALL_CARDS));
        }
        
        console.log(`All cards ${allCardsCollapsed ? 'collapsed' : 'expanded'} via keyboard shortcut`);
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
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
        <SectionNavigator currentSection={currentSection}>
          {/* Project Info Card */}
          <div onClick={() => setCurrentSection('project')}>
            <ProjectInfoCard
              projectInfo={projectInfo}
              setProjectInfo={setProjectInfo}
            />
          </div>
          
          {/* General Inputs Card */}
          <div onClick={() => setCurrentSection('general')}>
            <GeneralInputsCard
              generalInputs={generalInputs}
              setGeneralInputs={setGeneralInputs}
            />
          </div>
          
          {/* Deflection Limits Card */}
          <div onClick={() => setCurrentSection('deflection')}>
            <DeflectionLimitsCard
              deflectionLimits={deflectionLimits}
              setDeflectionLimits={setDeflectionLimits}
              span={generalInputs.span}
            />
          </div>
          
          {/* Loads Input Card */}
          <div onClick={() => setCurrentSection('loads')}>
            <LoadsInputCard
              loads={loads}
              setLoads={setLoads}
              span={generalInputs.span}
            />
          </div>
          
          {/* Sections Input Card */}
          <div onClick={() => setCurrentSection('sections')}>
            <SectionsInputCard />
          </div>
          
          {/* Design Analysis Card */}
          <div onClick={() => setCurrentSection('design')}>
            <div className="mb-8">
              <DesignAnalysisCard />
            </div>
          </div>
          
          {/* Save & Load Design */}
          <div onClick={() => setCurrentSection('saveLoad')} className="mt-8">
            <SaveLoadDesign
              onImportComplete={() => window.location.reload()}
            />
          </div>
        </SectionNavigator>

        <div className="mt-8 space-y-4 text-xs opacity-60">
          © {new Date().getFullYear()} Radial · Vite · Tailwind v4 · shadcn/ui
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

import useLocalStorage from "@/hooks/useLocalStorage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { COLLAPSE_ALL_CARDS, EXPAND_ALL_CARDS, getShortcutKey } from "@/lib/cardStateManager"
import { useEffect } from "react"

export interface ProjectInfoState {
  projectNumber?: string
  projectName?: string
  name?: string
  engineer?: string
  engineerDate?: string
  verifier?: string
  verifierDate?: string
  description?: string
}

export function useProjectInfo() {
  const [projectInfo, setProjectInfoState] = useLocalStorage<ProjectInfoState>('projectInfo', {
    projectNumber: '',
    projectName: '',
    name: '',
    engineer: '',
    engineerDate: '',
    verifier: '',
    verifierDate: '',
    description: ''
  })

  const setProjectInfo = (updates: Partial<ProjectInfoState>) => {
    const newProjectInfo = { ...projectInfo, ...updates }
    setProjectInfoState(newProjectInfo)
  }

  return [projectInfo, setProjectInfo] as const
}

export function ProjectInfoCard({ 
  projectInfo, 
  setProjectInfo 
}: { 
  projectInfo: ProjectInfoState, 
  setProjectInfo: (updates: Partial<ProjectInfoState>) => void 
}) {
  // Local state for collapsed status with localStorage persistence
  const [collapsed, setCollapsed] = useLocalStorage('projectInfoCard_collapsed', false);
  
  // Handle global collapse/expand events
  useEffect(() => {
    const handleCollapseAll = () => setCollapsed(true);
    const handleExpandAll = () => setCollapsed(false);
    
    window.addEventListener(COLLAPSE_ALL_CARDS, handleCollapseAll);
    window.addEventListener(EXPAND_ALL_CARDS, handleExpandAll);
    
    return () => {
      window.removeEventListener(COLLAPSE_ALL_CARDS, handleCollapseAll);
      window.removeEventListener(EXPAND_ALL_CARDS, handleExpandAll);
    };
  }, [setCollapsed]);
  
  // Generate summary for collapsed view
  const getProjectSummary = () => {
    const projectNumberText = projectInfo.projectNumber ? `#${projectInfo.projectNumber}` : '';
    const projectNameText = projectInfo.projectName || '';
    
    if (projectNumberText && projectNameText) {
      return `(${projectNumberText}: ${projectNameText})`;
    } else if (projectNumberText) {
      return `(${projectNumberText})`;
    } else if (projectNameText) {
      return `(${projectNameText})`;
    }
    return '(No project details)';
  };
  
  return (
    <Card className="mb-6 lg:col-span-2 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">
          Project Information
          {collapsed && <span className="text-sm font-normal ml-2 text-muted-foreground">{getProjectSummary()}</span>}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          title={`Toggle card visibility (${getShortcutKey()} to toggle all)`}
          className="ml-auto h-8 w-8 p-0"
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {!collapsed && <CardContent className="space-y-4">
        <div className="grid grid-cols-[0.15fr_0.65fr_0.2fr] gap-4">
          <Input
            placeholder="Project Number"
            value={projectInfo.projectNumber || ''}
            onChange={(e) => setProjectInfo({ projectNumber: e.target.value })}
            className="w-full bg-[var(--input)] text-[var(--input-text)] border-[color:var(--border)]"
          />
          <Input
            placeholder="Project Name"
            value={projectInfo.projectName || ''}
            onChange={(e) => setProjectInfo({ projectName: e.target.value })}
            className="w-full bg-[var(--input)] text-[var(--input-text)] border-[color:var(--border)]"
          />
          <Input
            placeholder="Item Name"
            value={projectInfo.name || ''}
            onChange={(e) => setProjectInfo({ name: e.target.value })}
            className="w-full bg-[var(--input)] text-[var(--input-text)] border-[color:var(--border)]"
          />
        </div>

        <div className="grid grid-cols-[0.25fr_0.25fr_0.25fr_0.25fr] gap-4">
          <Input
            placeholder="Engineer"
            value={projectInfo.engineer || ''}
            onChange={(e) => setProjectInfo({ engineer: e.target.value })}
            className="w-full bg-[var(--input)] text-[var(--input-text)] border-[color:var(--border)]"
          />
          <Input
            type="date"
            value={projectInfo.engineerDate || ''}
            onChange={(e) => setProjectInfo({ engineerDate: e.target.value })}
            className="w-full bg-[var(--input)] text-[var(--input-text)] border-[color:var(--border)]"
          />
          <Input
            placeholder="Verifier"
            value={projectInfo.verifier || ''}
            onChange={(e) => setProjectInfo({ verifier: e.target.value })}
            className="w-full bg-[var(--input)] text-[var(--input-text)] border-[color:var(--border)]"
          />
          <Input
            type="date"
            value={projectInfo.verifierDate || ''}
            onChange={(e) => setProjectInfo({ verifierDate: e.target.value })}
            className="w-full bg-[var(--input)] text-[var(--input-text)] border-[color:var(--border)]"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <textarea
            placeholder="Description"
            value={projectInfo.description || ''}
            onChange={(e) => setProjectInfo({ description: e.target.value })}
            className="w-full bg-[var(--input)] text-[var(--input-text)] border-1 border-[color:var(--border)] rounded-md p-2 resize-y"
            rows={4}
          />
        </div>
      </CardContent>}
    </Card>
  )
}
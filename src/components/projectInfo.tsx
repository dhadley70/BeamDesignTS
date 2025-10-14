  import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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
  const [projectInfo, setProjectInfoState] = useState<ProjectInfoState>({
    projectNumber: '',
    projectName: '',
    name: '',
    engineer: '',
    engineerDate: '',
    verifier: '',
    verifierDate: '',
    description: ''
  })

  useEffect(() => {
    const savedProjectInfo = localStorage.getItem('projectInfo')
    if (savedProjectInfo) {
      try { setProjectInfoState(JSON.parse(savedProjectInfo)) } catch { }
    }
  }, [])

  const setProjectInfo = (updates: Partial<ProjectInfoState>) => {
    const newProjectInfo = { ...projectInfo, ...updates }
    setProjectInfoState(newProjectInfo)
    localStorage.setItem('projectInfo', JSON.stringify(newProjectInfo))
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
  return (
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
      </CardContent>
    </Card>
  )
}
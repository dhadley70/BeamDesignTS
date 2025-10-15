import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { InputWithUnit } from '@/components/ui/InputWithUnit'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import usageData from '@/data/usage.json'
import useLocalStorage from '@/hooks/useLocalStorage'

// Define local types
export type UsageOption = keyof typeof usageData
export interface GeneralInputs {
  span: number
  members: number
  usage: UsageOption
  lateralRestraint: string
  ws: number
  wl: number
}

const memberOptions = [1, 2, 3, 4, 5, 6]

// Get default values for a new general inputs object
export function getDefaultGeneralInputs(): GeneralInputs {
  const defaultUsage: UsageOption = 'Normal'
  const usageDetails = usageData[defaultUsage]
  return {
    span: 3.0,
    members: 1,
    usage: defaultUsage,
    lateralRestraint: 'Lateral Restraint',
    ws: usageDetails.ws,
    wl: usageDetails.wl
  }
}

export const GeneralInputsCard: React.FC<{
  generalInputs: GeneralInputs
  setGeneralInputs: React.Dispatch<React.SetStateAction<GeneralInputs>>
}> = ({ generalInputs, setGeneralInputs }) => {

  // Use local storage to persist general inputs
  const [localGeneralInputs, setLocalGeneralInputs] = useLocalStorage<GeneralInputs>(
    'generalInputs', 
    getDefaultGeneralInputs()
  )
  
  // Update parent state when local state changes
  React.useEffect(() => {
    console.log('localGeneralInputs changed:', localGeneralInputs);
    setGeneralInputs(localGeneralInputs)
  }, [localGeneralInputs, setGeneralInputs])
  
  // Track span input as a string for better UX
  const [spanDraft, setSpanDraft] = useState<string>(String(localGeneralInputs.span || ''))

  return (
    <Card className="mb-6 lg:col-span-2 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
      <CardHeader>
        <CardTitle className="text-xl">General Inputs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {/* Span (strict clamp) */}
          <div className="space-y-1.5">
            <label htmlFor="span" className="block text-sm font-medium text-[var(--text)]">
              Span
            </label>
            <InputWithUnit
              id="span"
              unit="m"
              type="number"
              inputMode="decimal"
              min={1}
              step={0.1}
              placeholder="Span"
              value={spanDraft}
              onFocus={() => {}}
              onBlur={() => {}}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const s = e.currentTarget.value
                setSpanDraft(s)

                // Always keep the numeric state valid for calcs:
                const n = Number(s.replace(",", "."))
                const clamped = Number.isFinite(n) ? Math.max(0.1, n) : 0.1
                setLocalGeneralInputs(prev => ({ ...prev, span: clamped }))
              }}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-[var(--input)] text-[var(--input-text)] border-[color:var(--border)] appearance-none"
            />
          </div>

          {/* Members */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text)]">Number of members</label>
            <Select
              value={String(generalInputs.members)}
              onValueChange={(val) => {
                const n = Number(val)
                const newMembers = Number.isFinite(n) ? n : generalInputs.members;
                console.log('Setting members to:', newMembers);
                setGeneralInputs(p => ({ ...p, members: newMembers }))
                // Also update localStorage directly to ensure it's saved
                setLocalGeneralInputs(prev => ({ ...prev, members: newMembers }))
              }}
            >
              <SelectTrigger className="w-full bg-[var(--input)] text-[var(--input-text)] border-[color:var(--border)]">
                <SelectValue placeholder="Number of members" />
              </SelectTrigger>
              <SelectContent>
                {memberOptions.map(n => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Usage */}
              <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text)]">Usage
                    <span className="ml-2 text-[var(--text)] opacity-70 text-xs">
                      (ws: {localGeneralInputs.ws}, wl: {localGeneralInputs.wl})
                    </span>

            </label>
            <Select
              value={localGeneralInputs.usage}
              onValueChange={(val: UsageOption) => {
                const usageDetails = usageData[val]
                setLocalGeneralInputs(p => ({ 
                  ...p, 
                  usage: val,
                  ws: usageDetails.ws,
                  wl: usageDetails.wl 
                }))
              }}
            >
                <SelectTrigger className="w-full bg-[var(--input)] text-[var(--input-text)] border-[color:var(--border)]">
                <SelectValue placeholder="Select usage">
                  <div className="flex items-center">
                    <span>{localGeneralInputs.usage}</span>

                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.keys(usageData).map((usage) => {
                  const details = usageData[usage as UsageOption]
                  return (
                    <SelectItem key={usage} value={usage}>
                      <div className="flex justify-between items-center w-full">
                        <span>{usage}</span>

                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>          
          {/* Lateral Restraint */}
          <div className="space-y-1.5 ">
            <label className="block text-sm font-medium text-[var(--text)]">
              Lateral Restraint
            </label>
            
            <Select
              value={localGeneralInputs.lateralRestraint || "Lateral Restraint"}
              onValueChange={(val) =>
                setLocalGeneralInputs(prev => ({ ...prev, lateralRestraint: val }))
              }
            >
              <SelectTrigger className="w-full bg-[var(--input)] text-[var(--input-text)] border-[color:var(--border)]">
                <SelectValue placeholder="Select Lateral Restraint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lateral Restraint">Full Lateral Restraint</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
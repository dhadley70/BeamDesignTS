import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { InputWithUnit } from '@/components/ui/InputWithUnit'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import usageData from '@/data/usage.json'

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

export const GeneralInputsCard: React.FC<{
  generalInputs: GeneralInputs
  setGeneralInputs: React.Dispatch<React.SetStateAction<GeneralInputs>>
}> = ({ generalInputs, setGeneralInputs }) => {
  const [spanDraft, setSpanDraft] = useState<string>('')

  // Load from local storage on component mount
  useEffect(() => {
    const savedGeneralInputs = localStorage.getItem('generalInputs')
    if (savedGeneralInputs) {
      try {
        const parsedInputs = JSON.parse(savedGeneralInputs)
        
        // Ensure ws and wl are set from usage data if not present
        const usageDetails = usageData[parsedInputs.usage as UsageOption] || usageData.Normal
        const inputsWithDefaults = {
          ...parsedInputs,
          ws: parsedInputs.ws ?? usageDetails.ws,
          wl: parsedInputs.wl ?? usageDetails.wl
        }
        
        setGeneralInputs(inputsWithDefaults)
        setSpanDraft(String(inputsWithDefaults.span || ''))
      } catch (error) {
        console.error('Error parsing saved general inputs:', error)
      }
    } else {
      // Set default usage if no saved inputs
      const defaultUsage = 'Normal'
      const usageDetails = usageData[defaultUsage]
      setGeneralInputs({
        span: 1,
        members: 1,
        usage: defaultUsage,
        lateralRestraint: 'Lateral Restraint',
        ws: usageDetails.ws,
        wl: usageDetails.wl
      })
    }
  }, [])

  // Save to local storage whenever generalInputs change
  useEffect(() => {
    localStorage.setItem('generalInputs', JSON.stringify(generalInputs))
  }, [generalInputs])

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
                setGeneralInputs(p => ({ ...p, span: clamped }))
              }}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
            />
          </div>

          {/* Members */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text)]">Number of members</label>
            <Select
              value={String(generalInputs.members)}
              onValueChange={(val) => {
                const n = Number(val)
                setGeneralInputs(p => ({ ...p, members: Number.isFinite(n) ? n : p.members }))
              }}
            >
              <SelectTrigger className="w-full bg-[var(--input)] border-[color:var(--border)]">
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
            <label className="block text-sm font-medium text-[var(--text)]">Usage</label>
            <Select
              value={generalInputs.usage}
              onValueChange={(val: UsageOption) => {
                const usageDetails = usageData[val]
                setGeneralInputs(p => ({ 
                  ...p, 
                  usage: val,
                  ws: usageDetails.ws,
                  wl: usageDetails.wl 
                }))
              }}
            >
                <SelectTrigger className="w-full bg-[var(--input)] border-[color:var(--border)]">
                <SelectValue placeholder="Select usage">
                  <div className="flex items-center">
                    <span>{generalInputs.usage}</span>
                    <span className="ml-2 text-[var(--text)] opacity-70 text-xs">
                      (ws: {generalInputs.ws}, wl: {generalInputs.wl})
                    </span>
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
                        <span className="text-xs opacity-70 ml-2">
                          (ws: {details.ws}, wl: {details.wl})
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>          {/* Lateral Restraint */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text)]">
              Lateral Restraint
            </label>
            <Select
              value={generalInputs.lateralRestraint || "Lateral Restraint"}
              onValueChange={(val) =>
                setGeneralInputs(prev => ({ ...prev, lateralRestraint: val }))
              }
            >
              <SelectTrigger className="w-full bg-[var(--input)] border-[color:var(--border)]">
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
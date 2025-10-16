import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { InputWithUnit } from '@/components/ui/InputWithUnit'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import usageData from '@/data/usage.json'
import useLocalStorage from '@/hooks/useLocalStorage'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { COLLAPSE_ALL_CARDS, EXPAND_ALL_CARDS, getShortcutKey } from '@/lib/cardStateManager'

// Define local types
export type UsageOption = keyof typeof usageData
export interface GeneralInputs {
  span: number
  usage: UsageOption
  lateralRestraint: string
  ws: number
  wl: number
}

// Get default values for a new general inputs object
export function getDefaultGeneralInputs(): GeneralInputs {
  const defaultUsage: UsageOption = 'Normal'
  const usageDetails = usageData[defaultUsage]
  return {
    span: 3.0,
    usage: defaultUsage,
    lateralRestraint: 'Lateral Restraint',
    ws: usageDetails.ws,
    wl: usageDetails.wl
  }
}

export const GeneralInputsCard: React.FC<{
  generalInputs: GeneralInputs
  setGeneralInputs: React.Dispatch<React.SetStateAction<GeneralInputs>>
}> = ({ setGeneralInputs }) => {

  // Use local storage to persist general inputs
  const [localGeneralInputs, setLocalGeneralInputs] = useLocalStorage<GeneralInputs>(
    'generalInputs', 
    getDefaultGeneralInputs()
  )
  
  // Validate general inputs on first load to ensure ws and wl match the usage
  React.useEffect(() => {
    // Check if ws and wl match the current usage
    const usageKey = localGeneralInputs.usage;
    const usageDetails = usageData[usageKey];
    
    // If ws or wl don't match the usage values, update them
    if (localGeneralInputs.ws !== usageDetails.ws || 
        localGeneralInputs.wl !== usageDetails.wl) {
      console.log('Fixing ws/wl values to match usage:', usageKey);
      setLocalGeneralInputs(prev => ({
        ...prev,
        ws: usageDetails.ws,
        wl: usageDetails.wl
      }));
    }
  }, []);  // Empty dependency array means this only runs once on mount
  
  // Local state for collapsed status with localStorage persistence
  const [collapsed, setCollapsed] = useLocalStorage('generalCard_collapsed', false);

  // Update parent state when local state changes
  React.useEffect(() => {
    console.log('localGeneralInputs changed:', localGeneralInputs);
    setGeneralInputs(localGeneralInputs)
  }, [localGeneralInputs, setGeneralInputs])

  // Handle global collapse/expand events
  React.useEffect(() => {
    const handleCollapseAll = () => setCollapsed(true);
    const handleExpandAll = () => setCollapsed(false);
    
    window.addEventListener(COLLAPSE_ALL_CARDS, handleCollapseAll);
    window.addEventListener(EXPAND_ALL_CARDS, handleExpandAll);
    
    return () => {
      window.removeEventListener(COLLAPSE_ALL_CARDS, handleCollapseAll);
      window.removeEventListener(EXPAND_ALL_CARDS, handleExpandAll);
    };
  }, [setCollapsed]);
  
  // Track span input as a string for better UX
  const [spanDraft, setSpanDraft] = useState<string>(String(localGeneralInputs.span || ''))

  // Generate a summary for the card when collapsed
  const getSummary = () => {
    return `| ${localGeneralInputs.span}m | ${localGeneralInputs.usage} |`;
  };

  return (
    <Card className="mb-6 lg:col-span-2 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">
          General Inputs
          {collapsed && <span className="text-base ml-2 opacity-80">{getSummary()}</span>}
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
        <div className="grid grid-cols-3 gap-4">
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
                setLocalGeneralInputs(prev => {
                  const newGeneralInputs = { ...prev, span: clamped };
                  
                  // Dispatch a custom event to notify other components about the change
                  const event = new Event('app-storage-change');
                  window.dispatchEvent(event);
                  
                  return newGeneralInputs;
                })
              }}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-[var(--input)] text-[var(--input-text)] border-[color:var(--border)] appearance-none"
            />
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
                setLocalGeneralInputs(p => {
                  const newGeneralInputs = { 
                    ...p, 
                    usage: val,
                    ws: usageDetails.ws,
                    wl: usageDetails.wl 
                  };
                  
                  // Dispatch a custom event to notify other components about the change
                  const event = new Event('app-storage-change');
                  window.dispatchEvent(event);
                  
                  return newGeneralInputs;
                })
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
                  // Get usage details (not directly used here but helpful for debugging)
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
                setLocalGeneralInputs(prev => {
                  const newGeneralInputs = { ...prev, lateralRestraint: val };
                  
                  // Dispatch a custom event to notify other components about the change
                  const event = new Event('app-storage-change');
                  window.dispatchEvent(event);
                  
                  return newGeneralInputs;
                })
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
      </CardContent>}
    </Card>
  )
}
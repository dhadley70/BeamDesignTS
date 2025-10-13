import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { InputWithUnit } from '@/components/ui/InputWithUnit'
import { Button } from '@/components/ui/button'
import presets from '@/data/deflection_presets.json'

// Define deflection limits types and constants
export interface DeflectionLimits {
  initial: {
    spanRatio: number  // Integer representing span division (e.g., 240 means span/240)
    maxLimit: number
    maxDeflection?: number  // Calculated maximum deflection in mm as an integer
  }
  short: {
    spanRatio: number  // Integer representing span division (e.g., 180 means span/180)
    maxLimit: number
    maxDeflection?: number  // Calculated maximum deflection in mm as an integer
  }
  long: {
    spanRatio: number  // Integer representing span division (e.g., 120 means span/120)
    maxLimit: number
    maxDeflection?: number  // Calculated maximum deflection in mm as an integer
  }
}

export const DeflectionLimitsCard: React.FC<{
  deflectionLimits: DeflectionLimits
  setDeflectionLimits: React.Dispatch<React.SetStateAction<DeflectionLimits>>
  span: number  // Pass span from parent to help with default calculations
}> = ({ deflectionLimits, setDeflectionLimits, span }) => {
  // Check if current limits exactly match a preset
  const matchPreset = (preset: typeof presets[number]) => {
    const checkSection = (
      current: { spanRatio: number, maxLimit: number, maxDeflection?: number }, 
      presetSection: { ratio: number, max: number }
    ) => {
      // Compare span ratio and max limit, converting max limit to meters
      return current.spanRatio === presetSection.ratio && 
             Math.abs(current.maxLimit - presetSection.max / 1000) < 0.001
    }

    return (
      checkSection(deflectionLimits.initial, preset.inst) &&
      checkSection(deflectionLimits.short, preset.short) &&
      checkSection(deflectionLimits.long, preset.long)
    )
  }

  // Update a specific part of the deflection limits
  const updateDeflectionLimit = (
    type: 'initial' | 'short' | 'long', 
    field: 'spanRatio' | 'maxLimit', 
    value: number
  ) => {
    setDeflectionLimits(prev => {
      // Determine the new values, allowing zero
      const newValues = {
        ...prev[type],
        [field]: value
      }
      
      // Recalculate max deflection with updated values
      // Use 0 as a special case to prevent division by zero
      const maxDeflection = value === 0 ? 0 : calculateMaxDeflection(
        span, 
        field === 'spanRatio' ? value : (newValues.spanRatio || prev[type].spanRatio), 
        field === 'maxLimit' ? value : (newValues.maxLimit || prev[type].maxLimit)
      )
      
      return {
        ...prev,
        [type]: {
          ...newValues,
          maxDeflection
        }
      }
    })
  }

  // Calculate maximum deflection based on span and limits
  const calculateMaxDeflection = (beamSpan: number, spanRatio: number, maxLimit: number) => {
    // Convert span to mm
    const spanMm = beamSpan * 1000
    
    // Handle zero spanRatio as a special case
    if (spanRatio === 0) {
      // If spanRatio is zero, return the max limit (converted to mm if needed)
      return Math.round(maxLimit < 1 ? maxLimit * 1000 : maxLimit)
    }
    
    // Calculate deflection by span ratio
    const ratioDeflection = spanMm / spanRatio
    
    // Convert maxLimit to mm if it's in meters
    const maxLimitMm = maxLimit < 1 ? maxLimit * 1000 : maxLimit
    
    // Return the lesser of ratio-based deflection or max limit as an integer
    return Math.round(Math.min(ratioDeflection, maxLimitMm))
  }

  // Calculate default span ratios if not set
  const getDefaultSpanRatio = (type: 'initial' | 'short' | 'long') => {
    switch(type) {
      case 'initial': return 0  // More restrictive for initial deflection
      case 'short': return 0    // Standard short-term deflection limit
      case 'long': return 0     // More allowance for long-term deflection
    }
  }

  return (
    <Card className="mb-6 lg:col-span-2 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
      <CardHeader>
        <CardTitle className="text-xl">Deflection Limits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Initial Deflection */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
              Initial 
              <span className="block text-xs font-medium text-[var(--text)] opacity-70">
                (Max: {calculateMaxDeflection(span, deflectionLimits.initial.spanRatio, deflectionLimits.initial.maxLimit)} mm)
              </span>
            </h3>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Span Ratio</label>
              <InputWithUnit
                id="initialSpanRatio"
                unit="L/x"
                type="number"
                inputMode="decimal"
                step={10}
                placeholder="Initial Span Ratio"
                value={(deflectionLimits.initial.spanRatio || getDefaultSpanRatio('initial')).toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.currentTarget.value.trim()
                  if (value === '') {
                    updateDeflectionLimit('initial', 'spanRatio', 0)
                  } else {
                    const parsedValue = parseInt(value, 10)
                    if (!isNaN(parsedValue)) {
                      updateDeflectionLimit('initial', 'spanRatio', parsedValue)
                    }
                  }
                }}
                min="0"
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Maximum Limit</label>
                <InputWithUnit
                id="initialMaxLimit"
                unit="mm"
                type="number"
                inputMode="decimal"
                step={1}
                placeholder="Initial Max Limit"
                value={(deflectionLimits.initial.maxLimit * 1000).toFixed(0)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.currentTarget.value.trim()
                  if (value === '') {
                    updateDeflectionLimit('initial', 'maxLimit', 0)
                  } else {
                    const numericValue = Number(value)
                    updateDeflectionLimit('initial', 'maxLimit', numericValue / 1000)
                  }
                }}
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
          </div>

          {/* Short-Term Deflection */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
              Short 
              <span className="block text-xs font-medium text-[var(--text)] opacity-70">
                (Max: {calculateMaxDeflection(span, deflectionLimits.short.spanRatio, deflectionLimits.short.maxLimit)} mm)
              </span>
            </h3>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Span Ratio</label>
              <InputWithUnit
                id="shortSpanRatio"
                unit="L/x"
                type="number"
                inputMode="decimal"
                step={10}
                placeholder="Short Span Ratio"
                value={(deflectionLimits.short.spanRatio || getDefaultSpanRatio('short')).toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.currentTarget.value.trim()
                  if (value === '') {
                    updateDeflectionLimit('short', 'spanRatio', 0)
                  } else {
                    const parsedValue = parseInt(value, 10)
                    if (!isNaN(parsedValue)) {
                      updateDeflectionLimit('short', 'spanRatio', parsedValue)
                    }
                  }
                }}
                min="0"
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Maximum Limit</label>
                <InputWithUnit
                id="shortMaxLimit"
                unit="mm"
                type="number"
                inputMode="decimal"
                step={1}
                placeholder="Short Max Limit"
                value={(deflectionLimits.short.maxLimit * 1000).toFixed(0)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.currentTarget.value.trim()
                  if (value === '') {
                    updateDeflectionLimit('short', 'maxLimit', 0)
                  } else {
                    const numericValue = Number(value)
                    updateDeflectionLimit('short', 'maxLimit', numericValue / 1000)
                  }
                }}
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
          </div>

          {/* Long-Term Deflection */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
              Long 
              <span className="block text-xs font-medium text-[var(--text)] opacity-70">
                (Max: {calculateMaxDeflection(span, deflectionLimits.long.spanRatio, deflectionLimits.long.maxLimit)} mm)
              </span>
            </h3>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Span Ratio</label>
              <InputWithUnit
                id="longSpanRatio"
                unit="L/x"
                type="number"
                inputMode="decimal"
                step={10}
                placeholder="Long Span Ratio"
                value={(deflectionLimits.long.spanRatio || getDefaultSpanRatio('long')).toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.currentTarget.value.trim()
                  if (value === '') {
                    updateDeflectionLimit('long', 'spanRatio', 0)
                  } else {
                    const parsedValue = parseInt(value, 10)
                    if (!isNaN(parsedValue)) {
                      updateDeflectionLimit('long', 'spanRatio', parsedValue)
                    }
                  }
                }}
                min="0"
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Maximum Limit</label>
                <InputWithUnit
                id="longMaxLimit"
                unit="mm"
                type="number"
                inputMode="decimal"
                step={1}
                placeholder="Long Max Limit"
                value={(deflectionLimits.long.maxLimit * 1000).toFixed(0)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.currentTarget.value.trim()
                  if (value === '') {
                    updateDeflectionLimit('long', 'maxLimit', 0)
                  } else {
                    const numericValue = Number(value)
                    updateDeflectionLimit('long', 'maxLimit', numericValue / 1000)
                  }
                }}
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
          </div>
        </div>
            {/* Preset Buttons */}
            <div className="mt-4 grid grid-cols-3 gap-4 appearance-none">
              {presets.map((preset) => (
                <Button 
                  key={preset.id}
                  variant={matchPreset(preset) ? "outline" : "outline"}
                  size="sm"
                  className={`${matchPreset(preset) ? "border-accent" : ""} border-[color:var(--border)] bg-[var(--card)]`}
                  onClick={() => {
                    setDeflectionLimits({
                      initial: {
                        spanRatio: preset.inst.ratio,
                        maxLimit: preset.inst.max / 1000,
                        maxDeflection: calculateMaxDeflection(span, preset.inst.ratio, preset.inst.max / 1000)
                      },
                      short: {
                        spanRatio: preset.short.ratio,
                        maxLimit: preset.short.max / 1000,
                        maxDeflection: calculateMaxDeflection(span, preset.short.ratio, preset.short.max / 1000)
                      },
                      long: {
                        spanRatio: preset.long.ratio,
                        maxLimit: preset.long.max / 1000,
                        maxDeflection: calculateMaxDeflection(span, preset.long.ratio, preset.long.max / 1000)
                      }
                    })
                  }}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </CardContent>
    </Card>
  )
}
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { InputWithUnit } from '@/components/ui/InputWithUnit'

// Define deflection limits types and constants
export interface DeflectionLimits {
  instant: {
    spanRatio: number
    maxLimit: number
  }
  short: {
    spanRatio: number
    maxLimit: number
  }
  long: {
    spanRatio: number
    maxLimit: number
  }
}

export const DeflectionLimitsCard: React.FC<{
  deflectionLimits: DeflectionLimits
  setDeflectionLimits: React.Dispatch<React.SetStateAction<DeflectionLimits>>
  span: number  // Pass span from parent to help with default calculations
}> = ({ deflectionLimits, setDeflectionLimits, span }) => {
  // Update a specific part of the deflection limits
  const updateDeflectionLimit = (
    type: 'instant' | 'short' | 'long', 
    field: 'spanRatio' | 'maxLimit', 
    value: number
  ) => {
    setDeflectionLimits(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }))
  }

  // Calculate default span ratios if not set
  const getDefaultSpanRatio = (type: 'instant' | 'short' | 'long') => {
    switch(type) {
      case 'instant': return span / 240  // More restrictive for instant deflection
      case 'short': return span / 180    // Standard short-term deflection limit
      case 'long': return span / 120     // More allowance for long-term deflection
    }
  }

  return (
    <Card className="mb-6 lg:col-span-2 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
      <CardHeader>
        <CardTitle className="text-xl">Deflection Limits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Instant Deflection */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--text)] text-center">Instant</h3>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Span Ratio (L/x)</label>
              <InputWithUnit
                id="instantSpanRatio"
                unit="L/x"
                type="number"
                inputMode="decimal"
                step={0.1}
                placeholder="Instant Span Ratio"
                value={(deflectionLimits.instant.spanRatio || getDefaultSpanRatio('instant')).toFixed(2)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.currentTarget.value)
                  updateDeflectionLimit('instant', 'spanRatio', value)
                }}
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Maximum Limit</label>
              <InputWithUnit
                id="instantMaxLimit"
                unit="m"
                type="number"
                inputMode="decimal"
                step={0.001}
                placeholder="Instant Max Limit"
                value={deflectionLimits.instant.maxLimit.toFixed(3)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.currentTarget.value)
                  updateDeflectionLimit('instant', 'maxLimit', value)
                }}
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
          </div>

          {/* Short-Term Deflection */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--text)] text-center">Short</h3>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Span Ratio (L/x)</label>
              <InputWithUnit
                id="shortSpanRatio"
                unit="L/x"
                type="number"
                inputMode="decimal"
                step={0.1}
                placeholder="Short Span Ratio"
                value={(deflectionLimits.short.spanRatio || getDefaultSpanRatio('short')).toFixed(2)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.currentTarget.value)
                  updateDeflectionLimit('short', 'spanRatio', value)
                }}
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Maximum Limit</label>
              <InputWithUnit
                id="shortMaxLimit"
                unit="m"
                type="number"
                inputMode="decimal"
                step={0.001}
                placeholder="Short Max Limit"
                value={deflectionLimits.short.maxLimit.toFixed(3)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.currentTarget.value)
                  updateDeflectionLimit('short', 'maxLimit', value)
                }}
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
          </div>

          {/* Long-Term Deflection */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--text)] text-center">Long</h3>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Span Ratio (L/x)</label>
              <InputWithUnit
                id="longSpanRatio"
                unit="L/x"
                type="number"
                inputMode="decimal"
                step={0.1}
                placeholder="Long Span Ratio"
                value={(deflectionLimits.long.spanRatio || getDefaultSpanRatio('long')).toFixed(2)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.currentTarget.value)
                  updateDeflectionLimit('long', 'spanRatio', value)
                }}
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Maximum Limit</label>
              <InputWithUnit
                id="longMaxLimit"
                unit="m"
                type="number"
                inputMode="decimal"
                step={0.001}
                placeholder="Long Max Limit"
                value={deflectionLimits.long.maxLimit.toFixed(3)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.currentTarget.value)
                  updateDeflectionLimit('long', 'maxLimit', value)
                }}
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

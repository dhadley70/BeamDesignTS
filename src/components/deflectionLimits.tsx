import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { InputWithUnit } from '@/components/ui/InputWithUnit'

// Define deflection limits types and constants
export interface DeflectionLimits {
  initial: {
    spanRatio: number  // Integer representing span division (e.g., 240 means span/240)
    maxLimit: number
  }
  short: {
    spanRatio: number  // Integer representing span division (e.g., 180 means span/180)
    maxLimit: number
  }
  long: {
    spanRatio: number  // Integer representing span division (e.g., 120 means span/120)
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
    type: 'initial' | 'short' | 'long', 
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
  const getDefaultSpanRatio = (type: 'initial' | 'short' | 'long') => {
    switch(type) {
      case 'initial': return 240  // More restrictive for initial deflection
      case 'short': return 180    // Standard short-term deflection limit
      case 'long': return 120     // More allowance for long-term deflection
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
            <h3 className="text-sm font-medium text-[var(--text)]">Initial</h3>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Span Ratio (L/x)</label>
              <InputWithUnit
                id="initialSpanRatio"
                unit="L/x"
                type="number"
                inputMode="decimal"
                step={0.1}
                placeholder="Initial Span Ratio"
                value={(deflectionLimits.initial.spanRatio || getDefaultSpanRatio('initial')).toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = parseInt(e.currentTarget.value, 10)
                  if (!isNaN(value)) {
                    updateDeflectionLimit('initial', 'spanRatio', value)
                  }
                }}
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
                  const value = Number(e.currentTarget.value) / 1000
                  updateDeflectionLimit('initial', 'maxLimit', value)
                }}
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
          </div>

          {/* Short-Term Deflection */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--text)]">Short</h3>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Span Ratio (L/x)</label>
              <InputWithUnit
                id="shortSpanRatio"
                unit="L/x"
                type="number"
                inputMode="decimal"
                step={0.1}
                placeholder="Short Span Ratio"
                value={(deflectionLimits.short.spanRatio || getDefaultSpanRatio('short')).toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = parseInt(e.currentTarget.value, 10)
                  if (!isNaN(value)) {
                    updateDeflectionLimit('short', 'spanRatio', value)
                  }
                }}
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
                  const value = Number(e.currentTarget.value) / 1000
                  updateDeflectionLimit('short', 'maxLimit', value)
                }}
                className="w-full bg-[var(--input)] border-[color:var(--border)] appearance-none"
              />
            </div>
          </div>

          {/* Long-Term Deflection */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--text)]">Long</h3>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text)] opacity-70">Span Ratio (L/x)</label>
              <InputWithUnit
                id="longSpanRatio"
                unit="L/x"
                type="number"
                inputMode="decimal"
                step={0.1}
                placeholder="Long Span Ratio"
                value={(deflectionLimits.long.spanRatio || getDefaultSpanRatio('long')).toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = parseInt(e.currentTarget.value, 10)
                  if (!isNaN(value)) {
                    updateDeflectionLimit('long', 'spanRatio', value)
                  }
                }}
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
                  const value = Number(e.currentTarget.value) / 1000
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

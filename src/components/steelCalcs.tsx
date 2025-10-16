import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { ChevronDown, ChevronUp } from "lucide-react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import useLocalStorage from "@/hooks/useLocalStorage"
import { usePhiMCalculation } from "@/hooks/usePhiMCalculation"
import { GeneralInputs } from "@/components/generalInputs"

// AS4100 member restraint reduction factors (Table 5.6.3)
const ALPHA_M_FACTORS = {
  "Member with no intermediate lateral restraint": 1.0,
  "Member with lateral restraint at third points (approx.)": 1.75,
  "Member with continuous lateral restraint": 2.5
}

export type RestraintType = keyof typeof ALPHA_M_FACTORS

// Load Combination and Factor Type
type LoadCombination = 'DL+LL' | 'DL Only' | 'LL Only'
type CapacityFactorType = 'Strength' | 'Serviceability'

// Component for Steel Calculations
export const SteelCalcsCard = () => {
  // General inputs state (retrieved from local storage)
  const generalInputs = JSON.parse(localStorage.getItem('generalInputs') || '{"span": 3.0}') as GeneralInputs;
  
  // Section inputs state (retrieved from local storage)
  const sectionInputs = JSON.parse(localStorage.getItem('sectionInputs') || '{}');
  
  // Steel section properties
  const [effectiveLength, setEffectiveLength] = useState<number>(generalInputs?.span || 3.0);
  const [restraint, setRestraint] = useState<RestraintType>("Member with no intermediate lateral restraint");
  
  // Calculate steel capacities
  const { calculation, warning, error } = usePhiMCalculation(generalInputs, sectionInputs, effectiveLength, ALPHA_M_FACTORS[restraint]);
  
  // Collapsible state for results section
  const [resultsCollapsed, setResultsCollapsed] = useState(false);

  // Update effective length when span changes
  useEffect(() => {
    if (generalInputs?.span) {
      setEffectiveLength(generalInputs.span);
    }
  }, [generalInputs?.span]);

  return (
    <div className="space-y-6">
      <Card className="bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
        <CardHeader>
          <CardTitle className="text-xl">Steel Beam Capacity Calculations</CardTitle>
          <CardDescription className="text-[var(--text-muted)]">
            Based on AS 4100:2020 Steel Structures
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Inputs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Section Properties */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--text)]">Section Properties</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-muted)]">Effective Length (Lb)</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={effectiveLength}
                        onChange={(e) => setEffectiveLength(parseFloat(e.target.value))}
                        placeholder="Effective Length"
                        className="w-full p-2 border rounded bg-[var(--input)] border-[var(--border)] text-[var(--text)]"
                      />
                      <span className="ml-2 text-[var(--text)]">m</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-muted)]">Restraint Condition</label>
                    <select
                      value={restraint}
                      onChange={(e) => setRestraint(e.target.value as RestraintType)}
                      className="w-full p-2 border rounded bg-[var(--input)] border-[var(--border)] text-[var(--text)]"
                    >
                      {Object.keys(ALPHA_M_FACTORS).map((key) => (
                        <option key={key} value={key} className="bg-[var(--card)]">{key}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Section Information */}
                <div className="bg-[var(--input)] rounded-md p-3 border border-[var(--border)]">
                  <h4 className="text-md font-medium mb-2 text-[var(--text)]">Selected Section Properties</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-normal text-[var(--text-muted)]">Type:</span>
                      <span className="text-sm font-medium text-[var(--text)]">
                        {sectionInputs?.type || "Not Selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-normal text-[var(--text-muted)]">Section:</span>
                      <span className="text-sm font-medium text-[var(--text)]">
                        {sectionInputs?.section || "Not Selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-normal text-[var(--text-muted)]">Steel Grade:</span>
                      <span className="text-sm font-medium text-[var(--text)]">
                        {sectionInputs?.grade || "Not Selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-normal text-[var(--text-muted)]">Yield Strength:</span>
                      <span className="text-sm font-medium text-[var(--text)]">
                        {sectionInputs?.fy ? `${sectionInputs.fy} MPa` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-normal text-[var(--text-muted)]">Section Modulus:</span>
                      <span className="text-sm font-medium text-[var(--text)]">
                        {sectionInputs?.Zx ? `${sectionInputs.Zx.toFixed(0)} cm³` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-normal text-[var(--text-muted)]">Plastic Modulus:</span>
                      <span className="text-sm font-medium text-[var(--text)]">
                        {sectionInputs?.Sx ? `${sectionInputs.Sx.toFixed(0)} cm³` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Load Effects */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--text)]">Load Effects</h3>
                <div className="bg-[var(--input)] rounded-md p-3 border border-[var(--border)]">
                  <h4 className="text-md font-medium mb-2 text-[var(--text)]">Factored Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-normal text-[var(--text-muted)]">Design Moment:</span>
                      <span className="text-sm font-medium text-[var(--text)]">
                        {generalInputs?.maxMoment ? `${generalInputs.maxMoment.toFixed(1)} kNm` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-normal text-[var(--text-muted)]">Design Shear:</span>
                      <span className="text-sm font-medium text-[var(--text)]">
                        {generalInputs?.maxShear ? `${generalInputs.maxShear.toFixed(1)} kN` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Capacity Utilization */}
                <div className="mt-4">
                  <h4 className="text-md font-medium mb-2 text-[var(--text)]">Utilization Factors</h4>
                  
                  {!generalInputs?.maxMoment || !sectionInputs?.section || error ? (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTitle className="text-[var(--text)]">Missing Information</AlertTitle>
                      <AlertDescription className="text-[var(--text-muted)]">
                        {!generalInputs?.maxMoment
                          ? "Please perform load analysis to get design moments"
                          : !sectionInputs?.section
                          ? "Please select a steel section"
                          : error || "Cannot calculate capacity"}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {/* Moment Utilization */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-[var(--text)]">Moment Capacity</span>
                          <span className="text-sm font-medium text-[var(--text)]">
                            {(generalInputs.maxMoment / calculation.phiMb * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-[var(--border)] rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              generalInputs.maxMoment / calculation.phiMb > 1.0
                                ? "bg-red-500"
                                : generalInputs.maxMoment / calculation.phiMb > 0.9
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ 
                              width: `${Math.min(
                                (generalInputs.maxMoment / calculation.phiMb * 100), 
                                100
                              )}%` 
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Shear Utilization */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-[var(--text)]">Shear Capacity</span>
                          <span className="text-sm font-medium text-[var(--text)]">
                            {generalInputs.maxShear ? 
                              (generalInputs.maxShear / calculation.phiVv * 100).toFixed(0) + '%' : 'N/A'}
                          </span>
                        </div>
                        <div className="w-full bg-[var(--border)] rounded-full h-1.5">
                          {generalInputs.maxShear && (
                            <div 
                              className={`h-1.5 rounded-full ${
                                generalInputs.maxShear / calculation.phiVv > 1.0
                                  ? "bg-red-500"
                                  : generalInputs.maxShear / calculation.phiVv > 0.9
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ 
                                width: `${Math.min(
                                  (generalInputs.maxShear / calculation.phiVv * 100), 
                                  100
                                )}%` 
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main card divider */}
          <Separator className="my-4 bg-[var(--border)]" />
            
          {/* Results Section */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold mb-2 text-[var(--text)]">Results</h3>
              <Button 
                variant="ghost" 
                className="p-1 h-auto" 
                onClick={() => setResultsCollapsed(!resultsCollapsed)}
                aria-label={resultsCollapsed ? "Expand results" : "Collapse results"}
              >
                {resultsCollapsed ? 
                  <ChevronDown className="h-5 w-5 text-[var(--text)]" /> : 
                  <ChevronUp className="h-5 w-5 text-[var(--text)]" />}
              </Button>
            </div>
            
            {/* Results Table */}
            {!resultsCollapsed && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left text-[var(--text-muted)]">Property</TableHead>
                      <TableHead className="text-right text-[var(--text-muted)]">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-[var(--text)]">Span (L)</TableCell>
                      <TableCell className="text-right text-[var(--text)]">{generalInputs?.span} m</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-[var(--text)]">Effective Length (Lb)</TableCell>
                      <TableCell className="text-right text-[var(--text)]">{effectiveLength} m</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-[var(--text)]">Moment Modification Factor (αm)</TableCell>
                      <TableCell className="text-right text-[var(--text)]">{ALPHA_M_FACTORS[restraint]}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-[var(--text)]">Section Moment Capacity (Ms)</TableCell>
                      <TableCell className="text-right text-[var(--text)]">{calculation.Ms.toFixed(1)} kNm</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-[var(--text)]">Member Moment Capacity (Mb)</TableCell>
                      <TableCell className="text-right text-[var(--text)]">{calculation.Mb.toFixed(1)} kNm</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-[var(--text)]">Design Moment Capacity (φMb)</TableCell>
                      <TableCell className="text-right text-[var(--text)]">{calculation.phiMb.toFixed(1)} kNm</TableCell>
                    </TableRow>
                    
                    {/* Shear Capacity */}
                    <TableRow>
                      <TableCell className="font-medium text-[var(--text)] border-t border-[var(--border)]">
                        Shear Capacity (Vv)
                      </TableCell>
                      <TableCell className="text-right text-[var(--text)] border-t border-[var(--border)]">
                        {calculation.Vv.toFixed(1)} kN
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-[var(--text)]">Design Shear Capacity (φVv)</TableCell>
                      <TableCell className="text-right text-[var(--text)]">{calculation.phiVv.toFixed(1)} kN</TableCell>
                    </TableRow>
                    
                    {/* Capacity Factors */}
                    <TableRow>
                      <TableCell className="font-medium text-[var(--text)] border-t border-[var(--border)]">
                        Capacity Reduction Factor (φ)
                      </TableCell>
                      <TableCell className="text-right text-[var(--text)] border-t border-[var(--border)]">
                        {calculation.phi.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    
                    {/* Load Effects */}
                    {generalInputs?.maxMoment && (
                      <>
                        <TableRow>
                          <TableCell className="font-medium text-[var(--text)] border-t border-[var(--border)]">
                            Design Moment (M*)
                          </TableCell>
                          <TableCell className="text-right text-[var(--text)] border-t border-[var(--border)]">
                            {generalInputs.maxMoment.toFixed(1)} kNm
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-[var(--text)]">Design Shear (V*)</TableCell>
                          <TableCell className="text-right text-[var(--text)]">
                            {generalInputs.maxShear?.toFixed(1) || "N/A"} kN
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-[var(--text)]">Moment Utilization (M*/φMb)</TableCell>
                          <TableCell className="text-right text-[var(--text)]">
                            {(generalInputs.maxMoment / calculation.phiMb).toFixed(2)} 
                            <Badge className={`ml-2 ${
                              generalInputs.maxMoment / calculation.phiMb > 1.0
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}>
                              {generalInputs.maxMoment / calculation.phiMb > 1.0 ? "FAIL" : "PASS"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        {generalInputs.maxShear && (
                          <TableRow>
                            <TableCell className="font-medium text-[var(--text)]">Shear Utilization (V*/φVv)</TableCell>
                            <TableCell className="text-right text-[var(--text)]">
                              {(generalInputs.maxShear / calculation.phiVv).toFixed(2)}
                              <Badge className={`ml-2 ${
                                generalInputs.maxShear / calculation.phiVv > 1.0
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}>
                                {generalInputs.maxShear / calculation.phiVv > 1.0 ? "FAIL" : "PASS"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PropertyCell } from '@/components/ui/property-cell'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import useLocalStorage from '@/hooks/useLocalStorage'
import useBeamAnalysis from './beamAnalysis'
import type { MemberProperties } from './beamAnalysis'
import type { UDLLoad, PointLoad, Moment } from '@/components/loadsInput'

export const DesignAnalysisCard: React.FC = () => {
  // Load data from local storage
  const [generalInputs] = useLocalStorage<any>('generalInputs', {})
  const [udlLoads] = useLocalStorage<UDLLoad[]>('beamLoads', [])
  const [pointLoads] = useLocalStorage<PointLoad[]>('beamPointLoads', [])
  const [moments] = useLocalStorage<Moment[]>('beamMoments', [])
  const [selectedSection] = useLocalStorage<any>('selectedSection', null)

  // Extract parameters from general inputs
  const span = generalInputs?.span || 3.0
  const members = generalInputs?.members || 1
  const ws = generalInputs?.ws || 0.4
  const wl = generalInputs?.wl || 0.3
  
  // Create member properties from selected section
  const [memberProperties, setMemberProperties] = useState<MemberProperties | null>(null)

  // Convert selected section to member properties for analysis
  useEffect(() => {
    if (selectedSection) {
      console.log('Selected section data:', selectedSection);
      const props: MemberProperties = {
        section: selectedSection.designation,
        material: selectedSection.material || 'Steel',
        depth: selectedSection.depth_mm || selectedSection.depth || 0,
        width: selectedSection.flange_mm || selectedSection.width_mm || selectedSection.width || 0,
        momentOfInertia: selectedSection.I_m4 ? (selectedSection.I_m4 * 1e12) : (selectedSection.momentOfInertia || 0),
        elasticModulus: selectedSection.E || 200000, // Default to 200 GPa for steel if not specified
        J2: selectedSection.J2 || 2.0, // Default creep factor if not specified
      }
      console.log('Created member properties:', props);
      setMemberProperties(props)
    } else {
      // Try to fetch directly from localStorage in case the hook value is not updated
      try {
        const rawData = localStorage.getItem('selectedSection');
        if (rawData) {
          const sectionData = JSON.parse(rawData);
          console.log('Fetched section data from localStorage:', sectionData);
          const props: MemberProperties = {
            section: sectionData.designation,
            material: sectionData.material || 'Steel',
            depth: sectionData.depth_mm || sectionData.depth || 0,
            width: sectionData.flange_mm || sectionData.width_mm || sectionData.width || 0,
            momentOfInertia: sectionData.I_m4 ? (sectionData.I_m4 * 1e12) : (sectionData.momentOfInertia || 0),
            elasticModulus: sectionData.E || 200000, 
            J2: sectionData.J2 || 2.0,
          }
          console.log('Created member properties from localStorage:', props);
          setMemberProperties(props);
          return;
        }
      } catch (error) {
        console.error('Error reading selectedSection from localStorage:', error);
      }
      setMemberProperties(null)
    }
  }, [selectedSection])

  // Perform beam analysis
  const analysisResults = useBeamAnalysis({
    span,
    members,
    ws,
    wl,
    J2: memberProperties?.J2 || 2.0,
    udlLoads,
    pointLoads,
    moments,
    memberProperties
  })

  // Format number with units
  const formatNumber = (value: number | undefined, unit: string, decimals: number = 2) => {
    if (value === undefined || value === null) return '-'
    return `${value.toFixed(decimals)} ${unit}`
  }

  return (
    <Card className="mt-6 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
      <CardHeader>
        <CardTitle className="text-xl">Design</CardTitle>
      </CardHeader>
      <CardContent>
        {!memberProperties ? (
          <div className="text-center text-muted italic">
            Please select a section to perform analysis
          </div>
        ) : !analysisResults ? (
          <div className="text-center text-muted italic">
            Analyzing beam...
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Parameter</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Limit</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Initial Deflection</TableCell>
                  <TableCell>{formatNumber(analysisResults.maxInitialDeflection, 'mm')}</TableCell>
                  <TableCell className="text-right">{formatNumber(span * 1000 / 240, 'mm')}</TableCell>
                  <TableCell className="text-right">
                    {analysisResults.maxInitialDeflection <= span * 1000 / 240 ? (
                      <span className="text-green-500">✓ Pass</span>
                    ) : (
                      <span className="text-red-500">✗ Fail</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Short-term Deflection</TableCell>
                  <TableCell>{formatNumber(analysisResults.maxShortDeflection, 'mm')}</TableCell>
                  <TableCell className="text-right">{formatNumber(span * 1000 / 180, 'mm')}</TableCell>
                  <TableCell className="text-right">
                    {analysisResults.maxShortDeflection <= span * 1000 / 180 ? (
                      <span className="text-green-500">✓ Pass</span>
                    ) : (
                      <span className="text-red-500">✗ Fail</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Long-term Deflection</TableCell>
                  <TableCell>{formatNumber(analysisResults.maxLongDeflection, 'mm')}</TableCell>
                  <TableCell className="text-right">{formatNumber(span * 1000 / 120, 'mm')}</TableCell>
                  <TableCell className="text-right">
                    {analysisResults.maxLongDeflection <= span * 1000 / 120 ? (
                      <span className="text-green-500">✓ Pass</span>
                    ) : (
                      <span className="text-red-500">✗ Fail</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Max Bending Moment M*</TableCell>
                  <TableCell>{formatNumber(analysisResults.maxMoment, 'kNm')}</TableCell>
                  <TableCell className="text-right">{formatNumber(selectedSection?.phiM, 'kNm')}</TableCell>
                  <TableCell className="text-right">
                    {selectedSection?.phiM && analysisResults.maxMoment <= selectedSection?.phiM ? (
                      <span className="text-green-500">✓ Pass</span>
                    ) : (
                      <span className="text-red-500">✗ Fail</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Max Shear V*</TableCell>
                  <TableCell>{formatNumber(analysisResults.maxShear, 'kN')}</TableCell>
                  <TableCell className="text-right">{formatNumber(selectedSection?.phiV, 'kN')}</TableCell>
                  <TableCell className="text-right">
                    {selectedSection?.phiV && analysisResults.maxShear <= selectedSection?.phiV ? (
                      <span className="text-green-500">✓ Pass</span>
                    ) : (
                      <span className="text-red-500">✗ Fail</span>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <PropertyCell 
                label="Controlling Moment Case" 
                value={analysisResults.controllingMomentCase}
              />
              <PropertyCell 
                label="Controlling Shear Case" 
                value={analysisResults.controllingShearCase}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DesignAnalysisCard
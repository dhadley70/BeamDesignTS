import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PropertyCell } from '@/components/ui/property-cell'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import useLocalStorage from '@/hooks/useLocalStorage'
import useBeamAnalysis from './beamAnalysis'
import type { MemberProperties } from './beamAnalysis'
import type { UDLLoad, PointLoad, Moment } from '@/components/loadsInput'

export const DesignAnalysisCard: React.FC = () => {
  // Load data from local storage with direct access to ensure it's always up to date
  const [generalInputsState] = useLocalStorage<any>('generalInputs', {})
  const [udlLoadsState] = useLocalStorage<UDLLoad[]>('beamLoads', [])
  const [pointLoadsState] = useLocalStorage<PointLoad[]>('beamPointLoads', [])
  const [momentsState] = useLocalStorage<Moment[]>('beamMoments', [])
  const [selectedSectionState] = useLocalStorage<any>('selectedSection', null)
  
  // State to track changes to inputs
  const [inputs, setInputs] = useState({
    generalInputs: generalInputsState,
    udlLoads: udlLoadsState,
    pointLoads: pointLoadsState,
    moments: momentsState,
    selectedSection: selectedSectionState
  });
  
  // Force refresh state from localStorage on render and when data changes
  useEffect(() => {
    // Function to get fresh data from localStorage
    const getUpdatedData = () => {
      try {
        const rawGeneralInputs = localStorage.getItem('generalInputs');
        const rawUdlLoads = localStorage.getItem('beamLoads');
        const rawPointLoads = localStorage.getItem('beamPointLoads');
        const rawMoments = localStorage.getItem('beamMoments');
        const rawSelectedSection = localStorage.getItem('selectedSection');
        
        const parsedGeneralInputs = rawGeneralInputs ? JSON.parse(rawGeneralInputs) : {};
        const parsedUdlLoads = rawUdlLoads ? JSON.parse(rawUdlLoads) : [];
        const parsedPointLoads = rawPointLoads ? JSON.parse(rawPointLoads) : [];
        const parsedMoments = rawMoments ? JSON.parse(rawMoments) : [];
        const parsedSelectedSection = rawSelectedSection ? JSON.parse(rawSelectedSection) : null;
        
        setInputs({
          generalInputs: parsedGeneralInputs,
          udlLoads: parsedUdlLoads,
          pointLoads: parsedPointLoads,
          moments: parsedMoments,
          selectedSection: parsedSelectedSection
        });
      } catch (error) {
        console.error('Error reading data from localStorage:', error);
      }
    };
    
    // Initial load
    getUpdatedData();
    
    // Set up event listener for storage changes
    const handleStorageChange = () => {
      console.log('Storage changed, updating analysis inputs');
      getUpdatedData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for our app's local changes
    const handleAppStorageChange = () => {
      console.log('App storage changed, updating analysis inputs');
      getUpdatedData();
    };
    
    window.addEventListener('app-storage-change', handleAppStorageChange);
    
    // Also check for changes every second for changes not caught by events
    const interval = setInterval(getUpdatedData, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('app-storage-change', handleAppStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  // Extract parameters from general inputs
  const span = inputs.generalInputs?.span || 3.0
  const members = inputs.generalInputs?.members || 1
  const ws = inputs.generalInputs?.ws || 0.4
  const wl = inputs.generalInputs?.wl || 0.3
  
  // Get the updated loads for analysis
  const udlLoads = inputs.udlLoads || []
  const pointLoads = inputs.pointLoads || []
  const moments = inputs.moments || []
  
  // Create member properties from selected section
  const [memberProperties, setMemberProperties] = useState<MemberProperties | null>(null)

  // Convert selected section to member properties for analysis
  useEffect(() => {
    const sectionData = inputs.selectedSection;
    if (sectionData) {
      console.log('Selected section data:', sectionData);
      const props: MemberProperties = {
        section: sectionData.designation,
        material: sectionData.material || 'Steel',
        depth: sectionData.depth_mm || sectionData.depth || 0,
        width: sectionData.flange_mm || sectionData.width_mm || sectionData.width || 0,
        momentOfInertia: sectionData.I_m4 ? (sectionData.I_m4 * 1e12) : (sectionData.momentOfInertia || 0),
        elasticModulus: sectionData.E || 200000, // Default to 200 GPa for steel if not specified
        J2: sectionData.J2 || 2.0, // Default creep factor if not specified
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
            momentOfInertia: sectionData.I_m4 ? (sectionData.I_m4 * 1e12) : (sectionData.momentOfInertia || 0), // Convert from m⁴ to mm⁴
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
  }, [inputs.selectedSection])

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
                  <TableCell className="text-right">{formatNumber(inputs.selectedSection?.phiM, 'kNm')}</TableCell>
                  <TableCell className="text-right">
                    {inputs.selectedSection?.phiM && analysisResults.maxMoment <= inputs.selectedSection?.phiM ? (
                      <span className="text-green-500">✓ Pass</span>
                    ) : (
                      <span className="text-red-500">✗ Fail</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Max Shear V*</TableCell>
                  <TableCell>{formatNumber(analysisResults.maxShear, 'kN')}</TableCell>
                  <TableCell className="text-right">{formatNumber(inputs.selectedSection?.phiV, 'kN')}</TableCell>
                  <TableCell className="text-right">
                    {inputs.selectedSection?.phiV && analysisResults.maxShear <= inputs.selectedSection?.phiV ? (
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
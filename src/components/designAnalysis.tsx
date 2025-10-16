import React, { useEffect, useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PropertyCell } from '@/components/ui/property-cell'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import useLocalStorage from '@/hooks/useLocalStorage'
import useBeamAnalysis from './beamAnalysis'
import type { MemberProperties } from './beamAnalysis'
import type { UDLLoad, PointLoad, Moment, FullUDL } from '@/components/loadsInput'

export const DesignAnalysisCard = () => {
  // Load data from local storage with direct access to ensure it's always up to date
  const [generalInputsState] = useLocalStorage<any>('generalInputs', {})
  const [udlLoadsState] = useLocalStorage<UDLLoad[]>('beamLoads', [])
  const [pointLoadsState] = useLocalStorage<PointLoad[]>('beamPointLoads', [])
  const [momentsState] = useLocalStorage<Moment[]>('beamMoments', [])
  const [fullUDLState] = useLocalStorage<FullUDL>('beamFullUDL', {
    tributaryWidth: 0,
    deadGkPa: 0,
    liveQkPa: 0,
    includeSelfWeight: false
  })
  const [selectedSectionState] = useLocalStorage<any>('selectedSection', null)
  
  // State to track changes to inputs
  const [inputs, setInputs] = useState({
    generalInputs: generalInputsState,
    udlLoads: udlLoadsState,
    pointLoads: pointLoadsState,
    moments: momentsState,
    fullUDL: fullUDLState,
    selectedSection: selectedSectionState
  });

  // Create refs at component top level
  const lastUpdateTimeRef = useRef<number>(0);
  const debounceTimerRef = useRef<number | null>(null);
  
  // Force refresh state from localStorage on render and when data changes
  useEffect(() => {
    // Function to get fresh data from localStorage
    const getUpdatedData = () => {
      try {
        const rawGeneralInputs = localStorage.getItem('generalInputs');
        const rawUdlLoads = localStorage.getItem('beamLoads');
        const rawPointLoads = localStorage.getItem('beamPointLoads');
        const rawMoments = localStorage.getItem('beamMoments');
        const rawFullUDL = localStorage.getItem('beamFullUDL');
        const rawSelectedSection = localStorage.getItem('selectedSection');
        
        const parsedGeneralInputs = rawGeneralInputs ? JSON.parse(rawGeneralInputs) : {};
        const parsedUdlLoads = rawUdlLoads ? JSON.parse(rawUdlLoads) : [];
        const parsedPointLoads = rawPointLoads ? JSON.parse(rawPointLoads) : [];
        const parsedMoments = rawMoments ? JSON.parse(rawMoments) : [];
        const parsedFullUDL = rawFullUDL ? JSON.parse(rawFullUDL) : {
          tributaryWidth: 0,
          deadGkPa: 0,
          liveQkPa: 0,
          includeSelfWeight: false
        };
        const parsedSelectedSection = rawSelectedSection ? JSON.parse(rawSelectedSection) : null;
        
        // Check if data has actually changed before updating state
        const hasChanged = 
          JSON.stringify(inputs.generalInputs) !== JSON.stringify(parsedGeneralInputs) ||
          JSON.stringify(inputs.udlLoads) !== JSON.stringify(parsedUdlLoads) ||
          JSON.stringify(inputs.pointLoads) !== JSON.stringify(parsedPointLoads) ||
          JSON.stringify(inputs.moments) !== JSON.stringify(parsedMoments) ||
          JSON.stringify(inputs.fullUDL) !== JSON.stringify(parsedFullUDL) ||
          JSON.stringify(inputs.selectedSection) !== JSON.stringify(parsedSelectedSection);
        
        if (hasChanged) {
          // Only update state if something has actually changed
          setInputs({
            generalInputs: parsedGeneralInputs,
            udlLoads: parsedUdlLoads,
            pointLoads: parsedPointLoads,
            moments: parsedMoments,
            fullUDL: parsedFullUDL,
            selectedSection: parsedSelectedSection
          });
        }
      } catch (error) {
        console.error('Error reading data from localStorage:', error);
      }
    };
    
    // Initial load
    getUpdatedData();
    
    // Set up event listener for storage changes

    const handleStorageChange = (event: StorageEvent) => {
      // Only update if it's a key we care about
      const relevantKeys = ['generalInputs', 'beamLoads', 'beamPointLoads', 'beamMoments', 'selectedSection'];
      if (event.key && relevantKeys.includes(event.key)) {
        console.log(`Storage changed for ${event.key}, updating analysis inputs`);
        getUpdatedData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for our app's local changes - use debouncing to avoid rapid updates
    
    const handleAppStorageChange = () => {
      const now = Date.now();
      const debounceTime = 100; // ms
      
      // Simple time-based throttle using useRef
      if (now - lastUpdateTimeRef.current > debounceTime) {
        lastUpdateTimeRef.current = now;
        console.log('App storage changed, updating analysis inputs');
        getUpdatedData();
      } else if (debounceTimerRef.current) {
        // Clear existing timer if it exists
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      
      // Set a new timer for delayed update
      if (!debounceTimerRef.current) {
        debounceTimerRef.current = window.setTimeout(() => {
          lastUpdateTimeRef.current = Date.now();
          getUpdatedData();
          debounceTimerRef.current = null;
        }, debounceTime);
      }
    };
    
    window.addEventListener('app-storage-change', handleAppStorageChange);
    
    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('app-storage-change', handleAppStorageChange);
      
      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const fullUDL = inputs.fullUDL || {
    tributaryWidth: 0,
    deadGkPa: 0,
    liveQkPa: 0,
    includeSelfWeight: false
  }
  
  // Create member properties from selected section
  const [memberProperties, setMemberProperties] = useState<MemberProperties | null>(null)

  // Convert selected section to member properties for analysis
  useEffect(() => {
    const sectionData = inputs.selectedSection;
    // Track section by its designation
    
    if (sectionData) {
      console.log('Processing section data:', sectionData.designation);
      
      const props: MemberProperties = {
        section: sectionData.designation,
        material: sectionData.material || 'Steel',
        depth: sectionData.depth_mm || sectionData.depth || 0,
        width: sectionData.flange_mm || sectionData.width_mm || sectionData.width || 0,
        momentOfInertia: sectionData.I_m4 ? (sectionData.I_m4 * 1e12) : (sectionData.momentOfInertia || 0),
        elasticModulus: sectionData.E || 200000, // Default to 200 GPa for steel if not specified
        J2: sectionData.J2 || 2.0, // Default creep factor if not specified
      }
      
      // Set the member properties without checking current state
      setMemberProperties(props);
    } else {
      // Try to fetch directly from localStorage
      try {
        const rawData = localStorage.getItem('selectedSection');
        if (rawData) {
          const sectionData = JSON.parse(rawData);
          const props: MemberProperties = {
            section: sectionData.designation,
            material: sectionData.material || 'Steel',
            depth: sectionData.depth_mm || sectionData.depth || 0,
            width: sectionData.flange_mm || sectionData.width_mm || sectionData.width || 0,
            momentOfInertia: sectionData.I_m4 ? (sectionData.I_m4 * 1e12) : (sectionData.momentOfInertia || 0),
            elasticModulus: sectionData.E || 200000, 
            J2: sectionData.J2 || 2.0,
          }
          setMemberProperties(props);
          return;
        }
      } catch (error) {
        console.error('Error reading selectedSection from localStorage:', error);
      }
      
      // If we get here, there's no valid section data
      setMemberProperties(null);
    }
  }, [inputs.selectedSection]) // Removed memberProperties from dependencies

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
    fullUDL,
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

// Export the component wrapped with React.memo for performance optimization
export default React.memo(DesignAnalysisCard)
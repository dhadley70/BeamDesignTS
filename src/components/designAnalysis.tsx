import React, { useEffect, useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { PropertyCell } from '@/components/ui/property-cell'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import useLocalStorage from '@/hooks/useLocalStorage'
import useBeamAnalysis from './beamAnalysis'
import type { MemberProperties } from './beamAnalysis'
import type { UDLLoad, PointLoad, Moment, FullUDL } from '@/components/loadsInput'
import { COLLAPSE_ALL_CARDS, EXPAND_ALL_CARDS, getShortcutKey } from '@/lib/cardStateManager'

export const DesignAnalysisCard = () => {
  // State for collapsing the card with localStorage persistence
  const [collapsed, setCollapsed] = useLocalStorage('designAnalysisCard_collapsed', false);
  
  // Handle global collapse/expand events
  useEffect(() => {
    const handleCollapseAll = () => setCollapsed(true);
    const handleExpandAll = () => setCollapsed(false);
    
    window.addEventListener(COLLAPSE_ALL_CARDS, handleCollapseAll);
    window.addEventListener(EXPAND_ALL_CARDS, handleExpandAll);
    
    return () => {
      window.removeEventListener(COLLAPSE_ALL_CARDS, handleCollapseAll);
      window.removeEventListener(EXPAND_ALL_CARDS, handleExpandAll);
    };
  }, [setCollapsed]);
  
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
        
        // Validate UDL loads specifically to catch any inconsistencies
        if (rawUdlLoads) {
          try {
            const parsedUdlLoads = JSON.parse(rawUdlLoads);
            // If there are no UDL loads but the analysis is still showing loads,
            // let's force a reset to ensure state is consistent
            if (parsedUdlLoads.length === 0) {
              console.log('UDL loads array is empty but analysis may be using cached values - clearing localStorage');
              // Force clear just to be safe
              localStorage.setItem('beamLoads', JSON.stringify([]));
            }
          } catch (parseError) {
            console.error('Error parsing UDL loads, resetting to empty array:', parseError);
            localStorage.setItem('beamLoads', JSON.stringify([]));
          }
        } else {
          // If no UDL loads exist in localStorage, initialize with empty array
          console.log('No UDL loads found in localStorage, initializing empty array');
          localStorage.setItem('beamLoads', JSON.stringify([]));
        }
        
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
  
  // Extract parameters from general inputs - always get the freshest value from localStorage
  const getLatestGeneralInputs = () => {
    try {
      const rawGeneralInputs = localStorage.getItem('generalInputs');
      if (rawGeneralInputs) {
        return JSON.parse(rawGeneralInputs);
      }
    } catch (error) {
      console.error('Error reading general inputs from localStorage', error);
    }
    return inputs.generalInputs || {};
  };
  
  const generalInputs = getLatestGeneralInputs();
  const span = generalInputs?.span || 3.0
  // Get number of members from localStorage
  const members = Number(localStorage.getItem('numberOfMembers')) || 1
  const ws = generalInputs?.ws || 0.4
  const wl = generalInputs?.wl || 0.3
  
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
        J2: sectionData.J2 || 2.0, // Default creep factor if not specified,
        mass_kg_m: sectionData.mass_kg_m || 0, // Include mass per unit length for accurate self-weight
        density_kg_m3: sectionData.density_kg_m3 || 0 // Use specific timber density from catalog
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
            mass_kg_m: sectionData.mass_kg_m || 0, // Include mass per unit length for accurate self-weight
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

  // Generate a summary of the most important results for display when collapsed
  const getResultsSummary = () => {
    try {
      if (!analysisResults || !inputs.selectedSection) {
        return "| No results available |";
      }
      
      // Initial Deflection percentage
      const initialDeflectionLimit = span * 1000 / 240;
      const initialDeflectionPercentage = (analysisResults.maxInitialDeflection / initialDeflectionLimit) * 100;
      const initialDeflectionText = `Init: ${initialDeflectionPercentage.toFixed(0)}%`;
      
      // Short-term Deflection percentage
      const shortDeflectionLimit = span * 1000 / 180;
      const shortDeflectionPercentage = (analysisResults.maxShortDeflection / shortDeflectionLimit) * 100;
      const shortDeflectionText = `Short: ${shortDeflectionPercentage.toFixed(0)}%`;
      
      // Long-term Deflection percentage
      const longDeflectionLimit = span * 1000 / 120;
      const longDeflectionPercentage = (analysisResults.maxLongDeflection / longDeflectionLimit) * 100;
      const longDeflectionText = `Long: ${longDeflectionPercentage.toFixed(0)}%`;
      
      // Moment utilization percentage
      const momentPercentage = inputs.selectedSection?.phiM && analysisResults.maxMoment 
        ? (analysisResults.maxMoment / inputs.selectedSection.phiM) * 100 
        : null;
      const momentText = momentPercentage !== null 
        ? `M: ${momentPercentage.toFixed(0)}%` 
        : "M: N/A";
      
      // Shear utilization percentage
      const shearPercentage = inputs.selectedSection?.phiV && analysisResults.maxShear 
        ? (analysisResults.maxShear / inputs.selectedSection.phiV) * 100 
        : null;
      const shearText = shearPercentage !== null 
        ? `V: ${shearPercentage.toFixed(0)}%` 
        : "V: N/A";
      
      return `| ${initialDeflectionText} | ${shortDeflectionText} | ${longDeflectionText} | ${momentText} | ${shearText} |`;
    } catch (error) {
      console.error("Error generating results summary:", error);
      return "| Error in results |";
    }
  };

  return (
    <Card className="mt-6 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">Design</CardTitle>
          <span className="text-base opacity-80 font-medium">{getResultsSummary()}</span>
        </div>
        <Button 
          variant="ghost" 
          className="p-1 h-auto flex items-center gap-1" 
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand" : "Collapse"}
          title={`Toggle card visibility (${getShortcutKey()} to toggle all)`}
        >
          {collapsed ? 
            <ChevronDown className="h-5 w-5 text-[var(--text)]" /> : 
            <ChevronUp className="h-5 w-5 text-[var(--text)]" />}
        </Button>
      </CardHeader>
      {!collapsed && (
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
      )}
    </Card>
  )
}

// Export the component wrapped with React.memo for performance optimization
export default React.memo(DesignAnalysisCard)
import { useState, useEffect } from 'react';
import type { UDLLoad, PointLoad, Moment } from '@/components/loadsInput';
import ultimateLoadCombinations from '@/data/ultimateLoadCombinations.json';
import serviceabilityLoadCombinations from '@/data/serviceabilityLoadCombinations.json';

// Define the output type for the beam analysis
export interface BeamAnalysisResults {
  // Deflections
  maxInitialDeflection: number;  // Max deflection for initial (1.0G) combination
  maxShortDeflection: number;    // Max deflection for short-term (wsQ) combination
  maxLongDeflection: number;     // Max deflection for long-term J2(1.0G + wlQ) combination
  
  // Ultimate limit states
  maxMoment: number;             // Max moment from ULS combinations (M*)
  maxShear: number;              // Max shear from ULS combinations (V*)
  
  // Which load case controls
  controllingMomentCase: string;
  controllingShearCase: string;
}

// Define member properties interface needed for analysis
export interface MemberProperties {
  section: string;                 // Section designation
  material: string;                // Steel, Timber-LVL, etc.
  depth: number;                   // Section depth in mm
  width: number;                   // Section width in mm 
  momentOfInertia: number;         // Second moment of area in mm⁴
  elasticModulus: number;          // Young's modulus in MPa
  J2: number;                      // Creep factor (for long-term deflection)
}

interface BeamAnalysisProps {
  span: number;                    // Beam span in meters
  members: number;                 // Number of members
  ws: number;                      // Short-term variable action factor
  wl: number;                      // Long-term variable action factor
  J2: number;                      // Creep factor
  udlLoads: UDLLoad[];             // UDL loads
  pointLoads: PointLoad[];         // Point loads
  moments: Moment[];               // Applied moments
  memberProperties: MemberProperties | null; // Member properties (or null if not selected)
}

export const useBeamAnalysis = (props: BeamAnalysisProps): BeamAnalysisResults | null => {
  const [results, setResults] = useState<BeamAnalysisResults | null>(null);
  
  // Function to perform beam analysis
  const performAnalysis = () => {
    const {
      span, 
      members, 
      ws, 
      wl, 
      J2, 
      udlLoads, 
      pointLoads, 
      moments,
      memberProperties
    } = props;
    
    // Only perform analysis if we have valid member properties
    if (!memberProperties) {
      console.log('No member properties available for analysis');
      return null;
    }
    
    console.log('Performing beam analysis with:', { 
      span, 
      members, 
      memberProperties: memberProperties.section 
    });

    // Convert the span to mm for calculations
    const spanMm = span * 1000;
    
    // Create analysis points along the beam (100 points for smooth curves)
    const numPoints = 100;
    const dx = spanMm / numPoints;
    const positions = Array.from({ length: numPoints + 1 }, (_, i) => i * dx);
    
    // Initialize arrays for each load case
    const ulsCombinations = ultimateLoadCombinations.ultimateLimitStates;
    const slsCombinations = serviceabilityLoadCombinations.serviceabilityLimitStates;
    
    // Calculate moments, shears and deflections for each position
    let maxMoment = 0;
    let maxShear = 0;
    let maxInitialDeflection = 0;
    let maxShortDeflection = 0;
    let maxLongDeflection = 0;
    let controllingMomentCase = '';
    let controllingShearCase = '';
    
    // --- Ultimate Limit State Analysis ---
    // For each ULS combination, calculate moment and shear at each position
    ulsCombinations.forEach(combination => {
      const { factors, name } = combination;
      const deadLoadFactor = factors.deadLoad;
      const liveLoadFactor = factors.liveLoad;
      
      positions.forEach((x) => {
        // Convert position from mm to m for load calculations
        const posM = x / 1000;
        
        // Calculate moment and shear at this position for this load combination
        let moment = 0;
        let shear = 0;
        
        // Process UDL loads
        udlLoads.forEach(load => {
          if (posM >= load.start && posM <= load.finish) {
            // UDL contribution to moment and shear
            const udlLength = load.finish - load.start;
            const deadLoad = load.udlG * deadLoadFactor;
            const liveLoad = load.udlQ * liveLoadFactor;
            const totalLoad = deadLoad + liveLoad;
            
            // For a simply supported beam with a partial UDL:
            // Position is a from left support, UDL starts at 'start' and ends at 'finish'
            const a = load.start;
            const b = load.finish;
            
            if (posM >= a && posM <= b) {
              // Position is within the UDL region
              // Shear force at position x
              const leftReaction = totalLoad * udlLength * (span - (a + b)/2) / span;
              const loadToLeft = totalLoad * (posM - a);
              shear += leftReaction - loadToLeft;
              
              // Moment at position x
              moment += leftReaction * posM - totalLoad * (posM - a) * (posM - a) / 2;
            } else if (posM < a) {
              // Position is to the left of the UDL
              const leftReaction = totalLoad * udlLength * (span - (a + b)/2) / span;
              shear += leftReaction;
              moment += leftReaction * posM;
            } else {
              // Position is to the right of the UDL
              const rightReaction = totalLoad * udlLength * ((a + b)/2) / span;
              shear -= rightReaction;
              moment += rightReaction * (span - posM);
            }
          }
        });
        
        // Process point loads
        pointLoads.forEach(load => {
          const deadLoad = load.pointG * deadLoadFactor;
          const liveLoad = load.pointQ * liveLoadFactor;
          const totalLoad = deadLoad + liveLoad;
          const loadPos = load.location;
          
          // Calculate reactions
          const leftReaction = totalLoad * (span - loadPos) / span;
          const rightReaction = totalLoad * loadPos / span;
          
          if (posM < loadPos) {
            // Position is to the left of the point load
            shear += leftReaction;
            moment += leftReaction * posM;
          } else {
            // Position is to the right of the point load
            shear -= rightReaction;
            moment += rightReaction * (span - posM);
          }
        });
        
        // Process moments
        moments.forEach(load => {
          const deadMoment = load.momentG * deadLoadFactor;
          const liveMoment = load.momentQ * liveLoadFactor;
          const totalMoment = deadMoment + liveMoment;
          const momentPos = load.location;
          
          // For a simply supported beam with an applied moment,
          // the moment at any position can be calculated
          const leftReaction = totalMoment / span;
          
          if (posM <= momentPos) {
            // Position is to the left of the applied moment
            shear += leftReaction;
            moment += leftReaction * posM;
          } else {
            // Position is to the right of the applied moment
            shear += leftReaction;
            moment += leftReaction * posM - totalMoment;
          }
        });
        
        // Update maximum values if this combination produces larger results
        if (Math.abs(moment) > Math.abs(maxMoment)) {
          maxMoment = moment;
          controllingMomentCase = name;
        }
        
        if (Math.abs(shear) > Math.abs(maxShear)) {
          maxShear = shear;
          controllingShearCase = name;
        }
      });
    });
    
    // --- Serviceability Limit State Analysis (Deflection) ---
    // Calculate deflections using simplified formulas for the three SLS cases
    
    // For a simply supported beam, deflection calculation requires:
    // - Elastic modulus (E)
    // - Moment of inertia (I)
    // - Load distribution
    const E = memberProperties.elasticModulus;  // MPa
    const I = memberProperties.momentOfInertia; // mm⁴
    
    // Process each SLS combination
    slsCombinations.forEach((combination) => {
      let maxDeflectionForCase = 0;
      
      // Get load factors for this combination
      const { name, factors } = combination;
      let deadLoadFactor = typeof factors.deadLoad === 'number' ? factors.deadLoad : 1.0;
      let liveLoadFactor = 0;
      
      // Handle special factors for SLS cases
      if (name === 'SLS Short') {
        // Short-term: ws×Q
        deadLoadFactor = 0;
        liveLoadFactor = ws;
      } else if (name === 'SLS Long') {
        // Long-term: J2×(1.0G + wl×Q)
        deadLoadFactor = J2;
        liveLoadFactor = J2 * wl;
      }
      
      // Simplified deflection calculation for each type of load
      // UDL Loads
      udlLoads.forEach(load => {
        const deadLoad = load.udlG * deadLoadFactor;
        const liveLoad = load.udlQ * liveLoadFactor;
        const totalLoad = deadLoad + liveLoad;
        
        if (totalLoad > 0) {
          // For uniform load over entire span: delta = 5wL⁴/(384EI)
          // This is a simplification - for partial UDLs a more complex formula is needed
          const loadLength = (load.finish - load.start) * 1000; // convert to mm
          
          // For a partial UDL on a simply supported beam:
          // Simplified approach - use superposition
          // Use direct values in calculation below
          const L = spanMm;
          
          // Convert load from kN/m to N/mm
          const w = totalLoad / 1000;
          
          // Calculate deflection using appropriate formula for partial UDL
          // This is an approximation based on superposition principles
          const deflection = (w * loadLength * (L**3 - 2*L*loadLength**2 + loadLength**3) /
                            (24 * E * I * L));
                            
          maxDeflectionForCase = Math.max(maxDeflectionForCase, deflection);
        }
      });
      
      // Point Loads
      pointLoads.forEach(load => {
        const deadLoad = load.pointG * deadLoadFactor;
        const liveLoad = load.pointQ * liveLoadFactor;
        const totalLoad = deadLoad + liveLoad;
        
        if (totalLoad > 0) {
          // For point load: delta = PL³/(48EI) at midspan
          // For off-center point loads, use more complex formula
          const a = load.location * 1000; // convert to mm (distance from left support)
          const L = spanMm;
          const b = L - a;
          
          // Convert load from kN to N
          const P = totalLoad * 1000;
          
          // Calculate deflection using formula for point load at any position
          const deflection = (P * b * (L**2 - b**2)) / (3 * E * I * L);
          maxDeflectionForCase = Math.max(maxDeflectionForCase, deflection);
        }
      });
      
      // Moments
      moments.forEach(load => {
        const deadMoment = load.momentG * deadLoadFactor;
        const liveMoment = load.momentQ * liveLoadFactor;
        const totalMoment = deadMoment + liveMoment;
        
        if (Math.abs(totalMoment) > 0) {
          // For applied moment: use appropriate formula based on position
          const a = load.location * 1000; // convert to mm
          const L = spanMm;
          
          // Convert moment from kNm to Nmm
          const M = totalMoment * 1000000;
          
          // Calculate deflection using formula for moment at any position
          const deflection = (M * a * (L - a)) / (2 * E * I * L);
          maxDeflectionForCase = Math.max(maxDeflectionForCase, deflection);
        }
      });
      
      // Update the appropriate max deflection based on the combination
      if (name === 'SLS Initial') {
        maxInitialDeflection = maxDeflectionForCase;
      } else if (name === 'SLS Short') {
        maxShortDeflection = maxDeflectionForCase;
      } else if (name === 'SLS Long') {
        maxLongDeflection = maxDeflectionForCase;
      }
    });
    
    // Return the analysis results
    return {
      maxInitialDeflection,
      maxShortDeflection,
      maxLongDeflection,
      maxMoment,
      maxShear,
      controllingMomentCase,
      controllingShearCase
    };
  };
  
  // Handler for storage changes
  const handleStorageChange = () => {
    console.log('Storage change detected in beam analysis');
    // Trigger analysis
    const newResults = performAnalysis();
    setResults(newResults);
  };

  // Perform analysis when inputs change and setup event listener
  useEffect(() => {
    console.log('Setting up beam analysis with event listener');
    
    // Initial analysis
    const initialResults = performAnalysis();
    setResults(initialResults);
    
    // Add event listener for storage changes
    window.addEventListener('app-storage-change', handleStorageChange);
    
    // Cleanup function
    return () => {
      window.removeEventListener('app-storage-change', handleStorageChange);
    };
  }, [props]);
  
  return results;
};

export default useBeamAnalysis;
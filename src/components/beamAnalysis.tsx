import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { UDLLoad, PointLoad, Moment, FullUDL } from '@/components/loadsInput';
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

export interface BeamAnalysisProps {
  span: number;                    // Beam span in meters
  members: number;                 // Number of members
  ws: number;                      // Short-term variable action factor
  wl: number;                      // Long-term variable action factor
  J2: number;                      // Creep factor
  udlLoads: UDLLoad[];             // UDL loads
  pointLoads: PointLoad[];         // Point loads
  moments: Moment[];               // Applied moments
  fullUDL: FullUDL;                // Full UDL data for tributary loads
  memberProperties: MemberProperties | null; // Member properties (or null if not selected)
}

function useBeamAnalysis(props: BeamAnalysisProps): BeamAnalysisResults | null {
  const [results, setResults] = useState<BeamAnalysisResults | null>(null);
  
  useEffect(() => {
    // Bail early if no member properties are available
    if (!props.memberProperties) {
      console.log('Analysis skipped: No member properties available');
      return;
    }
    
    console.log('==== STARTING BEAM ANALYSIS ====');
    console.log('Beam properties:', {
      span: props.span,
      members: props.members,
      ws: props.ws,
      wl: props.wl,
      J2: props.J2,
      section: props.memberProperties.section,
      material: props.memberProperties.material,
      momentOfInertia: props.memberProperties.momentOfInertia,
      elasticModulus: props.memberProperties.elasticModulus
    });
    
    // Log load data
    console.log('UDL loads:', props.udlLoads);
    console.log('Point loads:', props.pointLoads);
    console.log('Moments:', props.moments);
    console.log('Full UDL:', props.fullUDL);
    
    // Simple functions to calculate basic beam deflections (actual calculations would be more complex)
    
    // Calculate deflection for a uniformly distributed load
    const calculateUDLDeflection = (load: number, span: number, EI: number) => {
      // Formula: delta = 5wL^4 / (384EI)
      const deflection = (5 * load * Math.pow(span, 4)) / (384 * EI);
      console.log(`UDL Deflection calculation for load ${load} kN/m:`, {
        load,
        span,
        EI,
        formula: '5wL^4 / (384EI)',
        result: deflection
      });
      return deflection;
    };
    
    // Calculate deflection for a point load at midspan
    const calculatePointLoadDeflection = (load: number, span: number, EI: number, position: number) => {
      // Simplified midspan load formula: delta = PL^3 / (48EI)
      // For other positions, more complex formulas would be used
      const deflection = (load * Math.pow(span, 3)) / (48 * EI);
      console.log(`Point Load Deflection calculation for load ${load} kN at position ${position}m:`, {
        load,
        span,
        EI,
        position,
        formula: 'PL^3 / (48EI) (simplified)',
        result: deflection
      });
      return deflection;
    };
    
    // Process ULS load combinations
    console.log('--- ULS ANALYSIS ---');
    
    // Process SLS load combinations for deflection
    console.log('--- SLS ANALYSIS (DEFLECTION) ---');
    
    // Calculate EI (flexural stiffness)
    const EI = props.memberProperties.elasticModulus * props.memberProperties.momentOfInertia;
    console.log('Calculated flexural stiffness (EI):', {
      E: props.memberProperties.elasticModulus,
      I: props.memberProperties.momentOfInertia,
      EI
    });
    
    // Calculate initial deflection (dead load only)
    let initialDeflection = 0;
    
    // Add UDL dead loads
    props.udlLoads.forEach(udl => {
      if (udl.udlG > 0) {
        const deflection = calculateUDLDeflection(udl.udlG, props.span, EI);
        initialDeflection += deflection;
        console.log(`Added UDL dead load deflection from ${udl.start}-${udl.finish}m: ${deflection} mm, running total: ${initialDeflection} mm`);
      }
    });
    
    // Add point dead loads
    props.pointLoads.forEach(point => {
      if (point.pointG > 0) {
        const deflection = calculatePointLoadDeflection(point.pointG, props.span, EI, point.location);
        initialDeflection += deflection;
        console.log(`Added point dead load deflection at ${point.location}m: ${deflection} mm, running total: ${initialDeflection} mm`);
      }
    });
    
    // Add full UDL dead load if applicable
    if (props.fullUDL.tributaryWidth > 0 && props.fullUDL.deadGkPa > 0) {
      const fullUDLDeadLoad = props.fullUDL.deadGkPa * props.fullUDL.tributaryWidth;
      const deflection = calculateUDLDeflection(fullUDLDeadLoad, props.span, EI);
      initialDeflection += deflection;
      console.log(`Added full UDL dead load deflection: ${deflection} mm, running total: ${initialDeflection} mm`);
    }
    
    // Calculate short-term deflection (dead + short-term live)
    let shortTermDeflection = initialDeflection;
    
    // Add UDL live loads (with short-term factor)
    props.udlLoads.forEach(udl => {
      if (udl.udlQ > 0) {
        const deflection = calculateUDLDeflection(udl.udlQ * props.ws, props.span, EI);
        shortTermDeflection += deflection;
        console.log(`Added UDL live load deflection from ${udl.start}-${udl.finish}m (short-term): ${deflection} mm, running total: ${shortTermDeflection} mm`);
      }
    });
    
    // Add point live loads (with short-term factor)
    props.pointLoads.forEach(point => {
      if (point.pointQ > 0) {
        const deflection = calculatePointLoadDeflection(point.pointQ * props.ws, props.span, EI, point.location);
        shortTermDeflection += deflection;
        console.log(`Added point live load deflection at ${point.location}m (short-term): ${deflection} mm, running total: ${shortTermDeflection} mm`);
      }
    });
    
    // Add full UDL live load if applicable (with short-term factor)
    if (props.fullUDL.tributaryWidth > 0 && props.fullUDL.liveQkPa > 0) {
      const fullUDLLiveLoad = props.fullUDL.liveQkPa * props.fullUDL.tributaryWidth * props.ws;
      const deflection = calculateUDLDeflection(fullUDLLiveLoad, props.span, EI);
      shortTermDeflection += deflection;
      console.log(`Added full UDL live load deflection (short-term): ${deflection} mm, running total: ${shortTermDeflection} mm`);
    }
    
    // Calculate long-term deflection (dead with creep + long-term live)
    // For dead load, apply creep factor J2
    let longTermDeflection = initialDeflection * props.J2;
    console.log(`Long-term dead load deflection with creep: ${initialDeflection} mm * ${props.J2} = ${longTermDeflection} mm`);
    
    // Add UDL live loads (with long-term factor)
    props.udlLoads.forEach(udl => {
      if (udl.udlQ > 0) {
        const deflection = calculateUDLDeflection(udl.udlQ * props.wl, props.span, EI);
        longTermDeflection += deflection;
        console.log(`Added UDL live load deflection from ${udl.start}-${udl.finish}m (long-term): ${deflection} mm, running total: ${longTermDeflection} mm`);
      }
    });
    
    // Add point live loads (with long-term factor)
    props.pointLoads.forEach(point => {
      if (point.pointQ > 0) {
        const deflection = calculatePointLoadDeflection(point.pointQ * props.wl, props.span, EI, point.location);
        longTermDeflection += deflection;
        console.log(`Added point live load deflection at ${point.location}m (long-term): ${deflection} mm, running total: ${longTermDeflection} mm`);
      }
    });
    
    // Add full UDL live load if applicable (with long-term factor)
    if (props.fullUDL.tributaryWidth > 0 && props.fullUDL.liveQkPa > 0) {
      const fullUDLLiveLoad = props.fullUDL.liveQkPa * props.fullUDL.tributaryWidth * props.wl;
      const deflection = calculateUDLDeflection(fullUDLLiveLoad, props.span, EI);
      longTermDeflection += deflection;
      console.log(`Added full UDL live load deflection (long-term): ${deflection} mm, running total: ${longTermDeflection} mm`);
    }
    
    // Convert mm deflections to absolute values (remove negative sign if present)
    initialDeflection = Math.abs(initialDeflection);
    shortTermDeflection = Math.abs(shortTermDeflection);
    longTermDeflection = Math.abs(longTermDeflection);
    
    console.log('Final deflection results:', {
      initialDeflection,
      shortTermDeflection,
      longTermDeflection
    });
    
    // Simplified ULS calculations (for demonstration)
    const maxMoment = 50;  // kNm (simplified)
    const maxShear = 30;   // kN (simplified)
    
    console.log('==== ANALYSIS COMPLETE ====');
    
    // Set the results
    setResults({
      maxInitialDeflection: initialDeflection,
      maxShortDeflection: shortTermDeflection,
      maxLongDeflection: longTermDeflection,
      maxMoment,
      maxShear,
      controllingMomentCase: 'ULS-1',
      controllingShearCase: 'ULS-1'
    });
    
  }, [props.span, props.members, props.ws, props.wl, props.J2, props.udlLoads, 
      props.pointLoads, props.moments, props.fullUDL, props.memberProperties]);
  
  return results;
}

export default useBeamAnalysis;
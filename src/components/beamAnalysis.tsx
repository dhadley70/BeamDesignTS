import { useState, useEffect } from 'react';
import type { UDLLoad, PointLoad, Moment, FullUDL } from '@/components/loadsInput';
import ultimateLoadCombinations from '@/data/ultimateLoadCombinations.json';

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
  mass_kg_m?: number;              // Mass per unit length in kg/m
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
    
    // Calculate self-weight
    let selfWeight = 0;
    const isSteelMaterial = props.memberProperties.material.toLowerCase().includes('steel');
    const isTimberMaterial = props.memberProperties.material.toLowerCase().includes('timber') || 
                           props.memberProperties.material.toLowerCase().includes('lvl');
    
    // For steel sections, use the mass_kg_m if available
    if (isSteelMaterial && props.memberProperties.mass_kg_m) {
      // Convert kg/m to kN/m for steel sections
      selfWeight = props.memberProperties.mass_kg_m * 9.81 / 1000;
      console.log(`Steel section: Using mass_kg_m (${props.memberProperties.mass_kg_m} kg/m) for self-weight: ${selfWeight} kN/m`);
    } 
    // For all other cases (timber, concrete, or steel without mass_kg_m), use dimensional calculation
    else {
      // Calculate using dimensions
      const crossSectionArea = props.memberProperties.width * props.memberProperties.depth; // mm²
      
      // Determine material density (kg/m³)
      let materialDensity = 0;
      if (isSteelMaterial) {
        materialDensity = 7850; // kg/m³ for steel
      } else if (isTimberMaterial) {
        materialDensity = 500; // kg/m³ for timber/LVL (approximate)
      } else if (props.memberProperties.material.toLowerCase().includes('concrete')) {
        materialDensity = 2400; // kg/m³ for concrete
      } else {
        materialDensity = 1000; // Default density
      }
      
      // Calculate self-weight in kN/m
      // Convert mm² to m², multiply by density, convert kg to kN
      selfWeight = crossSectionArea * (1/1000000) * materialDensity * 9.81/1000;
      
      if (isTimberMaterial) {
        console.log(`Timber section: Using dimensions ${props.memberProperties.width}mm x ${props.memberProperties.depth}mm for self-weight: ${selfWeight} kN/m`);
      } else if (isSteelMaterial) {
        console.log(`Steel section: Using dimensions for self-weight: ${selfWeight} kN/m (mass_kg_m not provided)`);
      } else {
        console.log(`Section type ${props.memberProperties.material}: Using dimensions for self-weight: ${selfWeight} kN/m`);
      }
    }
    
    console.log('Beam properties:', {
      span: props.span,
      members: props.members,
      ws: props.ws,
      wl: props.wl,
      J2: props.J2,
      section: props.memberProperties.section,
      material: props.memberProperties.material,
      width: props.memberProperties.width,
      depth: props.memberProperties.depth,
      selfWeight: selfWeight,
      includeSelfWeight: props.fullUDL.includeSelfWeight,
      momentOfInertia: props.memberProperties.momentOfInertia,
      elasticModulus: props.memberProperties.elasticModulus
    });
    
    // Log load data
    console.log('=== UDL LOADS DEBUG ===');
    // Check what's actually in localStorage
    console.log('Raw localStorage beamLoads value:', localStorage.getItem('beamLoads'));
    console.log(`Raw UDL loads array:`, JSON.stringify(props.udlLoads));
    
    // Log each UDL load separately for clarity
    props.udlLoads.forEach((udl, index) => {
      console.log(`UDL Load ${index}: id=${udl.id}, start=${udl.start}m, finish=${udl.finish}m, udlG=${udl.udlG}kN/m, udlQ=${udl.udlQ}kN/m`);
    });
    console.log('=== END UDL LOADS DEBUG ===');
    
    console.log('UDL loads:', props.udlLoads);
    console.log('Point loads:', props.pointLoads);
    console.log('Moments:', props.moments);
    console.log('Full UDL:', props.fullUDL);
    
    // Simple functions to calculate basic beam deflections (actual calculations would be more complex)
    
    // Calculate deflection for a uniformly distributed load
    const calculateUDLDeflection = (load: number, span: number, start: number, finish: number, EI: number) => {
      // Unit conversion factors
      // - load is in kN/m, need to convert to N/mm (×1000/1000)
      // - span is in m, need to convert to mm (×1000)
      // - EI is in N·mm²
      // - result will be in mm
      
      const w = load * 1; // kN/m to N/mm (1000/1000)
      const L = span * 1000; // m to mm
      
      // Check if it's a full-span UDL or partial UDL
      const isFullSpan = (start <= 0.001) && (finish >= span - 0.001);
      let deflection = 0;
      let maxDeflectionPosition = 0;
      
      if (isFullSpan) {
        // For full-span UDL: delta = 5wL^4 / (384EI)
        deflection = (5 * w * Math.pow(L, 4)) / (384 * EI);
        maxDeflectionPosition = span / 2; // midspan
        
        console.log(`UDL Deflection calculation (full-span) for load ${load} kN/m:`, {
          load: load,
          w_converted: w,
          span: span,
          L_converted: L,
          EI: EI,
          formula: '5wL^4 / (384EI)',
          maxDeflectionAt: maxDeflectionPosition,
          result: deflection,
          units: 'deflection in mm'
        });
      } else {
        // For a partial UDL on a simply supported beam
        // Using the macaulay method formula for a partial UDL from a to b:
        // Δmax = (w/24EI) × [ x₁(L³ - 2Lx₁² + x₁³) - x₂(L³ - 2Lx₂² + x₂³) ]
        // where x₁ is the distance from left support to start of UDL
        // and x₂ is the distance from left support to end of UDL
        
        const a = start * 1000; // convert m to mm
        const b = finish * 1000; // convert m to mm
        
        const term1 = a * (Math.pow(L, 3) - 2 * L * Math.pow(a, 2) + Math.pow(a, 3));
        const term2 = b * (Math.pow(L, 3) - 2 * L * Math.pow(b, 2) + Math.pow(b, 3));
        deflection = (w / (24 * EI)) * (term1 - term2);
        
        // Find position of maximum deflection (approximate using numerical approach)
        const numPoints = 100;
        let maxDeflection = 0;
        
        for (let i = 0; i <= numPoints; i++) {
          const x = (i / numPoints) * span;
          // Skip points outside the span
          if (x < 0 || x > span) continue;
          
          // Calculate deflection at this point (simplified)
          let pointDeflection = 0;
          // Different formula based on position relative to the load
          if (x < start) {
            // Point is to the left of the UDL
            pointDeflection = (w * (finish - start) * x) / (6 * EI * L) * (L - x - (finish + start)/2);
          } else if (x > finish) {
            // Point is to the right of the UDL
            pointDeflection = (w * (finish - start) * (L - x)) / (6 * EI * L) * (x - (finish + start)/2);
          } else {
            // Point is under the UDL (approximation)
            pointDeflection = (w / (24 * EI)) * (
              x * 1000 * (Math.pow(L, 3) - 2 * L * Math.pow(x * 1000, 2) + Math.pow(x * 1000, 3)) - 
              start * 1000 * (Math.pow(L, 3) - 2 * L * Math.pow(start * 1000, 2) + Math.pow(start * 1000, 3))
            );
          }
          
          const absDeflection = Math.abs(pointDeflection);
          if (absDeflection > maxDeflection) {
            maxDeflection = absDeflection;
            maxDeflectionPosition = x;
          }
        }
        
        // Use absolute value for the result
        deflection = Math.abs(deflection);
        
        console.log(`UDL Deflection calculation (partial UDL) for load ${load} kN/m from ${start}m to ${finish}m:`, {
          load: load,
          w_converted: w,
          span: span,
          start: start,
          finish: finish,
          a_mm: a,
          b_mm: b,
          L_mm: L,
          EI: EI,
          formula: 'macaulay method for partial UDL',
          maxDeflectionAt: maxDeflectionPosition,
          result: deflection,
          units: 'deflection in mm'
        });
      }
      
      return deflection;
    };
    
    // Calculate deflection for a point load at any position
    const calculatePointLoadDeflection = (load: number, span: number, EI: number, position: number) => {
      // Unit conversion factors
      // - load is in kN, need to convert to N (×1000)
      // - span and position are in m, need to convert to mm (×1000)
      // - EI is in N·mm²
      // - result will be in mm
      
      const P = load * 1000; // kN to N
      const L = span * 1000; // m to mm
      const pos = position * 1000; // m to mm
      
      // For a point load at any position (a) on a simply supported beam:
      // Δmax = (P·a·b·(L+b-a))/(6·E·I·L) at a specific point x
      // where:
      // - a is the distance from left support to the load
      // - b is L-a (distance from load to right support)
      // - maximum deflection occurs at a specific point (calculated below)
      
      const a = pos; // distance from left support to load in mm
      const b = L - a; // distance from load to right support in mm
      
      // Calculate deflection at position of maximum deflection
      // For a point load, the maximum deflection may not be directly under the load
      
      // Calculate position of maximum deflection
      let xMax = 0;
      if (position <= span/2) {
        // Load is in the first half of the beam
        xMax = Math.sqrt(a*a*(3*b+L))/(Math.sqrt(3)*L);
      } else {
        // Load is in the second half of the beam
        xMax = L - Math.sqrt(b*b*(3*a+L))/(Math.sqrt(3)*L);
      }
      
      // Convert xMax back to m for reporting
      const xMaxM = xMax / 1000;
      
      // Calculate maximum deflection
      const deflection = (P * a * b * (L + b - a)) / (6 * EI * L);
      
      console.log(`Point Load Deflection calculation for load ${load} kN at position ${position}m:`, {
        load: load,
        P_converted: P,
        span: span,
        L_converted: L,
        position: position,
        pos_converted: pos,
        a: a,
        b: b,
        EI: EI,
        formula: '(P·a·b·(L+b-a))/(6·E·I·L)',
        maxDeflectionAt: xMaxM,
        result: deflection,
        units: 'deflection in mm'
      });
      
      return deflection;
    };
    
    // Process ULS load combinations
    console.log('--- ULS ANALYSIS ---');
    
    // Calculate maximum moment and shear for ULS combinations
    let calculatedMaxMoment = 0;
    let calculatedMaxShear = 0;
    let controllingMomentCase = '';
    let controllingShearCase = '';
    
    // Calculate maximum moment for a UDL (simplified for midspan moment in simply supported beam)
    const calculateUDLMoment = (load: number, span: number, start: number, finish: number) => {
      // For full-span UDL: M = wL²/8
      // For partial UDL: more complex calculation needed based on position
      
      // Simplified approach for demo - using wL²/8 for full span
      const isFullSpan = (start <= 0.001) && (finish >= span - 0.001);
      let moment = 0;
      
      if (isFullSpan) {
        moment = (load * Math.pow(span, 2)) / 8;
      } else {
        // For partial UDL, use a simplified approximation
        const effectiveLength = finish - start;
        const midpoint = (start + finish) / 2;
        const eccentricity = Math.abs(span/2 - midpoint);
        
        // Reduced effect based on distance from midspan
        const reductionFactor = 1 - (2 * eccentricity / span);
        moment = (load * effectiveLength * Math.pow(span, 2) * reductionFactor) / 8;
      }
      
      console.log(`UDL Moment calculation for load ${load} kN/m from ${start}m to ${finish}m:`, {
        load,
        span,
        start,
        finish,
        isFullSpan,
        formula: isFullSpan ? 'wL²/8' : 'approximation for partial UDL',
        result: moment
      });
      
      return moment;
    };
    
    // Calculate maximum moment for a point load
    const calculatePointLoadMoment = (load: number, span: number, position: number) => {
      // For point load: M = P·a·b/L where a = position, b = L-a
      const a = position;
      const b = span - position;
      const moment = (load * a * b) / span;
      
      console.log(`Point Load Moment calculation for load ${load} kN at position ${position}m:`, {
        load,
        span,
        position,
        formula: 'P·a·b/L',
        a,
        b,
        result: moment
      });
      
      return moment;
    };
    
    // Calculate maximum shear for a UDL
    const calculateUDLShear = (load: number, span: number, start: number, finish: number) => {
      // For full-span UDL: V = wL/2
      // For partial UDL: more complex calculation needed based on position
      
      // Simplified approach for demo
      const isFullSpan = (start <= 0.001) && (finish >= span - 0.001);
      let shear = 0;
      
      if (isFullSpan) {
        shear = (load * span) / 2;
      } else {
        // For partial UDL, use a simplified approximation
        const effectiveLength = finish - start;
        const totalLoad = load * effectiveLength;
        
        // Take worst case - all load contribution to one support
        shear = totalLoad;
      }
      
      console.log(`UDL Shear calculation for load ${load} kN/m from ${start}m to ${finish}m:`, {
        load,
        span,
        start,
        finish,
        isFullSpan,
        formula: isFullSpan ? 'wL/2' : 'approximation for partial UDL',
        result: shear
      });
      
      return shear;
    };
    
    // Calculate maximum shear for a point load
    const calculatePointLoadShear = (load: number, span: number, position: number) => {
      // For point load: V = P·b/L where b = L-a (maximum at support)
      const a = position;
      const b = span - position;
      const shear = load * Math.max(a, b) / span;
      
      console.log(`Point Load Shear calculation for load ${load} kN at position ${position}m:`, {
        load,
        span,
        position,
        formula: 'P·max(a,b)/L',
        a,
        b,
        result: shear
      });
      
      return shear;
    };
    
    // Process each ULS combination from the load combinations file
    ultimateLoadCombinations.ultimateLimitStates.forEach((combo: { name: string; factors: { deadLoad: number; liveLoad: number } }) => {
      console.log(`Calculating ULS combination: ${combo.name}`);
      
      let comboMoment = 0;
      let comboShear = 0;
      
      // Process UDL loads for this combination
      // Safety check - if udlLoads is undefined or null, skip this part
      if (!props.udlLoads || !Array.isArray(props.udlLoads) || props.udlLoads.length === 0) {
        console.log(`No UDL loads to process for combination ${combo.name}`);
      }
      
      // Validate each UDL load before processing
      (props.udlLoads || []).forEach(udl => {
        // Verify this is a valid UDL load object
        if (!udl || typeof udl !== 'object') {
          console.warn('Invalid UDL load object encountered, skipping:', udl);
          return;
        }
        
        // Log the load details
        console.log(`Processing UDL load: id=${udl.id || 'unknown'}, start=${udl.start}m, finish=${udl.finish}m, udlG=${udl.udlG}kN/m, udlQ=${udl.udlQ}kN/m`);
        
        // Apply appropriate load factors based on the combination
        const deadLoadContribution = udl.udlG * combo.factors.deadLoad;
        const liveLoadContribution = udl.udlQ * combo.factors.liveLoad;
        
        // Only calculate for non-zero loads to avoid showing calculations for zero values
        if (deadLoadContribution > 0) {
          // Calculate moment contributions
          const deadMoment = calculateUDLMoment(deadLoadContribution, props.span, udl.start, udl.finish);
          comboMoment += deadMoment;
          
          // Calculate shear contributions
          const deadShear = calculateUDLShear(deadLoadContribution, props.span, udl.start, udl.finish);
          comboShear += deadShear;
        }
        
        if (liveLoadContribution > 0) {
          // Calculate moment contributions
          const liveMoment = calculateUDLMoment(liveLoadContribution, props.span, udl.start, udl.finish);
          comboMoment += liveMoment;
          
          // Calculate shear contributions
          const liveShear = calculateUDLShear(liveLoadContribution, props.span, udl.start, udl.finish);
          comboShear += liveShear;
        }
      });
      
      // Process point loads for this combination
      props.pointLoads.forEach(point => {
        // Apply appropriate load factors based on the combination
        const deadLoadContribution = point.pointG * combo.factors.deadLoad;
        const liveLoadContribution = point.pointQ * combo.factors.liveLoad;
        
        // Only calculate for non-zero loads
        if (deadLoadContribution > 0) {
          // Calculate moment contributions
          const deadMoment = calculatePointLoadMoment(deadLoadContribution, props.span, point.location);
          comboMoment += deadMoment;
          
          // Calculate shear contributions
          const deadShear = calculatePointLoadShear(deadLoadContribution, props.span, point.location);
          comboShear += deadShear;
        }
        
        if (liveLoadContribution > 0) {
          // Calculate moment contributions
          const liveMoment = calculatePointLoadMoment(liveLoadContribution, props.span, point.location);
          comboMoment += liveMoment;
          
          // Calculate shear contributions
          const liveShear = calculatePointLoadShear(liveLoadContribution, props.span, point.location);
          comboShear += liveShear;
        }
      });
      
      // Apply self-weight as a separate UDL if requested
      if (props.fullUDL.includeSelfWeight && selfWeight > 0) {
        const selfWeightContribution = selfWeight * combo.factors.deadLoad;
        const selfWeightMoment = calculateUDLMoment(selfWeightContribution, props.span, 0, props.span);
        const selfWeightShear = calculateUDLShear(selfWeightContribution, props.span, 0, props.span);
        
        comboMoment += selfWeightMoment;
        comboShear += selfWeightShear;
        
        console.log(`Added self-weight contribution of ${selfWeightContribution} kN/m (span 0-${props.span}m) for combination ${combo.name}`);
      }
      
      // Add full UDL contributions if applicable
      if (props.fullUDL.tributaryWidth > 0) {
        
        // Calculate tributary loads
        const fullDeadUDL = props.fullUDL.deadGkPa * props.fullUDL.tributaryWidth * combo.factors.deadLoad;
        const fullLiveUDL = props.fullUDL.liveQkPa * props.fullUDL.tributaryWidth * combo.factors.liveLoad;
        
        // Only add self-weight if explicitly requested via checkbox
        let selfWeightContribution = 0;
        if (props.fullUDL.includeSelfWeight && selfWeight > 0) {
          selfWeightContribution = selfWeight * combo.factors.deadLoad;
          console.log(`Including beam self-weight of ${selfWeight} kN/m with factor ${combo.factors.deadLoad} = ${selfWeightContribution} kN/m for combination ${combo.name}`);
        }
        
        // Combine dead loads (tributary + self-weight)
        const totalDeadUDL = fullDeadUDL + selfWeightContribution;
        
        if (totalDeadUDL > 0) {
          const deadMoment = calculateUDLMoment(totalDeadUDL, props.span, 0, props.span);
          const deadShear = calculateUDLShear(totalDeadUDL, props.span, 0, props.span);
          
          comboMoment += deadMoment;
          comboShear += deadShear;
        }
        
        if (fullLiveUDL > 0) {
          const liveMoment = calculateUDLMoment(fullLiveUDL, props.span, 0, props.span);
          const liveShear = calculateUDLShear(fullLiveUDL, props.span, 0, props.span);
          
          comboMoment += liveMoment;
          comboShear += liveShear;
        }
      }
      
      console.log(`ULS combination ${combo.name} results: Moment = ${comboMoment} kNm, Shear = ${comboShear} kN`);
      
      // Check if this combination controls
      if (comboMoment > calculatedMaxMoment) {
        calculatedMaxMoment = comboMoment;
        controllingMomentCase = combo.name;
      }
      
      if (comboShear > calculatedMaxShear) {
        calculatedMaxShear = comboShear;
        controllingShearCase = combo.name;
      }
    });
    
    console.log('ULS analysis complete - controlling cases:', {
      moment: {
        value: calculatedMaxMoment,
        controllingCase: controllingMomentCase
      },
      shear: {
        value: calculatedMaxShear,
        controllingCase: controllingShearCase
      }
    });
    
    // Calculate deflection due to an applied moment at any position
    const calculateMomentDeflection = (moment: number, span: number, EI: number, position: number) => {
      // Unit conversion factors
      // - moment is in kN·m, need to convert to N·mm (×1000×1000)
      // - span and position are in m, need to convert to mm (×1000)
      // - EI is in N·mm²
      // - result will be in mm
      
      const M = moment * 1000 * 1000; // kN·m to N·mm
      const L = span * 1000; // m to mm
      const pos = position * 1000; // m to mm
      
      // For a moment applied at position 'a' on a simply supported beam:
      // Δmax = (M·a·b²)/(6·E·I·L) for a moment in first half of beam
      // where:
      // - a is the distance from left support to the applied moment
      // - b is L-a (distance from moment to right support)
      
      const a = pos; // distance from left support to moment in mm
      const b = L - a; // distance from moment to right support in mm
      
      // Calculate deflection
      let deflection = 0;
      
      if (position <= span/2) {
        // Moment is in the first half of the beam
        deflection = (M * a * b * b) / (6 * EI * L);
      } else {
        // Moment is in the second half of the beam
        deflection = (M * b * a * a) / (6 * EI * L);
      }
      
      // Calculate position of maximum deflection (approximately)
      let xMax = 0;
      if (position <= span/2) {
        // Moment is in first half of beam
        xMax = (2 * a + b) / 3;
      } else {
        // Moment is in second half of beam
        xMax = (2 * b + a) / 3;
      }
      
      // Convert xMax back to m for reporting
      const xMaxM = xMax / 1000;
      
      console.log(`Moment Deflection calculation for moment ${moment} kN·m at position ${position}m:`, {
        moment: moment,
        M_converted: M,
        span: span,
        L_converted: L,
        position: position,
        pos_converted: pos,
        a: a,
        b: b,
        EI: EI,
        formula: position <= span/2 ? '(M·a·b²)/(6·E·I·L)' : '(M·b·a²)/(6·E·I·L)',
        maxDeflectionAt: xMaxM,
        result: deflection,
        units: 'deflection in mm'
      });
      
      return deflection;
    };

    // Process SLS load combinations for deflection
    console.log('--- SLS ANALYSIS (DEFLECTION) ---');
    
    // Calculate EI (flexural stiffness)
    // E is in MPa (N/mm²), I is in mm⁴, so EI is in N·mm²
    const E = props.memberProperties.elasticModulus; // MPa (N/mm²)
    const I = props.memberProperties.momentOfInertia; // mm⁴
    const EI = E * I; // N·mm²
    
    console.log('Calculated flexural stiffness (EI):', {
      E: E,
      I: I,
      EI: EI,
      units: 'EI is in N·mm²'
    });
    
    // Calculate initial deflection (dead load only)
    let initialDeflection = 0;
    
    // Add UDL dead loads
    props.udlLoads.forEach(udl => {
      if (udl.udlG > 0) {
        const deflection = calculateUDLDeflection(udl.udlG, props.span, udl.start, udl.finish, EI);
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
    
    // Add moment dead loads
    props.moments.forEach(moment => {
      if (moment.momentG > 0) {
        const deflection = calculateMomentDeflection(moment.momentG, props.span, EI, moment.location);
        initialDeflection += deflection;
        console.log(`Added moment dead load deflection at ${moment.location}m: ${deflection} mm, running total: ${initialDeflection} mm`);
      }
    });
    
    // Add full UDL dead load if applicable
    if (props.fullUDL.tributaryWidth > 0 && props.fullUDL.deadGkPa > 0) {
      // Process tributary dead load
      const tributaryDeadLoad = props.fullUDL.deadGkPa * props.fullUDL.tributaryWidth;
      
      if (tributaryDeadLoad > 0) {
        const deflection = calculateUDLDeflection(tributaryDeadLoad, props.span, 0, props.span, EI);
        initialDeflection += deflection;
        console.log(`Added full UDL dead load deflection: ${deflection} mm, running total: ${initialDeflection} mm`);
      }
    }
    
    // Add self-weight separately if requested
    if (props.fullUDL.includeSelfWeight && selfWeight > 0) {
      console.log(`Including beam self-weight of ${selfWeight} kN/m in initial deflection calculation`);
      const deflection = calculateUDLDeflection(selfWeight, props.span, 0, props.span, EI);
      initialDeflection += deflection;
      console.log(`Added beam self-weight deflection: ${deflection} mm, running total: ${initialDeflection} mm`);
    }
    
    // Calculate short-term deflection (short-term live only: wsQ)
    let shortTermDeflection = 0;
    
    console.log(`Short-term deflection calculation using ws = ${props.ws} (short-term factor)`);
    
    // Add UDL live loads (with short-term factor)
    props.udlLoads.forEach(udl => {
      if (udl.udlQ > 0) {
        const deflection = calculateUDLDeflection(udl.udlQ * props.ws, props.span, udl.start, udl.finish, EI);
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
    
    // Add moment live loads (with short-term factor)
    props.moments.forEach(moment => {
      if (moment.momentQ > 0) {
        const deflection = calculateMomentDeflection(moment.momentQ * props.ws, props.span, EI, moment.location);
        shortTermDeflection += deflection;
        console.log(`Added moment live load deflection at ${moment.location}m (short-term): ${deflection} mm, running total: ${shortTermDeflection} mm`);
      }
    });
    
    // Add full UDL live load if applicable (with short-term factor)
    if (props.fullUDL.tributaryWidth > 0 && props.fullUDL.liveQkPa > 0) {
      const fullUDLLiveLoad = props.fullUDL.liveQkPa * props.fullUDL.tributaryWidth * props.ws;
      const deflection = calculateUDLDeflection(fullUDLLiveLoad, props.span, 0, props.span, EI);
      shortTermDeflection += deflection;
      console.log(`Added full UDL live load deflection (short-term): ${deflection} mm, running total: ${shortTermDeflection} mm`);
    }
    
    // Calculate long-term deflection (dead with creep + long-term live)
    // For dead load, apply creep factor J2
    // Determine proper J2 value based on material
    let effectiveJ2 = props.J2;
    
    // Steel has no creep, so J2 should be 1.0 for steel
    if (props.memberProperties && props.memberProperties.material && 
        props.memberProperties.material.toLowerCase().includes('steel')) {
      if (effectiveJ2 !== 1.0) {
        console.log(`Material is steel, overriding J2 from ${effectiveJ2} to 1.0 (steel has no creep)`);
      }
      effectiveJ2 = 1.0;
    } else {
      // For timber, use the specified J2 from the catalog or the default
      console.log(`Using J2 = ${effectiveJ2} for ${props.memberProperties?.material || 'unknown material'}`);
    }
    
    let longTermDeflection = initialDeflection * effectiveJ2;
    console.log(`Long-term dead load deflection with creep: ${initialDeflection} mm * ${effectiveJ2} = ${longTermDeflection} mm`);
    
    console.log(`Long-term deflection calculation using J2 = ${effectiveJ2} (creep factor) and wl = ${props.wl} (long-term factor)`);
    
    // Add UDL live loads (with long-term factor and creep factor)
    props.udlLoads.forEach(udl => {
      if (udl.udlQ > 0) {
        const liveLoadWithFactors = udl.udlQ * props.wl * effectiveJ2; // Apply both wl and J2
        const deflection = calculateUDLDeflection(liveLoadWithFactors, props.span, udl.start, udl.finish, EI);
        longTermDeflection += deflection;
        console.log(`Added UDL live load deflection from ${udl.start}-${udl.finish}m (long-term): ${udl.udlQ} kN/m × ${props.wl} × ${effectiveJ2} = ${liveLoadWithFactors} kN/m, deflection: ${deflection} mm, running total: ${longTermDeflection} mm`);
      }
    });
    
    // Add point live loads (with long-term factor and creep factor)
    props.pointLoads.forEach(point => {
      if (point.pointQ > 0) {
        const liveLoadWithFactors = point.pointQ * props.wl * effectiveJ2; // Apply both wl and J2
        const deflection = calculatePointLoadDeflection(liveLoadWithFactors, props.span, EI, point.location);
        longTermDeflection += deflection;
        console.log(`Added point live load deflection at ${point.location}m (long-term): ${point.pointQ} kN × ${props.wl} × ${effectiveJ2} = ${liveLoadWithFactors} kN, deflection: ${deflection} mm, running total: ${longTermDeflection} mm`);
      }
    });
    
    // Add moment live loads (with long-term factor and creep factor)
    props.moments.forEach(moment => {
      if (moment.momentQ > 0) {
        const liveLoadWithFactors = moment.momentQ * props.wl * effectiveJ2; // Apply both wl and J2
        const deflection = calculateMomentDeflection(liveLoadWithFactors, props.span, EI, moment.location);
        longTermDeflection += deflection;
        console.log(`Added moment live load deflection at ${moment.location}m (long-term): ${moment.momentQ} kNm × ${props.wl} × ${effectiveJ2} = ${liveLoadWithFactors} kNm, deflection: ${deflection} mm, running total: ${longTermDeflection} mm`);
      }
    });
    
    // Add full UDL live load if applicable (with long-term factor)
    if (props.fullUDL.tributaryWidth > 0 && props.fullUDL.liveQkPa > 0) {
      const fullUDLLiveLoad = props.fullUDL.liveQkPa * props.fullUDL.tributaryWidth * props.wl;
      const deflection = calculateUDLDeflection(fullUDLLiveLoad, props.span, 0, props.span, EI);
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
    
    console.log('==== ANALYSIS COMPLETE ====');
    
    // Set the results
    setResults({
      maxInitialDeflection: initialDeflection,
      maxShortDeflection: shortTermDeflection,
      maxLongDeflection: longTermDeflection,
      maxMoment: calculatedMaxMoment,
      maxShear: calculatedMaxShear,
      controllingMomentCase,
      controllingShearCase
    });
    
  }, [props.span, props.members, props.ws, props.wl, props.J2, props.udlLoads, 
      props.pointLoads, props.moments, props.fullUDL, props.memberProperties]);
  
  return results;
}

export default useBeamAnalysis;
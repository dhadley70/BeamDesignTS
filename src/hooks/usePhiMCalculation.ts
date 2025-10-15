import { useMemo } from 'react';

// Define types for steel and timber section members
export interface SteelSectionMember {
  designation: string;
  depth_mm: number;
  flange_mm: number;
  mass_kg_m: number;
  I_m4: number;
  Z_m3: number;
  tf_mm?: number; // Flange thickness
  tw_mm?: number; // Web thickness
  area_mm2?: number; // Cross-sectional area
}

export interface TimberSectionMember {
  designation: string;
  depth_mm: number;
  width_mm: number;
  mass_kg_m: number;
  I_m4: number;
  Z_m3: number;
  grade: string;
  E_GPa: number;
  G_GPa: number | null;
  fb_MPa: number; // Bending strength
  fs_MPa: number; // Shear strength
}

export type SectionMember = SteelSectionMember | TimberSectionMember;

// Design capacity results interface
export interface DesignCapacityResult {
  phiM_kNm: number;
  phiV_kN: number;
  momentDetails: string;
  shearDetails: string;
}

/**
 * Custom hook to calculate the design capacities (phiM, phiV) for steel and timber sections
 * @param member The section member object
 * @param sectionType The type of section ('UB', 'UC', 'PFC', or timber grade)
 * @returns Object containing design capacities and calculation details
 */
export function usePhiMCalculation(
  member: SectionMember | null, 
  sectionType: string | null
) {
  return useMemo(() => {
    if (!member || !sectionType) {
      return {
        phiM_kNm: 0,
        phiV_kN: 0,
        momentDetails: 'No section selected',
        shearDetails: 'No section selected'
      };
    }

    // Steel calculation
    if (['UB', 'UC', 'PFC'].includes(sectionType)) {
      const steelMember = member as SteelSectionMember;
      const phi = 0.9; // Capacity reduction factor for steel
      const fy_MPa = 300; // Yield strength in MPa (default to 300 MPa)
      const fv_MPa = 170; // Shear strength (0.6*fy) in MPa
      
      // Check if we have a plastic section modulus value
      if (!steelMember.Z_m3) {
        return {
          phiM_kNm: 0,
          phiV_kN: 0,
          momentDetails: 'Missing section modulus data',
          shearDetails: 'Missing section data'
        };
      }
      
      // Calculate design moment capacity
      // phiM = phi * Z * fy
      // Convert Z from m³ to mm³ (multiply by 10^9) and fy from MPa to N/mm² (no conversion needed)
      // Then convert from N·mm to kN·m (divide by 10^6)
      const Z_mm3 = steelMember.Z_m3 * 1e9;
      const phiM_kNm = phi * Z_mm3 * fy_MPa / 1e6;
      
      // Calculate design shear capacity for steel sections
      // For I-sections and channels, use the web area: depth * web thickness
      // phiV = phi * 0.6 * fy * Aw
      let phiV_kN = 0;
      let shearDetails = '';
      
      if (steelMember.tw_mm && steelMember.depth_mm) {
        // Calculate web area (effective shear area)
        const webArea_mm2 = steelMember.depth_mm * steelMember.tw_mm;
        // Calculate shear capacity
        phiV_kN = phi * fv_MPa * webArea_mm2 / 1000; // Convert N to kN
        shearDetails = `φ = ${phi}, fv = ${fv_MPa} MPa, Aw = ${webArea_mm2.toFixed(0)} mm²`;
      } else {
        shearDetails = 'Missing web thickness data for shear calculation';
      }

      return {
        phiM_kNm: Number(phiM_kNm.toFixed(1)),
        phiV_kN: Number(phiV_kN.toFixed(1)),
        momentDetails: `φ = ${phi}, fy = ${fy_MPa} MPa, Z = ${steelMember.Z_m3.toExponential(3)} m³`,
        shearDetails: shearDetails
      };
    } 
    // Timber calculation
    else {
      const timberMember = member as TimberSectionMember;
      const phi = 0.6; // Capacity reduction factor for timber
      
      if (!timberMember.fb_MPa) {
        return {
          phiM_kNm: 0,
          phiV_kN: 0,
          momentDetails: 'Missing bending strength data',
          shearDetails: 'Missing shear strength data'
        };
      }
      
      // Calculate section modulus Z if not available in the data
      // For rectangular sections, Z = bd²/6 where b is width and d is depth
      // Convert from mm³ to m³ by dividing by 10^9
      let Z_m3: number;
      let Z_calculation = '';
      
      if (timberMember.Z_m3) {
        // Use provided Z value if available
        Z_m3 = timberMember.Z_m3;
        Z_calculation = `Z = ${Z_m3.toExponential(3)} m³`;
      } else if (timberMember.width_mm && timberMember.depth_mm) {
        // Calculate Z from dimensions for rectangular section
        const width_m = timberMember.width_mm / 1000;
        const depth_m = timberMember.depth_mm / 1000;
        Z_m3 = (width_m * Math.pow(depth_m, 2)) / 6;
        Z_calculation = `Z = bd²/6 = ${timberMember.width_mm}×${timberMember.depth_mm}²/6 = ${Z_m3.toExponential(3)} m³`;
      } else {
        return {
          phiM_kNm: 0,
          phiV_kN: 0,
          momentDetails: 'Insufficient section data to calculate Z',
          shearDetails: 'Insufficient section data'
        };
      }
      
      // For timber, we use the bending strength from the member properties (fb_MPa)
      // phiM = phi * Z * fb
      // Convert Z from m³ to mm³ (multiply by 10^9) and fb is already in MPa
      // Then convert from N·mm to kN·m (divide by 10^6)
      const Z_mm3 = Z_m3 * 1e9;
      const phiM_kNm = phi * Z_mm3 * timberMember.fb_MPa / 1e6;
      
      // Calculate design shear capacity for timber sections
      // For timber, φV = φ × fs × (2/3) × A
      // Where A is the cross-sectional area and fs is the shear strength
      let phiV_kN = 0;
      let shearDetails = '';
      
      if (timberMember.width_mm && timberMember.depth_mm && timberMember.fs_MPa) {
        // Calculate cross-sectional area in mm²
        const area_mm2 = timberMember.width_mm * timberMember.depth_mm;
        
        // Calculate shear capacity
        // The factor 2/3 is applied to account for the effective shear area
        phiV_kN = phi * timberMember.fs_MPa * (2/3) * area_mm2 / 1000; // Convert N to kN
        
        shearDetails = `φ = ${phi}, fs = ${timberMember.fs_MPa} MPa, A = ${area_mm2} mm²`;
      } else {
        shearDetails = 'Missing data for shear calculation';
      }

      return {
        phiM_kNm: Number(phiM_kNm.toFixed(1)),
        phiV_kN: Number(phiV_kN.toFixed(1)),
        momentDetails: `φ = ${phi}, fb = ${timberMember.fb_MPa} MPa, ${Z_calculation}`,
        shearDetails: shearDetails
      };
    }
  }, [member, sectionType]);
}
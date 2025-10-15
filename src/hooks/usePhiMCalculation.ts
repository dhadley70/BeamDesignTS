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

/**
 * Custom hook to calculate the design moment capacity (phiM) for steel and timber sections
 * @param member The section member object
 * @param sectionType The type of section ('UB', 'UC', 'PFC', or timber grade)
 * @returns Object containing phiM value in kNm and calculation details
 */
export function usePhiMCalculation(
  member: SectionMember | null, 
  sectionType: string | null
) {
  return useMemo(() => {
    if (!member || !sectionType) {
      return {
        phiM_kNm: 0,
        details: 'No section selected'
      };
    }

    // Steel calculation
    if (['UB', 'UC', 'PFC'].includes(sectionType)) {
      const steelMember = member as SteelSectionMember;
      const phi = 0.9; // Capacity reduction factor for steel
      const fy_MPa = 300; // Yield strength in MPa (default to 300 MPa)
      
      // Calculate design moment capacity
      // phiM = phi * Z * fy
      // Convert Z from m³ to mm³ (multiply by 10^9) and fy from MPa to N/mm² (no conversion needed)
      // Then convert from N·mm to kN·m (divide by 10^6)
      const Z_mm3 = steelMember.Z_m3 * 1e9;
      const phiM_kNm = phi * Z_mm3 * fy_MPa / 1e6;

      return {
        phiM_kNm: Number(phiM_kNm.toFixed(1)),
        details: `φ = ${phi}, fy = ${fy_MPa} MPa, Z = ${steelMember.Z_m3.toExponential(3)} m³`
      };
    } 
    // Timber calculation
    else {
      const timberMember = member as TimberSectionMember;
      const phi = 0.6; // Capacity reduction factor for timber
      
      if (!timberMember.fb_MPa) {
        return {
          phiM_kNm: 0,
          details: 'Missing bending strength data'
        };
      }
      
      // For timber, we use the bending strength from the member properties (fb_MPa)
      // phiM = phi * Z * fb
      // Convert Z from m³ to mm³ (multiply by 10^9) and fb is already in MPa
      // Then convert from N·mm to kN·m (divide by 10^6)
      const Z_mm3 = timberMember.Z_m3 * 1e9;
      const phiM_kNm = phi * Z_mm3 * timberMember.fb_MPa / 1e6;

      return {
        phiM_kNm: Number(phiM_kNm.toFixed(1)),
        details: `φ = ${phi}, fb = ${timberMember.fb_MPa} MPa, Z = ${timberMember.Z_m3.toExponential(3)} m³`
      };
    }
  }, [member, sectionType]);
}
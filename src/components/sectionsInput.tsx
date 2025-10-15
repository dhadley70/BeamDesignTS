import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PropertyCell } from "@/components/ui/property-cell"
import useLocalStorage from "@/hooks/useLocalStorage"
import { usePhiMCalculation } from "@/hooks/usePhiMCalculation"
import type { SectionMember as PhiMSectionMember } from "@/hooks/usePhiMCalculation"
import steelSections from "@/data/steel_sections_catalog.json"
import timberSections from "@/data/timber_catalog.json"
import type { GeneralInputs } from "@/components/generalInputs"

// Define the types of sections available
const sectionTypes = [
  // Steel sections
  { value: "UB", label: "UB - Universal Beam", group: "Steel" },
  { value: "UC", label: "UC - Universal Column", group: "Steel" },
  { value: "PFC", label: "PFC - Parallel Flange Channel", group: "Steel" },

  // Timber sections - Laminated Veneer Lumber
  { value: "LVL13", label: "LVL 13", group: "Timber-LVL" },

  // Timber sections - Machine Graded Pine
  { value: "MGP10", label: "MGP10", group: "Timber-MGP" },
  { value: "MGP12", label: "MGP12", group: "Timber-MGP" },
  { value: "MGP15", label: "MGP15", group: "Timber-MGP" },

  // Timber sections - F-Grade
  { value: "F7", label: "F7", group: "Timber-F" },
  { value: "F8", label: "F8", group: "Timber-F" },
  { value: "F11", label: "F11", group: "Timber-F" },
  { value: "F14", label: "F14", group: "Timber-F" },
  { value: "F17", label: "F17", group: "Timber-F" },
  { value: "F22", label: "F22", group: "Timber-F" },
  { value: "F27", label: "F27", group: "Timber-F" },

  // Timber sections - Glulam
  { value: "GL8", label: "GL8", group: "Timber-GL" },
  { value: "GL13", label: "GL13", group: "Timber-GL" },
  { value: "GL17", label: "GL17", group: "Timber-GL" },
]

export interface SectionsInputProps {
  // Props will be added later as needed
}

// Member interface - reusing most of the interface from the hook but keeping compatibility
type SectionMember = PhiMSectionMember & {
  [key: string]: any; // For other properties that may vary
}

export function SectionsInputCard() {
  // Store the selected section type in local storage
  const [selectedSectionType, setSelectedSectionType] = useLocalStorage<string>(
    'beamSectionType',
    'UB' // Default selection
  )

  // Store the selected member in local storage
  const [selectedMember, setSelectedMember] = useLocalStorage<string>(
    'beamSelectedMember',
    '' // Default empty
  )

  // Read generalInputs from localStorage to get the number of members
  const [generalInputs] = useLocalStorage<GeneralInputs>(
    'generalInputs',
    { span: 3.0, members: 1, usage: 'Normal', lateralRestraint: 'Lateral Restraint', ws: 2, wl: 3 }
  )

  // State to force a re-render when needed
  const [updateCounter, setUpdateCounter] = useState(0);

  // State for available members based on selected section type
  const [availableMembers, setAvailableMembers] = useState<SectionMember[]>([])

  // Handle section type change
  const handleSectionTypeChange = (value: string) => {
    setSelectedSectionType(value)
    // The selected member will be updated in the useEffect
  }

  // Handle member selection change
  const handleMemberChange = (value: string) => {
    setSelectedMember(value)
  }

  // Update available members when section type changes
  useEffect(() => {
    const fetchMembers = () => {
      let members: SectionMember[] = []

      // Steel sections (UB, UC, PFC)
      if (['UB', 'UC', 'PFC'].includes(selectedSectionType)) {
        members = steelSections.sections
          .filter(section => section.series === selectedSectionType)
          .map(section => ({
            designation: section.designation,
            depth_mm: section.depth_mm,
            flange_mm: section.flange_mm,
            mass_kg_m: section.mass_kg_m,
            I_m4: section.I_m4,
            Z_m3: section.Z_m3,
            tf_mm: section.tf_mm,
            tw_mm: section.tw_mm
          }))
      }
      // Timber sections
      else {
        // Find the grade that matches the selected section type
        const grade = timberSections.grades.find(g => {
          // Match different timber types
          if (selectedSectionType === 'LVL13' && g.grade === 'LVL 13') return true;
          if (selectedSectionType === 'MGP10' && g.grade === 'MGP10') return true;
          if (selectedSectionType === 'MGP12' && g.grade === 'MGP12') return true;
          if (selectedSectionType === 'MGP15' && g.grade === 'MGP15') return true;
          if (selectedSectionType === 'F7' && g.grade === 'F7') return true;
          if (selectedSectionType === 'F8' && g.grade === 'F8') return true;
          if (selectedSectionType === 'F11' && g.grade === 'F11') return true;
          if (selectedSectionType === 'F14' && g.grade === 'F14') return true;
          if (selectedSectionType === 'F17' && g.grade === 'F17') return true;
          if (selectedSectionType === 'F22' && g.grade === 'F22') return true;
          if (selectedSectionType === 'F27' && g.grade === 'F27') return true;
          if (selectedSectionType === 'GL8' && g.grade === 'GL8') return true;
          if (selectedSectionType === 'GL13' && g.grade === 'GL13') return true;
          if (selectedSectionType === 'GL17' && g.grade === 'GL17') return true;

          return false;
        });

        // If grade found, use its sizes as members
        if (grade && grade.sizes) {
          members = grade.sizes.map(size => ({
            designation: size.designation,
            depth_mm: size.depth_mm,
            width_mm: size.width_mm,
            mass_kg_m: size.mass_kg_m,
            I_m4: size.I_m4,
            Z_m3: size.Z_m3,
            // Store grade properties in each member
            grade: grade.grade,
            E_GPa: grade.E_GPa,
            G_GPa: grade.G_GPa,
            fb_MPa: grade.fb_MPa,
            fs_MPa: grade.fs_MPa
          }));
        }
      }

      setAvailableMembers(members)
    }

    fetchMembers();
  }, [selectedSectionType]);

  // Automatically select the first member when available members change
  useEffect(() => {
    if (availableMembers.length > 0 && (!selectedMember || !availableMembers.some(m => m.designation === selectedMember))) {
      // Set the first available member as the selected one
      setSelectedMember(availableMembers[0].designation);
    }
  }, [availableMembers, selectedMember]);

  // Listen for changes in generalInputs.members
  useEffect(() => {
    // This will trigger a re-render with the updated member count
    console.log('generalInputs.members changed in sectionsInput:', generalInputs.members);
    // Force a re-render by incrementing the counter
    setUpdateCounter(prev => prev + 1);
  }, [generalInputs.members]);

  // Get the displayed member for the phiM calculation
  const displayedMember = selectedMember ?
    availableMembers.find(m => m.designation === selectedMember) || null :
    null;

  // Calculate built-up section properties when members > 1
  const calculateBuiltUpProperties = (member: SectionMember | null, numMembers: number) => {
    if (!member) return null;

    // For a built-up section in parallel (side by side), properties scale as follows:
    // - Mass: scales directly with number of members
    // - Moment of inertia (I): scales directly with number of members
    // - Section modulus (Z): scales directly with number of members
    // - Width/flange width: scales directly with number of members for timber/steel

    const builtUpMember = { ...member };

    // Common properties for all section types
    builtUpMember.mass_kg_m = member.mass_kg_m * numMembers;
    builtUpMember.I_m4 = member.I_m4 * numMembers;
    builtUpMember.Z_m3 = (member.Z_m3 || 0) * numMembers;

    // Steel specific properties
    if ('flange_mm' in member) {
      builtUpMember.flange_mm = member.flange_mm * numMembers;
    }

    // Timber specific properties
    if ('width_mm' in member) {
      builtUpMember.width_mm = member.width_mm * numMembers;
    }

    return builtUpMember;
  };

  // Get member count from generalInputs and also directly from localStorage as fallback
  let memberCount = generalInputs.members || 1;

  // Try to get the most up-to-date value directly from localStorage
  try {
    const rawGeneralInputs = localStorage.getItem('generalInputs');
    if (rawGeneralInputs) {
      const parsedGeneralInputs = JSON.parse(rawGeneralInputs);
      if (parsedGeneralInputs.members && typeof parsedGeneralInputs.members === 'number') {
        memberCount = parsedGeneralInputs.members;
      }
    }
  } catch (error) {
    console.error('Error reading generalInputs from localStorage:', error);
  }

  // Add debug logs
  console.log('Member count from generalInputs:', memberCount);
  console.log('General inputs:', generalInputs);
  console.log('Update counter:', updateCounter); // Log to show re-renders

  // Get either single member or built-up properties based on member count
  const effectiveMember = memberCount > 1 && displayedMember
    ? calculateBuiltUpProperties(displayedMember, memberCount)
    : displayedMember;

  // Log effective member for debugging
  console.log('Effective member:', effectiveMember);

  // Calculate phiM for the displayed member
  const designCapacity = usePhiMCalculation(effectiveMember, selectedSectionType);
  
  // Store the effective member with design capacities in localStorage for other components
  useEffect(() => {
    if (effectiveMember && designCapacity) {
      // Create combined object with all properties needed for beam analysis
      const selectedSectionData = {
        ...effectiveMember,
        phiM: designCapacity.phiM_kNm,
        phiV: designCapacity.phiV_kN,
        // Add E in MPa for beam analysis calculations
        E: effectiveMember.E_GPa ? effectiveMember.E_GPa * 1000 : 200000, // Default to 200 GPa for steel if not specified
        material: selectedSectionType.startsWith('Timber') ? 'Timber' : 'Steel',
        depth: effectiveMember.depth_mm,
        width: effectiveMember.flange_mm || effectiveMember.width_mm,
        momentOfInertia: effectiveMember.I_m4 * 1e12, // Convert from m⁴ to mm⁴
        J2: effectiveMember.J2 || 2.0 // Default creep factor if not specified
      };
      
      localStorage.setItem('selectedSection', JSON.stringify(selectedSectionData));
      
      // Dispatch a custom event to notify other components about the change
      const event = new Event('app-storage-change');
      window.dispatchEvent(event);
    } else {
      localStorage.removeItem('selectedSection');
      
      // Dispatch a custom event to notify other components about the change
      const event = new Event('app-storage-change');
      window.dispatchEvent(event);
    }
  }, [effectiveMember, designCapacity, selectedSectionType]);

  return (
    <Card className="mt-6 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
      <CardHeader>
        <CardTitle className="text-xl">Sections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="section-type" className="text-sm font-medium">
                Section Type
              </label>
              <Select
                value={selectedSectionType}
                onValueChange={handleSectionTypeChange}
              >
                <SelectTrigger className="w-full bg-[var(--card)] border-[color:var(--border)]">
                  <SelectValue placeholder="Select section type" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border-[color:var(--border)] text-[var(--text)]">
                  <SelectGroup>
                    <SelectLabel>Steel</SelectLabel>
                    {sectionTypes
                      .filter(type => type.group === "Steel")
                      .map(type => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]"
                        >
                          {type.label}
                        </SelectItem>
                      ))
                    }
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel>Timber - LVL</SelectLabel>
                    {sectionTypes
                      .filter(type => type.group === "Timber-LVL")
                      .map(type => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]"
                        >
                          {type.label}
                        </SelectItem>
                      ))
                    }
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel>Timber - MGP</SelectLabel>
                    {sectionTypes
                      .filter(type => type.group === "Timber-MGP")
                      .map(type => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]"
                        >
                          {type.label}
                        </SelectItem>
                      ))
                    }
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel>Timber - F Grade</SelectLabel>
                    {sectionTypes
                      .filter(type => type.group === "Timber-F")
                      .map(type => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]"
                        >
                          {type.label}
                        </SelectItem>
                      ))
                    }
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel>Timber - Glulam</SelectLabel>
                    {sectionTypes
                      .filter(type => type.group === "Timber-GL")
                      .map(type => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]"
                        >
                          {type.label}
                        </SelectItem>
                      ))
                    }
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="member" className="text-sm font-medium">
                Member
              </label>
              <Select
                value={selectedMember}
                onValueChange={handleMemberChange}
                disabled={availableMembers.length === 0}
              >
                <SelectTrigger className="w-full bg-[var(--card)] border-[color:var(--border)]">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border-[color:var(--border)] text-[var(--text)]">
                  {availableMembers.map((member) => (
                    <SelectItem
                      key={member.designation}
                      value={member.designation}
                      className="hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]"
                    >
                      {member.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {displayedMember && (
            <div className="mt-4 p-4 rounded-md border border-[color:var(--border)] ">
              <h4 className="text-md font-medium mb-2 text-[var(--text)]">
                Individual Member Properties
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2 md:col-span-4">
                  {/* Steel section properties */}
                  {['UB', 'UC', 'PFC'].includes(selectedSectionType) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <PropertyCell label="Depth" value={`${displayedMember.depth_mm} mm`} />
                      <PropertyCell label="Flange Width" value={`${displayedMember.flange_mm} mm`} className="label:text-[var(--text)] value:text-[var(--text)]" />
                      <PropertyCell label="Mass" value={`${displayedMember.mass_kg_m} kg/m`} />
                      <PropertyCell label="E" value="200 GPa" className="label:text-[var(--text)] value:text-[var(--text)]" />
                      <PropertyCell label="I" value={`${displayedMember.I_m4 ? (displayedMember.I_m4 * 1e12 / 1e6).toFixed(1) : 'N/A'} M mm⁴`} />
                      {/* Design capacities */}
                      <PropertyCell
                        label="Design Moment Capacity"
                        value={
                          <div>
                            <div className="text-[var(--text)]">{`${designCapacity.phiM_kNm} kN·m`}</div>
                            <div className="text-xs mt-1 text-[var(--text)]">{designCapacity.momentDetails}</div>
                          </div>
                        }
                        className="col-span-1 label:text-[var(--text)]"
                      />
                      <PropertyCell
                        label="Design Shear Capacity"
                        value={
                          <div>
                            <div className="text-[var(--text)]">{`${designCapacity.phiV_kN} kN`}</div>
                            <div className="text-xs mt-1 text-[var(--text)]">{designCapacity.shearDetails}</div>
                          </div>
                        }
                        className="col-span-1 label:text-[var(--text)]"
                      />
                    </div>
                  )}

                  {/* Timber section properties */}
                  {!['UB', 'UC', 'PFC'].includes(selectedSectionType) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <PropertyCell label="Depth" value={`${displayedMember.depth_mm} mm`} />
                      <PropertyCell label="Width" value={`${displayedMember.width_mm} mm`} className="label:text-[var(--text)] value:text-[var(--text)]" />
                      <PropertyCell label="Mass" value={`${displayedMember.mass_kg_m} kg/m`} />
                      <PropertyCell label="E" value={`${displayedMember.E_GPa} GPa`} />
                      <PropertyCell label="I" value={`${displayedMember.I_m4 ? (displayedMember.I_m4 * 1e12 / 1e6).toFixed(1) : 'N/A'} M mm⁴`} />

                      {/* Design capacities */}
                      <PropertyCell
                        label="Design Moment Capacity"
                        value={
                          <div>
                            <div className="text-[var(--text)]">{`${designCapacity.phiM_kNm} kN·m`}</div>
                            <div className="text-xs mt-1 text-[var(--text)]">{designCapacity.momentDetails}</div>
                          </div>
                        }
                        className="col-span-1 label:text-[var(--text)]"
                      />
                      <PropertyCell
                        label="Design Shear Capacity"
                        value={
                          <div>
                            <div className="text-[var(--text)]">{`${designCapacity.phiV_kN} kN`}</div>
                            <div className="text-xs mt-1 text-[var(--text)]">{designCapacity.shearDetails}</div>
                          </div>
                        }
                        className="col-span-1 label:text-[var(--text)]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dedicated Built-up Section Card */}
          {displayedMember && memberCount > 1 && (
            <div className="mt-4 p-4 rounded-md border border-[var(--accent)] bg-[var(--bg)]/50">
              <h4 className="text-md font-medium mb-2 text-[var(--text)]">
                Built-up Section Properties ({memberCount} members)
              </h4>
              <div className="text-xs italic mb-3 text-[var(--text)] border-l-2 border-[var(--accent)] pl-2">
                Properties for {memberCount} members arranged side by side.
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2 md:col-span-4 mb-1">
                  <div className="text-sm font-medium mb-2 text-[var(--text)]">Built-up Configuration</div>
                  <PropertyCell
                    label="Member Arrangement"
                    value={`${memberCount} × ${displayedMember.designation} in parallel`}
                    className="label:text-[var(--text)] value:text-[var(--text)]"
                  />
                </div>

                <div className="col-span-2 md:col-span-4 mt-2 mb-1 ">
                  <div className="text-sm font-medium mb-2 text-[var(--text)]">Geometry</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <PropertyCell
                      label="Depth"
                      value={`${displayedMember.depth_mm} mm`}
                    />

                    {/* Section-specific properties */}
                    {['UB', 'UC', 'PFC'].includes(selectedSectionType) && (
                      <PropertyCell
                        label="Total Flange Width"
                        value={`${(displayedMember.flange_mm * memberCount)} mm`}
                      />
                    )}

                    {!['UB', 'UC', 'PFC'].includes(selectedSectionType) && (
                      <PropertyCell
                        label="Total Width"
                        value={`${(displayedMember.width_mm * memberCount)} mm`}
                      />
                    )}
                  </div>
                </div>

                <div className="col-span-2 md:col-span-4 mt-2 mb-1">
                  <div className="text-sm font-medium mb-2 text-[var(--text)]">Section Properties</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <PropertyCell
                      label="Total Mass"
                      value={`${(displayedMember.mass_kg_m * memberCount).toFixed(1)} kg/m`}
                    />

                    {displayedMember.Z_m3 && (
                      <PropertyCell
                        label="Total Z"
                        value={`${(displayedMember.Z_m3 * memberCount * 1e9 / 1e3).toFixed(1)} k mm³`}
                        className="label:text-[var(--text)] value:text-[var(--text)]"
                      />
                    )}
                  </div>
                </div>

                <div className="col-span-2 md:col-span-4 mt-2">
                  <div className="text-sm font-medium mb-2 text-[var(--text)]">Capacities</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <PropertyCell
                      label="Total I"
                      value={`${(displayedMember.I_m4 * memberCount * 1e12 / 1e6).toFixed(1)} M mm⁴`}
                    />
                    <PropertyCell
                      label="Total Design Moment Capacity"
                      value={`${designCapacity.phiM_kNm} kN·m`}
                    />
                    <PropertyCell
                      label="Total Design Shear Capacity"
                      value={`${designCapacity.phiV_kN} kN`}
                    />

                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
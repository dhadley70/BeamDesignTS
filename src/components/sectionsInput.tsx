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
import steelSections from "@/data/steel_sections_catalog.json"
import timberSections from "@/data/timber_catalog.json"

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

// Member interface
interface SectionMember {
  designation: string;
  depth_mm: number;
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
          
          {selectedMember && (
            <div className="mt-4 p-4 rounded-md border border-[color:var(--border)] bg-[var(--muted)]/10">
              <h4 className="text-md font-medium mb-2">Section Properties</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableMembers
                  .filter(m => m.designation === selectedMember)
                  .map(member => (
                    <div key={member.designation} className="col-span-2 md:col-span-4">
                      {/* Steel section properties */}
                      {['UB', 'UC', 'PFC'].includes(selectedSectionType) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <PropertyCell label="Depth" value={`${member.depth_mm} mm`} />
                          <PropertyCell label="Flange Width" value={`${member.flange_mm} mm`} />
                          <PropertyCell label="Mass" value={`${member.mass_kg_m} kg/m`} />
                          <PropertyCell label="E" value="200 GPa" />
                          <PropertyCell label="I" value={`${member.I_m4?.toExponential(2) || 'N/A'} m⁴`} />
                        </div>
                      )}
                      
                      {/* Timber section properties */}
                      {!['UB', 'UC', 'PFC'].includes(selectedSectionType) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <PropertyCell label="Depth" value={`${member.depth_mm} mm`} />
                          <PropertyCell label="Width" value={`${member.width_mm} mm`} />
                          <PropertyCell label="Mass" value={`${member.mass_kg_m} kg/m`} />
                          <PropertyCell 
                            label="E" 
                            value={
                              (() => {
                                // Find the grade data for the current section type
                                const grade = timberSections.grades.find(g => {
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
                                
                                return grade?.E_GPa ? `${grade.E_GPa} GPa` : 'N/A';
                              })()
                            } 
                          />
                          <PropertyCell label="I" value={`${member.I_m4?.toExponential(2) || 'N/A'} m⁴`} />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
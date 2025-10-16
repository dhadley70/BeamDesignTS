import React, { useEffect, useRef } from 'react';
import { createSectionChangeEvent, triggerEnteringLoads, triggerLeavingLoads } from '@/lib/navigationEvents';

// Define the section names as a type for better type safety
export type SectionName = 'project' | 'general' | 'deflection' | 'loads' | 'sections' | 'design' | 'saveLoad';

interface SectionNavigatorProps {
  currentSection: SectionName;
  children: React.ReactNode;
}

/**
 * This component wraps sections of the app and emits navigation events
 * when the user navigates between sections.
 */
export const SectionNavigator: React.FC<SectionNavigatorProps> = ({
  currentSection,
  children
}) => {
  // Store previous section for comparison
  const prevSectionRef = useRef<SectionName | null>(null);
  
  useEffect(() => {
    // Skip on initial render
    if (prevSectionRef.current === null) {
      prevSectionRef.current = currentSection;
      return;
    }
    
    const fromSection = prevSectionRef.current;
    const toSection = currentSection;
    
    // Don't trigger if no actual navigation happened
    if (fromSection === toSection) return;
    
    // Create and dispatch the navigation event
    createSectionChangeEvent(fromSection, toSection);
    
    // Special case handling for loads tab
    if (fromSection === 'loads' && toSection !== 'loads') {
      triggerLeavingLoads(toSection);
    } else if (fromSection !== 'loads' && toSection === 'loads') {
      triggerEnteringLoads(fromSection);
    }
    
    // Update the ref with current section
    prevSectionRef.current = currentSection;
  }, [currentSection]);
  
  return <>{children}</>;
};
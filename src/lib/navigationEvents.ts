/**
 * Simple event system to track navigation between different sections of the application
 * This can be used regardless of whether the app uses tabs, sidebar, or another navigation method
 */

// Create a custom event for section navigation
export const createSectionChangeEvent = (fromSection: string, toSection: string) => {
  const event = new CustomEvent('section-change', {
    detail: {
      from: fromSection,
      to: toSection
    }
  });
  
  window.dispatchEvent(event);
  return event;
};

// Helper function to trigger "leaving loads" navigation
export const triggerLeavingLoads = (toSection: string) => {
  createSectionChangeEvent('loads', toSection);
};

// Helper function to trigger "entering loads" navigation
export const triggerEnteringLoads = (fromSection: string) => {
  createSectionChangeEvent(fromSection, 'loads');
};

// Type for the section change event detail
export interface SectionChangeDetail {
  from: string;
  to: string;
}
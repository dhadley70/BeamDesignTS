import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import type { SectionChangeDetail } from '@/lib/navigationEvents';

/**
 * Custom hook to manage a flag that tracks when users leave/return to the loads tab
 * 
 * @returns An object containing:
 * - leavingLoadsTab: boolean indicating if user has navigated away from loads tab
 * - setLeavingLoadsTab: function to set the flag
 * - resetLeavingFlag: function to reset the flag back to false
 */
export function useLoadsTabState() {
  // Store the state in localStorage so it persists across page reloads
  const [leavingLoadsTab, setLeavingLoadsTab] = useLocalStorage<boolean>('leavingLoadsTab', false);
  
  // Function to reset the flag
  const resetLeavingFlag = () => {
    setLeavingLoadsTab(false);
  };

  // Listen for navigation events
  useEffect(() => {
    const handleSectionChange = (event: Event) => {
      const customEvent = event as CustomEvent<SectionChangeDetail>;
      const { from, to } = customEvent.detail;
      
      // Set flag to true when navigating away from loads
      if (from === 'loads' && to !== 'loads') {
        console.log('Leaving loads section');
        setLeavingLoadsTab(true);
      }
    };
    
    // Add event listener for section changes
    window.addEventListener('section-change', handleSectionChange);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('section-change', handleSectionChange);
    };
  }, [setLeavingLoadsTab]);

  return {
    leavingLoadsTab,
    setLeavingLoadsTab,
    resetLeavingFlag
  };
}
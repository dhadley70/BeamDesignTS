// Card State Manager - Controls the collapsed state of all cards

/**
 * Custom events for controlling global card state
 */
export const COLLAPSE_ALL_CARDS = 'app:collapse-all-cards';
export const EXPAND_ALL_CARDS = 'app:expand-all-cards';

/**
 * Get the appropriate keyboard shortcut key based on platform
 * @returns String representing the keyboard shortcut
 */
export const getShortcutKey = (): string => {
  // Check if the user is on Mac
  const isMac = typeof navigator !== 'undefined' && 
                navigator.platform.toLowerCase().includes('mac');
  
  return isMac ? '⌘K' : 'Ctrl+K';
};

/**
 * Save the global card state to localStorage
 */
export const saveGlobalCardState = (allCardsCollapsed: boolean): void => {
  localStorage.setItem('allCardsCollapsed', allCardsCollapsed ? 'true' : 'false');
};

/**
 * Get the global card state from localStorage
 */
export const getGlobalCardState = (): boolean => {
  const saved = localStorage.getItem('allCardsCollapsed');
  return saved === 'true';
};
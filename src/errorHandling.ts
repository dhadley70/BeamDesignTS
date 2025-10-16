/**
 * Utility to handle common network errors in development
 */

// Add this to your main entry file to handle connection errors
export function setupNetworkErrorHandling(): void {
  if (import.meta.env.DEV) {
    window.addEventListener('error', (event) => {
      const errorMessage = event.message || '';
      
      // Check for network-related errors
      if (
        errorMessage.includes('net::ERR_CONNECTION_REFUSED') ||
        errorMessage.includes('net::ERR_CONNECTION_RESET') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError')
      ) {
        console.log('Detected network error, attempting to refresh in 3 seconds...');
        
        // Try to reconnect after a short delay
        setTimeout(() => {
          console.log('Refreshing page after network error...');
          window.location.reload();
        }, 3000);
      }
    }, { capture: true });
    
    console.log('Development network error handler initialized');
  }
}
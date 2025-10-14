/**
 * Utilities for saving and loading beam design data
 */

// List of localStorage keys that should be included in the saved file
const STORAGE_KEYS = [
  'projectInfo',
  'generalInputs', 
  'beamLoads',
  'beamPointLoads',
  'beamMoments',
  'beamFullUDL',
  'deflectionLimits'
];

/**
 * Exports all beam design data to a downloadable JSON file
 */
export function exportDesignData(filename = 'beam-design.json'): void {
  try {
    // Create an object to store all the data
    const exportData: Record<string, any> = {};
    
    // Collect data from localStorage for each key
    STORAGE_KEYS.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          exportData[key] = JSON.parse(data);
        } catch (e) {
          console.warn(`Error parsing localStorage data for key "${key}":`, e);
          exportData[key] = data; // Store as string if parsing fails
        }
      }
    });
    
    // Add metadata
    exportData.meta = {
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    // Convert to a JSON string
    const dataStr = JSON.stringify(exportData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element and trigger the download
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export beam design data:', error);
    throw new Error('Failed to export beam design data.');
  }
}

/**
 * Imports beam design data from a JSON file
 * @param jsonData The parsed JSON data to import
 * @returns Object with the result of the import operation
 */
export function importDesignData(jsonData: any): { success: boolean; message: string } {
  try {
    if (!jsonData || typeof jsonData !== 'object') {
      return { 
        success: false, 
        message: 'Invalid data format. Expected a JSON object.' 
      };
    }
    
    // Check for required metadata
    if (!jsonData.meta || !jsonData.meta.version) {
      return { 
        success: false, 
        message: 'Invalid data format. Missing metadata.' 
      };
    }
    
    // Store each key in localStorage
    let importedCount = 0;
    STORAGE_KEYS.forEach(key => {
      if (jsonData[key] !== undefined) {
        localStorage.setItem(key, JSON.stringify(jsonData[key]));
        importedCount++;
      }
    });
    
    if (importedCount === 0) {
      return { 
        success: false, 
        message: 'No valid beam design data found in the file.' 
      };
    }
    
    return { 
      success: true, 
      message: `Successfully imported beam design data. (${importedCount} items)` 
    };
  } catch (error) {
    console.error('Failed to import beam design data:', error);
    return { 
      success: false, 
      message: 'An error occurred while importing beam design data.' 
    };
  }
}

/**
 * Reads a file and returns its contents as a JSON object
 * @param file The file to read
 * @returns A promise that resolves to the parsed JSON data
 */
export function readJSONFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Failed to parse file as JSON.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    
    reader.readAsText(file);
  });
}
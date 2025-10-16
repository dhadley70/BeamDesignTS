/**
 * Manual test file for useLocalStorage hook
 * 
 * This file contains tests that can be manually run in the browser console
 * to verify the functionality of the useLocalStorage hook.
 */

// Test localStorage array handling
export function testLocalStorageArrayHandling() {
  console.log('===== Testing localStorage Array Handling =====');
  
  // Clear any existing data
  localStorage.removeItem('testArray');
  
  // Test 1: Set a valid array
  console.log('Test 1: Setting valid array');
  localStorage.setItem('testArray', JSON.stringify([1, 2, 3]));
  const result1 = JSON.parse(localStorage.getItem('testArray') || '[]');
  console.log('Result should be an array:', result1);
  console.log('Is array:', Array.isArray(result1));
  
  // Test 2: Set an invalid value (not an array)
  console.log('\nTest 2: Setting invalid value (not an array)');
  localStorage.setItem('testArray', '{"notAnArray": true}');
  try {
    const result2 = JSON.parse(localStorage.getItem('testArray') || '[]');
    console.log('Result is:', result2);
    console.log('Is array:', Array.isArray(result2));
    console.log('Our code should detect this is not an array and provide an empty array instead');
  } catch (e) {
    console.error('Error parsing:', e);
  }
  
  // Test 3: Completely invalid JSON
  console.log('\nTest 3: Setting completely invalid JSON');
  localStorage.setItem('testArray', 'not valid json');
  try {
    const result3 = JSON.parse(localStorage.getItem('testArray') || '[]');
    console.log('This should never show due to JSON.parse error');
  } catch (e) {
    console.error('Expected error parsing invalid JSON:', e);
    console.log('Our hook should handle this error and return default value');
  }
  
  // Cleanup
  localStorage.removeItem('testArray');
  console.log('\nTest completed, localStorage test key removed');
}

// Test load adding functionality
export function testLoadAdding() {
  console.log('===== Testing Load Adding Functionality =====');
  
  // Clear existing loads
  localStorage.removeItem('beamLoads');
  
  // Test 1: Initialize with empty array
  console.log('Test 1: Initialize with empty array');
  localStorage.setItem('beamLoads', JSON.stringify([]));
  console.log('beamLoads set to empty array. App should show no loads.');
  
  // Test 2: Initialize with invalid data
  console.log('\nTest 2: Initialize with invalid data (not an array)');
  localStorage.setItem('beamLoads', '{"notAnArray": true}');
  console.log('beamLoads set to invalid data. App should handle this gracefully.');
  
  // Test 3: Initialize with malformed data
  console.log('\nTest 3: Initialize with malformed JSON');
  localStorage.setItem('beamLoads', 'this is not valid JSON');
  console.log('beamLoads set to malformed JSON. App should handle this gracefully.');
  
  console.log('\nNow try using the ADD button in the application to add loads');
  console.log('The application should handle all these cases without errors');
}

// Main test runner function to execute from browser console
export function runAllTests() {
  console.log('===== Running All useLocalStorage Tests =====');
  testLocalStorageArrayHandling();
  console.log('\n');
  testLoadAdding();
  console.log('\n===== All Tests Completed =====');
}
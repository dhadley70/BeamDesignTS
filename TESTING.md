# BeamDesignTS Testing Guide

This document outlines the testing approach for the BeamDesignTS application, focusing particularly on the localStorage functionality and array handling.

## Overview of Test Areas

1. **localStorage Array Handling**: Tests to ensure the useLocalStorage hook handles arrays properly
2. **Load Adding Functionality**: Tests to verify that adding loads works correctly with various localStorage states
3. **Error Recovery**: Tests for network connection error recovery

## Running Tests

There are two ways to run tests:

### Option 1: Using the Test Runner

1. Run `npm run test` from the project root
2. Follow the prompts in the terminal
3. The test runner will:
   - Start the development server (if needed)
   - Open the test page in your browser
   - Guide you through the testing process

### Option 2: Manual Testing

1. Start the development server with `npm run dev`
2. Navigate to http://localhost:5173/test.html in your browser
3. Use the buttons on the page to run individual test suites
4. Follow the instructions on the page

## Browser Console Testing

For more detailed testing, you can use the browser console:

1. Open the main application (http://localhost:5173)
2. Open the developer tools (F12 or right-click > Inspect)
3. In the console, import the test functions:

```javascript
import { runAllTests } from './src/tests/useLocalStorage.test.ts'
```

4. Run the tests:

```javascript
runAllTests()
```

## What to Verify

### localStorage Handling

- Arrays are properly stored and retrieved
- Non-array values are handled safely
- Invalid JSON is handled with appropriate fallback

### Load Adding

1. Set invalid localStorage states using the test page
2. Try to add loads in the main application
3. Verify that no errors occur (especially "prevLoads is not iterable")

### Network Error Recovery

1. Verify that the application can recover from network connection errors
2. Test by temporarily disabling your network connection while using the app

## Pre-Push Checklist

Before pushing to master, ensure:

- [x] All TypeScript compilation passes (`npx tsc --noEmit`)
- [x] ESLint checks pass (`npm run lint`)
- [x] Manual tests for localStorage functionality pass
- [x] Load adding works correctly after localStorage corruption
- [x] Network error recovery works as expected

## Test Implementation Details

The tests are implemented in two main locations:

1. `src/tests/useLocalStorage.test.ts` - JavaScript test functions
2. `public/test.html` - UI for running tests in the browser

These tests focus on the edge cases and error conditions that can occur in production, particularly around localStorage data corruption and network connection issues.

## Adding New Tests

To add new tests:

1. Add test functions to `src/tests/useLocalStorage.test.ts`
2. Update the `runAllTests()` function to include your new tests
3. If needed, add UI elements to `public/test.html`
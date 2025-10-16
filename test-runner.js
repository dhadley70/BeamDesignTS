/**
 * Test Runner for BeamDesignTS
 * 
 * This script helps run tests for the BeamDesignTS application.
 * Run it with Node.js: `node test-runner.js`
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function printHeader() {
  console.log('\n=============================================');
  console.log('      BeamDesignTS Test Runner');
  console.log('=============================================\n');
}

function printMenu() {
  console.log('Please select an option:');
  console.log('1. Start dev server and run tests');
  console.log('2. Run tests only (if server is already running)');
  console.log('3. Check project for errors');
  console.log('4. Exit');
  rl.question('\nEnter your choice (1-4): ', handleMenuChoice);
}

function handleMenuChoice(choice) {
  switch(choice) {
    case '1':
      startDevServerAndRunTests();
      break;
    case '2':
      runTests();
      break;
    case '3':
      checkProjectForErrors();
      break;
    case '4':
      console.log('Exiting test runner. Goodbye!');
      rl.close();
      break;
    default:
      console.log('Invalid choice. Please try again.');
      printMenu();
  }
}

function startDevServerAndRunTests() {
  console.log('\n> Starting development server...');
  console.log('> The server will start in a new window.');
  console.log('> Once the server is running, press Enter to open test page.\n');
  
  try {
    // Start server in detached mode
    const serverProcess = require('child_process').spawn('npm', ['run', 'dev'], {
      detached: true,
      stdio: 'inherit'
    });
    
    // Don't wait for the child process
    serverProcess.unref();
    
    rl.question('Press Enter when the server is running to open the test page...', () => {
      openTestPage();
    });
  } catch (error) {
    console.error('Failed to start dev server:', error);
    printMenu();
  }
}

function runTests() {
  openTestPage();
}

function openTestPage() {
  console.log('\n> Opening test page in your default browser...');
  try {
    // Try to open the test page in the default browser
    const url = 'http://localhost:5173/test.html';
    let command;
    
    if (process.platform === 'win32') {
      command = `start ${url}`;
    } else if (process.platform === 'darwin') {
      command = `open ${url}`;
    } else {
      command = `xdg-open ${url}`;
    }
    
    execSync(command);
    
    console.log('> Test page opened successfully.');
    console.log('> Please follow the instructions on the test page to run the tests.\n');
    console.log('> When you\'re done testing, you can return here to continue.\n');
    
    rl.question('Press Enter when you\'re done testing...', printMenu);
  } catch (error) {
    console.error('Failed to open browser:', error);
    console.log('Please manually navigate to http://localhost:5173/test.html in your browser.\n');
    rl.question('Press Enter when you\'re done testing...', printMenu);
  }
}

function checkProjectForErrors() {
  console.log('\n> Checking project for errors...');
  
  try {
    console.log('\n> Checking TypeScript compilation errors:');
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log('✅ TypeScript compilation successful!');
  } catch (error) {
    console.error('❌ TypeScript compilation errors found.');
  }
  
  try {
    console.log('\n> Running ESLint:');
    execSync('npx eslint --ext .ts,.tsx src', { stdio: 'inherit' });
    console.log('✅ ESLint check successful!');
  } catch (error) {
    console.error('❌ ESLint errors found.');
  }
  
  console.log('\n> Project check completed.');
  rl.question('\nPress Enter to return to the main menu...', printMenu);
}

// Start the test runner
printHeader();
printMenu();
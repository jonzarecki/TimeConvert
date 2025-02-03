// Import required modules
const { parseDateString } = require('../shared.js');
const { TEST_CASES } = require('./test_cases/date_parser_cases.js');

// Mock browser environment
global.window = {
    chrome: {
        runtime: {
            sendMessage: () => Promise.resolve()
        }
    }
};

// ANSI color codes for pretty output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    white: "\x1b[37m"
};

describe('Date Parser Tests', () => {
    let totalTests = 0;
    let passedTests = 0;

    for (const [category, tests] of Object.entries(TEST_CASES)) {
        describe(category, () => {
            tests.forEach(test => {
                it(test.description, () => {
                    totalTests++;
                    try {
                        const date = parseDateString(test.input);
                        const result = test.verify ? test.verify(date) : !isNaN(date) === test.expected;
                        
                        if (result) {
                            passedTests++;
                            console.log(`${colors.green}✓${colors.reset} ${test.description}`);
                            if (!isNaN(date)) {
                                console.log(`  Input: "${test.input}"`);
                                console.log(`  Output: ${date.toISOString()}`);
                            }
                        } else {
                            console.log(`${colors.red}✗${colors.reset} ${test.description}`);
                            console.log(`  Input: "${test.input}"`);
                            console.log(`  Expected: ${test.expected}, Got: ${!isNaN(date)}`);
                            throw new Error('Test failed');
                        }
                    } catch (error) {
                        console.log(`${colors.red}✗${colors.reset} ${test.description}`);
                        console.log(`  Input: "${test.input}"`);
                        console.log(`  Error: ${error.message}`);
                        throw error;
                    }
                });
            });
        });
    }

    after(() => {
        // Print summary
        console.log(`\n${colors.bright}Test Summary${colors.reset}`);
        console.log("=".repeat(12));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
        console.log(`${colors.red}Failed: ${totalTests - passedTests}${colors.reset}\n`);
    });
}); 
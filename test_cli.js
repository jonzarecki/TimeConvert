// Import required modules
const { parseDateString } = require('./shared.js');

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

// Import test cases
const TEST_CASES = {
    TIME_FORMATS: [
        { input: "1800", expected: true, description: "24-hour time without separator" },
        { input: "18:00", expected: true, description: "24-hour time with colon" },
        { input: "9", expected: true, description: "Single digit hour" },
        { input: "09:00", expected: true, description: "24-hour time with leading zero" }
    ],
    TIMEZONE_CONVERSION_TESTS: [
        {
            input: "2024-01-31T10:00:00Z",  // UTC time
            expected: true,
            description: "UTC time conversion",
            verify: (date) => {
                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                console.log(`\n${colors.blue}Test converting UTC to local timezone (${timeZone})${colors.reset}`);
                
                // Get the expected offset in minutes for this timezone
                const localDate = new Date(date);
                const offsetMinutes = -localDate.getTimezoneOffset();
                const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
                const offsetMins = Math.abs(offsetMinutes % 60);
                const offsetStr = `${offsetMinutes >= 0 ? '+' : '-'}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;
                
                console.log(`${colors.yellow}Local timezone offset: ${offsetStr}${colors.reset}`);
                console.log(`${colors.yellow}Converted time: ${localDate.toLocaleString()}${colors.reset}`);
                
                return !isNaN(date);
            }
        },
        {
            input: "18:00 EST",  // EST time
            expected: true,
            description: "EST to local timezone conversion",
            verify: (date) => {
                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                console.log(`\n${colors.blue}Test converting EST to local timezone (${timeZone})${colors.reset}`);
                console.log(`${colors.yellow}Converted time: ${date.toLocaleString()}${colors.reset}`);
                return !isNaN(date);
            }
        }
    ]
};

// Run tests
console.log(`${colors.bright}Running Date Parser Tests${colors.reset}\n`);

let totalTests = 0;
let passedTests = 0;

for (const [category, tests] of Object.entries(TEST_CASES)) {
    console.log(`${colors.bright}${category}${colors.reset}`);
    console.log("=".repeat(category.length));
    
    tests.forEach(test => {
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
            }
        } catch (error) {
            console.log(`${colors.red}✗${colors.reset} ${test.description}`);
            console.log(`  Input: "${test.input}"`);
            console.log(`  Error: ${error.message}`);
        }
        console.log("");
    });
}

// Print summary
console.log(`${colors.bright}Test Summary${colors.reset}`);
console.log("=".repeat(12));
console.log(`Total Tests: ${totalTests}`);
console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
console.log(`${colors.red}Failed: ${totalTests - passedTests}${colors.reset}\n`);

// Exit with appropriate code
process.exit(passedTests === totalTests ? 0 : 1); 
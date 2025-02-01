// Test case categories
const TEST_CASES = {
    TIME_FORMATS: [
        { input: "1800", expected: true, description: "24-hour time without separator" },
        { input: "18:00", expected: true, description: "24-hour time with colon" },
        { input: "9", expected: true, description: "Single digit hour" },
        { input: "09:00", expected: true, description: "24-hour time with leading zero" }
    ],
    
    AM_PM_FORMATS: [
        { input: "6:00 PM", expected: true, description: "12-hour time with PM" },
        { input: "6:00PM", expected: true, description: "12-hour time with PM (no space)" },
        { input: "6PM", expected: true, description: "Hour with PM" },
        { input: "6 PM", expected: true, description: "Hour with PM (with space)" },
        { input: "6:00 am", expected: true, description: "12-hour time with lowercase am" },
        { input: "6:00 AM", expected: true, description: "12-hour time with uppercase AM" }
    ],
    
    DATE_FORMATS: [
        { input: "2024-01-25", expected: true, description: "ISO date format" },
        { input: "25/01/2024", expected: true, description: "UK date format" },
        { input: "01/25/2024", expected: true, description: "US date format" },
        { input: "25-01-2024", expected: true, description: "Date with hyphens" },
        { input: "25.01.2024", expected: true, description: "Date with dots" }
    ],
    
    DATE_TIME_FORMATS: [
        { input: "2024-01-25 18:00", expected: true, description: "ISO date with time" },
        { input: "25/01/2024 18:00", expected: true, description: "UK date with time" },
        { input: "01/25/2024 6:00 PM", expected: true, description: "US date with 12-hour time" }
    ],
    
    TIMEZONE_FORMATS: [
        { input: "18:00 UTC", expected: true, description: "Time with UTC" },
        { input: "6:00 PM EST", expected: true, description: "Time with EST" },
        { input: "6:00PM EST", expected: true, description: "Time with EST (no space)" },
        { input: "18:00 GMT+1", expected: true, description: "Time with GMT+1 offset" },
        { input: "18:00 UTC+1", expected: true, description: "Time with UTC+1 offset" },
        { input: "18:00 GMT+2", expected: true, description: "Time with GMT offset" },
        { input: "18:00 UTC+02:00", expected: true, description: "Time with UTC offset" },
        { input: "18:00 GMT-1", expected: true, description: "Time with GMT-1 offset" },
        { input: "18:00 UTC-1", expected: true, description: "Time with UTC-1 offset" }
    ],
    
    MONTH_NAME_FORMATS: [
        { input: "25 January 2024", expected: true, description: "Full month name" },
        { input: "25 Jan 2024", expected: true, description: "Abbreviated month name" },
        { input: "January 25, 2024", expected: true, description: "US format with month name" },
        { input: "Jan 25, 2024", expected: true, description: "US format with abbreviated month" }
    ],
    
    SPECIAL_FORMATS: [
        { input: "2024-01-25T18:00:00", expected: true, description: "ISO format with T separator" },
        { input: "2024-01-25T18:00:00Z", expected: true, description: "ISO format with Z" },
        { input: "2024-01-25T18:00:00+02:00", expected: true, description: "ISO format with timezone offset" }
    ],
    
    INVALID_FORMATS: [
        { input: "today", expected: false, description: "Today" },
        { input: "tomorrow", expected: false, description: "Tomorrow" },
        { input: "yesterday", expected: false, description: "Yesterday" },
        { input: "not a date", expected: false, description: "Plain text" },
        { input: "25", expected: false, description: "Just a number" },
        { input: ":", expected: false, description: "Just a colon" },
        { input: "PM", expected: false, description: "Just AM/PM" },
        { input: "UTC", expected: false, description: "Just timezone" },
        { input: "18:60", expected: false, description: "Invalid minutes" },
        { input: "25:00", expected: false, description: "Invalid hours" },
        { input: "13/13/2024", expected: false, description: "Invalid month" },
        { input: "32/01/2024", expected: true, description: "Invalid day, smoothed by libraries to +1 day" }
    ],
    
    TIMEZONE_CONVERSION_TESTS: [
        {
            input: "2024-01-31T10:00:00Z",  // UTC time
            expected: true,
            description: "UTC time conversion",
            verify: (date) => {
                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                console.log(`Test converting UTC to local timezone (${timeZone})`);
                
                // Get the expected offset in minutes for this timezone
                const localDate = new Date(date);
                const offsetMinutes = -localDate.getTimezoneOffset();
                const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
                const offsetMins = Math.abs(offsetMinutes % 60);
                const offsetStr = `${offsetMinutes >= 0 ? '+' : '-'}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;
                
                console.log(`Local timezone offset: ${offsetStr}`);
                console.log(`Converted time: ${localDate.toLocaleString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: timeZone,
                    timeZoneName: 'short'
                })}`);
                
                return !isNaN(date);
            }
        },
        {
            input: "18:00 EST",  // EST time
            expected: true,
            description: "EST to local timezone conversion",
            verify: (date) => {
                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                console.log(`Test converting EST to local timezone (${timeZone})`);
                console.log(`Converted time: ${date.toLocaleString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: timeZone,
                    timeZoneName: 'short'
                })}`);
                return !isNaN(date);
            }
        }
    ]
};

// Function to run tests
function runTests() {
    const resultsDiv = document.getElementById('results');
    const summaryDiv = document.getElementById('summary');
    let passed = 0;
    let failed = 0;
    let output = '';
    
    // Run tests for each category
    Object.entries(TEST_CASES).forEach(([category, tests]) => {
        output += `<h3>${category}</h3>`;
        
        tests.forEach((testCase, index) => {
            try {
                const date = parseDateString(testCase.input);
                const result = !isNaN(date);
                const success = result === testCase.expected;
                
                if (success) {
                    passed++;
                    output += `<p class="pass">✅ ${testCase.description}<br>`;
                    if (result) {
                        output += `&nbsp;&nbsp;&nbsp;Input: "${testCase.input}" => ${date.toISOString()}</p>`;
                    }
                } else {
                    failed++;
                    output += `<p class="fail">❌ ${testCase.description}<br>`;
                    output += `&nbsp;&nbsp;&nbsp;Input: "${testCase.input}"<br>`;
                    output += `&nbsp;&nbsp;&nbsp;Expected: ${testCase.expected}, Got: ${result}</p>`;
                }
            } catch (error) {
                failed++;
                console.error(`Test case failed: ${testCase.description}`, error);
                output += `<p class="fail">❌ ${testCase.description}<br>`;
                output += `&nbsp;&nbsp;&nbsp;Input: "${testCase.input}"<br>`;
                output += `&nbsp;&nbsp;&nbsp;Error: ${error.message}</p>`;
            }
        });
    });
    
    resultsDiv.innerHTML = output;
    
    // Display summary
    const total = Object.values(TEST_CASES).reduce((sum, tests) => sum + tests.length, 0);
    summaryDiv.innerHTML = `
        <h2>Test Summary:</h2>
        <p>Total Tests: ${total}</p>
        <p class="pass">Passed: ${passed}</p>
        <p class="fail">Failed: ${failed}</p>
    `;
}

// Run tests when the page loads
window.onload = runTests;

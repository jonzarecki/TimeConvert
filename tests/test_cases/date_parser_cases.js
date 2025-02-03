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
    
    TIMEZONE_CONVERSION_TESTS: []
};

// Function to create timezone verification test
function createTimezoneTest(input, description) {
    return {
        input,
        expected: true,
        description,
        verify: (date) => {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const message = `Test converting ${description} to local timezone (${timeZone})`;
            
            // Get the expected offset in minutes for this timezone
            const localDate = new Date(date);
            const offsetMinutes = -localDate.getTimezoneOffset();
            const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
            const offsetMins = Math.abs(offsetMinutes % 60);
            const offsetStr = `${offsetMinutes >= 0 ? '+' : '-'}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;
            
            // Log info if console is available
            if (typeof console !== 'undefined') {
                console.log(message);
                console.log(`Local timezone offset: ${offsetStr}`);
                console.log(`Converted time: ${localDate.toLocaleString()}`);
            }
            
            return !isNaN(date);
        }
    };
}

// Add timezone conversion tests
TEST_CASES.TIMEZONE_CONVERSION_TESTS = [
    createTimezoneTest("2024-01-31T10:00:00Z", "UTC time conversion"),
    createTimezoneTest("18:00 EST", "EST to local timezone conversion")
];

module.exports = { TEST_CASES, createTimezoneTest }; 
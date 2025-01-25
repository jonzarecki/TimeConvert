// Time constants
const TIME_CONSTANTS = {
    CHECK_INTERVAL_MS: 5000,
    TOAST_DURATION_MS: 3000,
    MAX_STRING_LENGTH: 50
};

// Regex patterns
const DATE_PATTERNS = {
    DATE_REGEX: /\b(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2} \w+ \d{4}|\w+ \d{1,2}, \d{4}|\d{1,2} \w+ \d{2}|\w+ \d{1,2} \w+ \d{2})\b/g,
    TIME_ZONE_REGEX: /\b(?:\d{1,2}(?::\d{2})?(?::\d{2})?\s*(?:am|pm)?\s+)?(?:(?:GMT|UTC|EST|EDT|CST|CDT|MST|MDT|PST|PDT|AKST|AKDT|HST|HDT|AST|ADT|BST|WET|WEST|CET|CEST|EET|EEST|IST|PKT|NPT|BTT|JST|KST|PHT|IDT|SGT|AWST|ACST|AEST|AEDT|NZST|NZDT|[A-Y])|(?:[A-Za-z]+\s*(?:Standard|Daylight|Summer)?\s*Time))\b/i
};

// CSS Classes
const CSS_CLASSES = {
    DATE_HIGHLIGHT: 'highlight-yellow',
    TIMEZONE_HIGHLIGHT: 'highlight-green'
}; 
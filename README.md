# Date Highlighter & Converter Chrome Extension

A powerful Chrome extension that automatically highlights dates and timezones on web pages and provides easy date conversion functionality.

## Features

- 🔍 **Automatic Date Detection**: Highlights dates in yellow across web pages
- 🌐 **Timezone Highlighting**: Highlights timezone mentions in green
- 🔄 **Date Conversion**: Right-click any date to convert it to ISO format
- 📋 **Clipboard Integration**: Automatically copies converted dates to clipboard
- 🌍 **Wide Format Support**: Recognizes various date formats:
  - ISO dates (2024-01-25)
  - US format (MM/DD/YYYY)
  - UK format (DD/MM/YYYY)
  - Date-time combinations
  - AM/PM times
  - Timezone-aware dates
  - Natural language dates (25 January 2024)

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. **Date Highlighting**: Simply browse any webpage - dates and timezones will be automatically highlighted
2. **Date Conversion**: 
   - Select any date text
   - Right-click and choose "Convert Date" from the context menu
   - A toast notification will show the converted date in both localized and ISO formats

## Supported Date Formats

The extension supports a wide variety of date and time formats:

- Time formats: "1800", "18:00", "6:00 PM"
- Date formats: "2024-01-25", "25/01/2024", "01/25/2024"
- Combined formats: "2024-01-25 18:00", "25/01/2024 6:00 PM"
- Timezone formats: "18:00 UTC", "6:00 PM EST", "18:00 GMT+1"
- Natural language: "25 January 2024", "Jan 25, 2024"
- ISO 8601: "2024-01-25T18:00:00Z"

## For Developers

### Project Structure

- `manifest.json` - Extension configuration
- `background.js` - Service worker for context menu and conversion
- `content.js` - Content script for highlighting and DOM manipulation
- `popup.html` - Extension popup UI
- `shared.js` - Shared utilities and timezone data
- `constants.js` - Configuration constants and regex patterns
- `utils.js` - Helper functions
- `test_dates.js` - Test suite for date parsing

### Testing

The extension includes a comprehensive test suite (`test.html` and `test_dates.js`) covering various date formats and edge cases. To run tests:

1. Open `test.html` in a browser
2. View the test results and coverage for different date format categories

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Notes

- Uses MutationObserver for dynamic content handling
- Implements efficient DOM traversal with processed content tracking
- Supports extensive timezone mapping
- Includes error handling and user feedback
- Built with vanilla JavaScript for maximum performance

## License

MIT License - Feel free to use and modify as needed.

## Support

For issues, feature requests, or contributions, please open an issue on the repository. 
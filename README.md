# Date Converter Chrome Extension

A Chrome extension that helps you convert dates between different formats with a simple right-click menu.

## Features

- 🔄 **Smart Date Conversion**: Right-click any date to convert it to multiple formats
- 🌐 **Timezone Support**: Shows both local time and UTC
- 📅 **Wide Format Support**: Recognizes various date formats:
  - ISO dates (2024-01-25T18:00:00Z)
  - US format (MM/DD/YYYY)
  - UK format (DD/MM/YYYY)
  - Date-time combinations
  - AM/PM times
  - Timezone-aware dates
  - Natural language dates (25 January 2024)
- 🎯 **Context-Aware UI**: Shows conversion option only for valid dates
- 💫 **Elegant Notifications**: Displays conversion results in a clean toast near your cursor

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Select any date text on a webpage
2. Right-click the selection
3. Choose "Convert Date" from the context menu
4. A toast notification will show:
   - The original date
   - Local time with timezone
   - UTC time
   - ISO 8601 format

## Supported Date Formats

The extension supports a wide variety of date and time formats:

### Time Formats
- 24-hour: "1800", "18:00"
- 12-hour: "6:00 PM", "6PM"

### Date Formats
- ISO: "2024-01-25"
- UK: "25/01/2024"
- US: "01/25/2024"
- Natural: "25 January 2024", "Jan 25, 2024"

### Combined Formats
- ISO with T separator: "2024-01-25T18:00:00"
- ISO with Z: "2024-01-25T18:00:00Z"
- With timezone offset: "2024-01-25T18:00:00+02:00"
- Date and time: "2024-01-25 18:00", "25/01/2024 6:00 PM"

## Required Permissions

The extension requires the following permissions:
- `contextMenus`: For the right-click menu functionality
- `scripting`: For injecting toast notifications
- `host_permissions`: For accessing page content
- Content script access: For detecting and converting dates on web pages

## For Developers

### Project Structure

- `manifest.json` - Extension configuration
- `background.js` - Service worker for context menu and conversion
- `content.js` - Content script for selection handling
- `shared.js` - Shared utilities and date parsing
- `constants.js` - Configuration constants
- `utils.js` - Helper functions
- `test_dates.js` - Test cases for date parsing
- `test.html` & `test_cli.js` - Test runners

### Testing

The extension includes comprehensive tests covering various date formats. To run tests:

1. Browser tests: Open `test.html` in a browser
2. CLI tests: Run `node test_cli.js`

### Development Notes

- Built with vanilla JavaScript
- Uses Toastify for notifications
- Implements robust date parsing
- Includes extensive test coverage
- Follows Chrome Extension Manifest V3

## License

MIT License - Feel free to use and modify as needed.

## Support

For issues, feature requests, or contributions, please open an issue on the repository. 
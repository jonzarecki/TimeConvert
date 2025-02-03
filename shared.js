// Utility function to pad strings to a fixed length
function padStringToFixedLength(str, length) {
    return (str + " ".repeat(length)).slice(0, length);
}

// Wait for Toastify to be loaded
function waitForToastify(callback) {
    if (typeof Toastify !== 'undefined') {
        callback();
    } else {
        setTimeout(() => waitForToastify(callback), 100);
    }
}

function showToast(message, isError = false, mouseX = null, mouseY = null) {
    waitForToastify(() => {
        // Calculate position relative to mouse if coordinates are provided
        const offset = 20; // pixels offset from mouse cursor
        const position = mouseX !== null && mouseY !== null ? {
            left: Math.min(mouseX + offset, window.innerWidth - 300), // prevent overflow
            top: Math.min(mouseY + offset, window.innerHeight - 100)  // prevent overflow
        } : {};

        Toastify({
            text: message,
            duration: 3000,
            close: false,
            gravity: mouseY !== null ? false : "top", // disable gravity if we have mouse position
            position: mouseY !== null ? false : "center", // disable default positioning if we have mouse position
            backgroundColor: isError ? "#FF0000" : "#4CAF50",
            stopOnFocus: true,
            offset: position,
            style: mouseY !== null ? {
                position: 'fixed',
                left: position.left + 'px',
                top: position.top + 'px'
            } : {}
        }).showToast();
    });
}

// Timezone abbreviation to offset mapping
const TIMEZONE_OFFSETS = {
    // North America
    'EST': '-05:00',
    'EDT': '-04:00',
    'CST': '-06:00',
    'CDT': '-05:00',
    'MST': '-07:00',
    'MDT': '-06:00',
    'PST': '-08:00',
    'PDT': '-07:00',
    'AKST': '-09:00',
    'AKDT': '-08:00',
    'HST': '-10:00',
    'HDT': '-09:00',
    'AST': '-04:00',
    'ADT': '-03:00',

    // Europe
    'GMT': '+00:00',
    'BST': '+01:00',
    'IST': '+01:00', // Irish Standard Time
    'WET': '+00:00',
    'WEST': '+01:00',
    'CET': '+01:00',
    'CEST': '+02:00',
    'EET': '+02:00',
    'EEST': '+03:00',

    // Asia
    'IST': '+05:30', // Indian Standard Time
    'PKT': '+05:00',
    'NPT': '+05:45',
    'BTT': '+06:00',
    'JST': '+09:00',
    'KST': '+09:00',
    'CST': '+08:00', // China Standard Time
    'PHT': '+08:00',
    'IDT': '+03:00', // Israel Daylight Time
    'SGT': '+08:00',

    // Australia
    'AWST': '+08:00',
    'ACST': '+09:30',
    'AEST': '+10:00',
    'AEDT': '+11:00',

    // New Zealand
    'NZST': '+12:00',
    'NZDT': '+13:00',

    // UTC/GMT variations
    'UTC': '+00:00',
    'Z': '+00:00',
    'UT': '+00:00',
};

// Date parsing functions
function parseDateString(text) {
  try {
    text = text.trim();
    
    // Try to parse ISO format with timezone first
    if (text.includes('T')) {
      const date = new Date(text);
      if (!isNaN(date)) {
        return date;
      }
    }
    
    // Try to parse time formats like "1800" or "9"
    const timeMatch = text.match(/^(\d{1,2})(?::?(\d{2}))?\s*(am|pm)?$/i);
    if (timeMatch) {
      const [_, hours, minutes = "00", ampm] = timeMatch;
      console.log(hours, minutes, ampm);
      let hour = parseInt(hours, 10);
      const mins = parseInt(minutes, 10);
      
      // Handle AM/PM
      if (ampm) {
        if (ampm.toLowerCase() === "pm" && hour < 12) hour += 12;
        if (ampm.toLowerCase() === "am" && hour === 12) hour = 0;
      }
      
      // Validate hours and minutes
      if (hour >= 24 || mins >= 60) {
        console.log("Invalid time:", text);
        return NaN;
      }
      
      const today = new Date();
      let dd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, mins)
      console.log(dd);
      return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, mins);
    }

    // Try to parse date formats like DD/MM/YYYY or MM/DD/YYYY with optional time
    const dateMatch = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/i);
    if (dateMatch) {
      const [_, first, second, year, hours = "0", minutes = "0", ampm] = dateMatch;
      
      let hour = parseInt(hours, 10);
      const mins = parseInt(minutes, 10);
      
      // Handle AM/PM if present
      if (ampm) {
        if (ampm.toLowerCase() === "pm" && hour < 12) hour += 12;
        if (ampm.toLowerCase() === "am" && hour === 12) hour = 0;
      }
      
      // Validate hours and minutes
      if (hour >= 24 || mins >= 60) {
        return NaN;
      }

      // Try both DD/MM and MM/DD formats
      const possibleDates = [
        new Date(year, second - 1, first, hour, mins), // DD/MM
        new Date(year, first - 1, second, hour, mins)  // MM/DD
      ];
      
      // Return the first valid date
      for (const date of possibleDates) {
        if (!isNaN(date) && date.getFullYear() == year) {
          return date;
        }
      }
    }

    // Handle timezone mentions with improved timezone support
    const timeWithTzMatch = text.match(/^(\d{1,2})(?::(\d{2}))(?:\s*(am|pm))?\s*([A-Z]{2,4})(?:([+-]\d{1,2}(?::\d{2})?|\d{1,2}(?::\d{2})?)?)?$/i);
    if (timeWithTzMatch) {
      const [_, hours, minutes, ampm, tz, rawOffset] = timeWithTzMatch;
      let hour = parseInt(hours, 10);
      const mins = parseInt(minutes, 10);
      
      // Handle AM/PM
      if (ampm) {
        if (ampm.toLowerCase() === "pm" && hour < 12) hour += 12;
        if (ampm.toLowerCase() === "am" && hour === 12) hour = 0;
      }
      
      // Validate hours and minutes
      if (hour >= 24 || mins >= 60) {
        console.log("Invalid time");
        return NaN;
      }

      const today = new Date();
      let dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
      
      // Process the offset
      let offset = rawOffset;
      if (!offset && TIMEZONE_OFFSETS[tz.toUpperCase()]) {
        offset = TIMEZONE_OFFSETS[tz.toUpperCase()];
      }
      
      if (offset) {
        // If offset doesn't start with + or -, assume it's positive
        if (!offset.startsWith('+') && !offset.startsWith('-')) {
          offset = '+' + offset;
        }
        
        // Parse and pad both hours and minutes of the offset
        if (offset.includes(':')) {
          const parts = offset.match(/([+-])?(\d+):?(\d+)?/);
          if (parts) {
            const [_, sign = '+', hours, minutes] = parts;
            console.log('Parsed offset parts:', { sign, hours, minutes });
            offset = `${sign}${String(hours).padStart(2, '0')}:${minutes || '00'}`;
          }
        } else {
          const parts = offset.match(/([+-])?(\d+)/);
          if (parts) {
            const [_, sign = '+', num] = parts;
            console.log('Parsed offset parts (no colon):', { sign, num });
            offset = `${sign}${String(num).padStart(2, '0')}:00`;
          }
        }
        console.log('Final offset:', offset);
        
        dateStr += offset;
      }
      
      const parsedDate = new Date(dateStr);
      if (isNaN(parsedDate)) {
        console.error("Invalid date string:", dateStr);
        return NaN;
      }
      return parsedDate;
    }

    // Try to parse as a date string (for remaining formats)
    let date = new Date(text);
    if (!isNaN(date)) {
      return date;
    }

    return NaN;
  } catch (error) {
    console.error("Date parsing error:", error);
    return NaN;
  }
}

// Make functions available in both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        parseDateString, 
        padStringToFixedLength, 
        showToast, 
        waitForToastify,
        calculateToastPosition 
    };
}

// Test suite for toast positioning calculations
function calculateToastPosition(position, windowDims, toastDims) {
    const OFFSET_X = 5;
    const OFFSET_Y = 5;

    // Convert page coordinates to viewport coordinates
    const viewportX = position.x; // - windowDims.scrollX;
    const viewportY = position.y; // + windowDims.scrollY;

    // Calculate available space in viewport
    const spaceBelow = windowDims.height - viewportY;
    const spaceAbove = viewportY;
    const spaceRight = windowDims.width - viewportX;
    const spaceLeft = viewportX;

    console.log('Click position:', position);
    console.log('Viewport position:', { viewportX, viewportY });
    console.log('Available space:', {
        below: spaceBelow,
        above: spaceAbove,
        right: spaceRight,
        left: spaceLeft
    });

    // Start with viewport position
    let x = viewportX;
    let y = viewportY;

    // Horizontal positioning
    if (spaceRight >= toastDims.width + OFFSET_X) {
        x = x + OFFSET_X;  // Right of cursor
    } else if (spaceLeft >= toastDims.width + OFFSET_X) {
        x = x - toastDims.width - OFFSET_X;  // Left of cursor
    } else {
        // Center horizontally if no good position
        x = Math.max(OFFSET_X, Math.min(windowDims.width - toastDims.width - OFFSET_X, x - toastDims.width/2));
    }

    // Vertical positioning
    if (viewportY < 0) {
        // Cursor is above viewport
        y = OFFSET_Y;
    } else if (viewportY > windowDims.height) {
        // Cursor is below viewport
        y = windowDims.height - toastDims.height - OFFSET_Y;
    } else if (spaceBelow >= toastDims.height + OFFSET_Y) {
        y = y + OFFSET_Y;  // Below cursor
    } else if (spaceAbove >= toastDims.height + OFFSET_Y) {
        y = y - toastDims.height - OFFSET_Y;  // Above cursor
    } else {
        // If no good position, prefer the side with more space
        y = (spaceBelow > spaceAbove) ?
            Math.min(windowDims.height - toastDims.height - OFFSET_Y, y + OFFSET_Y) :
            Math.max(OFFSET_Y, y - toastDims.height - OFFSET_Y);
    }

    // Ensure toast stays within viewport
    x = Math.max(OFFSET_X, Math.min(windowDims.width - toastDims.width - OFFSET_X, x));
    y = Math.max(OFFSET_Y, Math.min(windowDims.height - toastDims.height - OFFSET_Y, y));

    return { x, y };
}


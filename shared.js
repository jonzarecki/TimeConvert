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

function showToast(message, isError = false) {
    waitForToastify(() => {
        Toastify({
            text: message,
            duration: 3000,
            close: false,
            gravity: "top",
            position: "center",
            backgroundColor: isError ? "#FF0000" : "#4CAF50",
            stopOnFocus: true
        }).showToast();
    });
}

// Date parsing functions
function parseDateString(text) {
  try {
    text = text.trim();
    
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

    // Handle timezone mentions
    const timeWithTzMatch = text.match(/^(\d{1,2})(?::(\d{2}))(?:\s*(am|pm))?\s*(\wST|UTC|GMT)([+-]\d{1,2}(?::\d{2})?)?$/i);
    if (timeWithTzMatch) {
      const [_, hours, minutes, ampm, tz, offset = ""] = timeWithTzMatch;
      console.log(hours, minutes, ampm, tz, offset);
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
      
      // Add offset if present
      if (offset) {
        if (offset.includes(':')) {
          dateStr += offset;
        } else {
          // Extract sign and number, pad number to 2 digits
          const sign = offset[0];
          const num = offset.slice(1);
          dateStr += `${sign}${num.padStart(2, '0')}:00`;
        }
      }
      let dd = new Date(dateStr);
      console.log(dd);
      console.log(dateStr);
      return new Date(dateStr);
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
    module.exports = { parseDateString, padStringToFixedLength, showToast, waitForToastify };
}

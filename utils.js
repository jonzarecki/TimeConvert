// String manipulation utilities
function padStringToFixedLength(str, length) {
    return (str + " ".repeat(length)).slice(0, length);
}

function trimToMaxLength(str, maxLength = TIME_CONSTANTS.MAX_STRING_LENGTH) {
    return str.length > maxLength ? str.substring(0, maxLength) : str;
}

// Date utilities
function createDateTime(year, month, day, hours, minutes, seconds) {
    const now = new Date();
    return new Date(
        year ?? now.getFullYear(),
        month ?? now.getMonth(),
        day ?? now.getDate(),
        hours ?? now.getHours(),
        minutes ?? now.getMinutes(),
        seconds ?? now.getSeconds()
    );
}

function parseTimeComponent(hours, minutes = "00", ampm = null) {
    let hour = parseInt(hours, 10);
    const mins = parseInt(minutes, 10);
    
    if (ampm) {
        if (ampm.toLowerCase() === "pm" && hour < 12) hour += 12;
        if (ampm.toLowerCase() === "am" && hour === 12) hour = 0;
    }
    
    return { hour, mins };
}

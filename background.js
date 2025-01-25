importScripts('shared.js');

// Helper function to pad a string to a fixed length
function padStringToFixedLength(inputString, fixedLength) {
  const str = String(inputString); // Convert input to a string
  const paddingLength = fixedLength - str.length; // Calculate required padding

  // Ensure padding length is not negative (in case input is longer than fixed length)
  return paddingLength > 0 ? str.padEnd(fixedLength, '\u00A0') : str;
}

// Helper function to trim a string to a maximum length
function trimToMaxLength(inputString, maxLength = 50) {
  return inputString.length > maxLength 
    ? inputString.substring(0, maxLength) 
    : inputString;
}

// Helper function to create a date object from extracted parts
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

// Function to show toast notification via content script
async function showToast(message, isError = false) {
  try {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (tabs.length === 0) {
      console.error('No active tab found');
      return;
    }
    
    // Inject content script if not already present
    await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['shared.js', 'content.js']
    });

    // Send message to content script
    await chrome.tabs.sendMessage(tabs[0].id, {
      type: "showToast",
      message: message,
      isError: isError
    });
  } catch (error) {
    console.error('Error showing toast:', error);
  }
}

// Create a context menu item that only shows up for text selections
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertDate",
    title: "Convert Date",
    contexts: ["selection"]
  });
});

// Update context menu visibility based on text selection
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "updateContextMenu") {
    const date = parseDateString(request.selectedText);
    chrome.contextMenus.update("convertDate", {
      visible: !isNaN(date)
    });
  }
});

// Listen for context menu click event
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convertDate" && info.selectionText) {
    const selectedText = trimToMaxLength(info.selectionText.trim(), 50);
    
    date = parseDateString(selectedText);
    // show date as string if not nan, if nan write nan
    message = "Date parsed:" + date;
    showToast(message, true);

    if (!isNaN(date)) {
      // Convert to UTC
      const utcDate = date.toLocaleDateString("en-CA", { timeZone: "UTC" }) + ' ' + date.toLocaleTimeString("fr-FR", { timeZone: "UTC" });

      // Convert to IST (IST)
      const istDate = date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) + ' ' + date.toLocaleTimeString("fr-FR", { timeZone: "Asia/Kolkata" });

      // Convert to New York time (America/New_York)
      const nyDate = date.toLocaleDateString("en-CA", { timeZone: "America/New_York" }) + ' ' + date.toLocaleTimeString("fr-FR", { timeZone: "America/New_York" });

      // Convert to CST Central timezone time (America/Chicago)
      const centralDate = date.toLocaleDateString("en-CA", { timeZone: "America/Chicago" }) + ' ' + date.toLocaleTimeString("fr-FR", { timeZone: "America/Chicago" });

      // Format the dates
      const utcString = `${padStringToFixedLength('UTC', 20)}: ${utcDate}`;
      const istString = `${padStringToFixedLength('IST', 20)}: ${istDate}`;
      const nyString = `${padStringToFixedLength('New York (US)', 20)}: ${nyDate}`;
      const centralString = `${padStringToFixedLength('Central (US)', 20)}: ${centralDate}`;

      // Display the results
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: showConversionResults,
        args: [selectedText, utcString, istString, nyString, centralString]
      });
    } else {
        showToast("Selected text is not a valid date format => " + selectedText, true);
    }
  }
});

// Function to show conversion results as an alert on the page
function showConversionResults(selectedText, utcString, istString, nyString, centralString) {
  // console.log(`${istString}\n\n${utcString}\n\n${nyString}\n\n${centralString}\n`);

  // Copy the UTC date to clipboard in the page context
  const input = document.createElement("textarea");
  input.value = `${istString}\n${utcString}\n${nyString}\n${centralString}`;
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);

  showToast(`Input ${selectedText}\n\n${istString}\n${utcString}\n${nyString}\n${centralString}`);
}

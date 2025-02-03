// Load shared utilities
importScripts('shared.js', 'constants.js', 'utils.js');

// Function to show toast in a tab
async function executeToastInTab(tabId, message, isError = false, position = null) {
    console.log('Showing toast with position:', position);
    await chrome.scripting.executeScript({
        target: { tabId },
        func: (message, isError, position) => {
            // Calculate optimal position for toast
            let toastPosition = 'center';
            let toastGravity = 'top';
            let offset = {};
            
            if (position) {
                // Get window dimensions
                const windowDims = {
                    width: window.innerWidth,
                    height: window.innerHeight
                };
                
                // Create a temporary toast to measure actual dimensions
                const tempToast = document.createElement('div');
                tempToast.style.visibility = 'hidden';
                tempToast.style.position = 'fixed';
                tempToast.style.padding = '12px 20px';
                tempToast.style.maxWidth = '400px';
                tempToast.innerHTML = message;
                document.body.appendChild(tempToast);
                const toastDims = {
                    width: Math.min(tempToast.offsetWidth, 400),
                    height: tempToast.offsetHeight
                };
                document.body.removeChild(tempToast);
                console.log('Toast dimensions:', toastDims);

                // Calculate optimal position using actual click position
                offset = calculateToastPosition(position, windowDims, toastDims);
                console.log('Final position:', offset);
                toastPosition = 'left';
                toastGravity = 'top';
            }

            Toastify({
                text: message,
                duration: 3000,
                close: true,
                gravity: toastGravity,
                position: toastPosition,
                offset: offset,
                style: {
                    background: isError ? "linear-gradient(to right, #FF416C, #FF4B2B)" : "linear-gradient(to right, #00b09b, #96c93d)",
                    'max-width': '400px',
                    'min-width': '200px',
                    width: 'auto',
                    padding: '12px 20px',
                    'border-radius': '8px',
                    'box-shadow': '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
                    'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
                    'white-space': 'pre-line',
                    'line-height': '1.5'
                },
                onClick: function() {
                    // Copy ISO date to clipboard when clicked
                    const isoDate = message.split('\n').find(line => line.startsWith('🔗'))?.substring(2);
                    if (isoDate) {
                        navigator.clipboard.writeText(isoDate).then(() => {
                            Toastify({
                                text: "✓ Copied to clipboard!",
                                duration: 2000,
                                gravity: "bottom",
                                position: "right",
                                style: {
                                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                                    'border-radius': '4px',
                                    'box-shadow': '0 2px 4px rgba(0,0,0,0.1)',
                                    padding: '8px 16px'
                                }
                            }).showToast();
                        });
                    }
                },
                stopOnFocus: true
            }).showToast();
        },
        args: [message, isError, position]
    });
}

// Function to inject scripts into a tab
async function injectScriptsIntoTab(tabId) {
    await chrome.scripting.insertCSS({
        target: { tabId },
        files: ['toastify.css']
    });
    
    await chrome.scripting.executeScript({
        target: { tabId },
        files: ['toastify.js']
    });
}

// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "convertDate",
        title: "Convert Date",
        contexts: ["selection"],
        visible: false
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "convertDate") {
        // Get position from content script before handling conversion
        chrome.tabs.sendMessage(tab.id, { type: "getContextMenuPosition" }, async (response) => {
            if (response && response.position) {
                await handleDateConversion(info.selectionText, tab.id, response.position);
            } else {
                await handleDateConversion(info.selectionText, tab.id, null);
            }
        });
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "updateContextMenu") {
        const date = parseDateString(request.selectedText);
        chrome.contextMenus.update("convertDate", {
            visible: !isNaN(date)
        });

    }
});


// Handle date conversion
async function handleDateConversion(selectedText, tabId, position) {
    if (!selectedText || !tabId) {
        console.error('Missing required parameters:', { selectedText, tabId });
        return;
    }

    try {
        // First inject necessary scripts
        await injectScriptsIntoTab(tabId);

        // Parse the date
        const date = parseDateString(selectedText);
        if (isNaN(date)) {
            await executeToastInTab(tabId, '❌ Invalid date format', true, position);
            return;
        }

        // Format the date and show toast
        const isoDate = date.toISOString();
        
        // Get timezone info
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localDate = date.toLocaleString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timeZone,
            timeZoneName: 'short'
        });
        
        const message = `✓ "${selectedText}"\n→ ${localDate}\n🌐 ${timeZone}\n🔗 ${isoDate}`;
        await executeToastInTab(tabId, message, false, position);
    } catch (error) {
        console.error('Date conversion failed:', error);
        const errorMessage = error.message || error.toString();
        try {
            await executeToastInTab(tabId, `❌ Error: ${errorMessage}`, true, position);
        } catch (toastError) {
            console.error('Failed to show error toast:', toastError);
        }
    }
}

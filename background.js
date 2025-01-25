// Load shared utilities
importScripts('shared.js', 'constants.js', 'utils.js');

// Function to show toast in a tab
async function executeToastInTab(tabId, message, isError = false) {
    await chrome.scripting.executeScript({
        target: { tabId },
        func: (message, isError) => {
            Toastify({
                text: message,
                duration: 3000,
                close: false,
                gravity: "top",
                position: "center",
                style: {
                    background: isError ? "#FF0000" : "#4CAF50"
                },
                stopOnFocus: true
            }).showToast();
        },
        args: [message, isError]
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
        contexts: ["selection"]
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "convertDate") {
        handleDateConversion(info.selectionText, tab.id);
    }
});

// Handle date conversion
async function handleDateConversion(selectedText, tabId) {
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
            await executeToastInTab(tabId, 'Invalid date format', true);
            return;
        }

        // Format the date
        const isoDate = date.toISOString();
        const message = `Converted date: ${date.toLocaleString()}`;

        // Execute in content script context
        await chrome.scripting.executeScript({
            target: { tabId },
            func: async (isoDate, message) => {
                try {
                    await navigator.clipboard.writeText(isoDate);
                    Toastify({
                        text: message,
                        duration: 3000,
                        close: false,
                        gravity: "top",
                        position: "center",
                        style: {
                            background: "#4CAF50"
                        },
                        stopOnFocus: true
                    }).showToast();
                } catch (error) {
                    console.error('Clipboard operation failed:', error);
                    Toastify({
                        text: 'Failed to copy to clipboard',
                        duration: 3000,
                        close: false,
                        gravity: "top",
                        position: "center",
                        style: {
                            background: "#FF0000"
                        },
                        stopOnFocus: true
                    }).showToast();
                }
            },
            args: [isoDate, message]
        });
    } catch (error) {
        console.error('Date conversion failed:', error);
        try {
            await executeToastInTab(tabId, 'Failed to convert date', true);
        } catch (toastError) {
            console.error('Failed to show error toast:', toastError);
        }
    }
}

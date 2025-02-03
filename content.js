// Track context menu position
let lastContextMenuPosition = { x: 0, y: 0 };

// Listen for context menu events
document.addEventListener('contextmenu', (e) => {
    // Store the exact screen coordinates
    lastContextMenuPosition = {
        x: e.clientX,
        y: e.clientY
    };
    console.log('Context menu opened at:', lastContextMenuPosition);
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "showToast") {
        showToast(request.message, request.isError, lastContextMenuPosition.x, lastContextMenuPosition.y);
        sendResponse({success: true});
    } else if (request.type === "getContextMenuPosition") {
        sendResponse({position: lastContextMenuPosition});
    }
    return true;
});

// Add selection event handler
let lastSelectedText = '';
document.addEventListener('selectionchange', () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText && selectedText !== lastSelectedText) {
        lastSelectedText = selectedText;
        chrome.runtime.sendMessage({
            type: "updateContextMenu",
            selectedText: selectedText
        });
    }
});

// Listen for date conversion toast events
window.addEventListener('showDateConversionToast', (event) => {
  showToast(event.detail.message, false, lastContextMenuPosition.x, lastContextMenuPosition.y);
});

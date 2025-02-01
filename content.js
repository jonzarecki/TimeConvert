// Track context menu position
let menuX = null;
let menuY = null;

// Listen for context menu events
document.addEventListener('contextmenu', (e) => {
    menuX = e.clientX;
    menuY = e.clientY;
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "showToast") {
        showToast(request.message, request.isError, menuX, menuY);
        sendResponse({success: true});
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
  showToast(event.detail.message, false, menuX, menuY);
});

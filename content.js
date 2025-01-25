// Ensure showToast is defined in the global scope
// No import needed, as showToast is available globally.

// Keep track of processed text content
const processedContent = new Set();

// Function to check if an element is visible
function isVisible(element) {
    if (!element) return false;
    
    try {
        const style = window.getComputedStyle(element);
        return style &&
               style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               parseFloat(style.opacity) > 0;
    } catch (e) {
        return true; // If we can't determine visibility, assume it's visible
    }
}

// Function to check if a node has already been processed
function isProcessed(node) {
    if (!node || !node.textContent) return false;
    return processedContent.has(node.textContent.trim());
}

// Function to mark a node as processed
function markProcessed(node) {
    if (node && node.textContent) {
        processedContent.add(node.textContent.trim());
    }
}

// Generic function to highlight text based on regex and CSS class
function highlightText(textNode, regex, cssClass) {
    const text = textNode.textContent;
    const matches = text.match(regex);
    
    if (!matches || isProcessed(textNode)) return;
    
    // Mark this text as processed
    markProcessed(textNode);
    
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    
    // Use exec to get all matches with their positions
    let match;
    regex = new RegExp(regex, 'g');  // Ensure we have the global flag
    
    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        
        // Create highlighted span for the match
        const highlightSpan = document.createElement('span');
        highlightSpan.className = cssClass;
        highlightSpan.textContent = match[0];
        fragment.appendChild(highlightSpan);
        
        lastIndex = regex.lastIndex;
    }
    
    // Add any remaining text after the last match
    if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    
    // Replace the original text node with our fragment
    if (textNode.parentNode) {
        textNode.parentNode.replaceChild(fragment, textNode);
    }
}

// Function to process text nodes for date and time highlighting
function processTextNode(textNode) {
    const dateRegex = /\b(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2} \w+ \d{4}|\w+ \d{1,2}, \d{4}|\d{1,2} \w+ \d{2}|\w+ \d{1,2} \w+ \d{2})\b/g;
    const timeZoneRegex = /\b(?:\d{1,2}(?::\d{2})?(?::\d{2})?\s*(?:am|pm)?\s+)?(?:(?:GMT|UTC|EST|EDT|CST|CDT|MST|MDT|PST|PDT|AKST|AKDT|HST|HDT|AST|ADT|BST|WET|WEST|CET|CEST|EET|EEST|IST|PKT|NPT|BTT|JST|KST|PHT|IDT|SGT|AWST|ACST|AEST|AEDT|NZST|NZDT|[A-Y])|(?:[A-Za-z]+\s*(?:Standard|Daylight|Summer)?\s*Time))\b/i;
    highlightText(textNode, dateRegex, 'highlight-yellow');
    highlightText(textNode, timeZoneRegex, 'highlight-green');
}

// Function to walk through DOM nodes
function walkDOM(node) {
    if (!node) return;
    
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
        if (!isProcessed(node) && isVisible(node.parentElement)) {
            processTextNode(node);
        }
        return;
    }
    
    // Skip script and style elements
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') {
        return;
    }
    
    // Process child nodes
    const children = Array.from(node.childNodes);
    children.forEach(child => walkDOM(child));
}

// Single observer instance
let observer = null;
let isProcessing = false;

// Function to initialize highlighting
function initializeHighlighting() {
    // Clear the processed content set
    processedContent.clear();
    
    // Clean up any existing observer
    if (observer) {
        observer.disconnect();
        observer = null;
    }

    // Initial highlight
    console.log('Initial processing of document body');
    walkDOM(document.body);

    // Create new observer
    observer = new MutationObserver(mutations => {
        if (isProcessing) return;
        isProcessing = true;
        
        try {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && !isProcessed(node)) {
                            walkDOM(node);
                        }
                    });
                }
            });
        } finally {
            isProcessing = false;
        }
    });

    // Start observing with more specific config
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// Function to ensure observer is running
function ensureObserverIsActive() {
    if (!observer) {
        console.log('Reinitializing observer...');
        initializeHighlighting();
        return;
    }

    // Check if any highlighted content exists
    const highlightedElements = document.querySelectorAll('.highlight-yellow, .highlight-green');
    if (highlightedElements.length === 0) {
        console.log('No highlights found, reprocessing...');
        initializeHighlighting();
    }
}

// Initialize only once when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHighlighting, { once: true });
} else {
    initializeHighlighting();
}

// Periodically check if observer is still active and highlights exist
setInterval(ensureObserverIsActive, 5000);  // Check every 5 seconds

// Handle Gmail's specific events
document.addEventListener('load', initializeHighlighting, true);
window.addEventListener('hashchange', initializeHighlighting);  // For Gmail navigation
window.addEventListener('popstate', initializeHighlighting);    // For browser navigation

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "showToast") {
    showToast(request.message, request.isError);
    sendResponse({success: true});
  }
  return true; // Keep the message channel open for sendResponse
});

// Add CSS for highlighting
const style = document.createElement('style');
style.innerHTML = `
    .highlight-yellow { 
        background-color: yellow; 
        color: black; 
    }
    .highlight-green { 
        background-color: green; 
        color: white; 
    }
`;
document.head.appendChild(style);

// Add selection event handler
document.addEventListener('selectionchange', () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    chrome.runtime.sendMessage({
      type: "updateContextMenu",
      selectedText: selectedText
    });
  }
});

// Listen for date conversion toast events
window.addEventListener('showDateConversionToast', (event) => {
  showToast(event.detail.message);
});

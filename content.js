// Keep track of processed text content
const processedContent = new Set();

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
    
    markProcessed(textNode);
    
    try {
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        
        regex = new RegExp(regex, 'g');
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }
            
            const highlightSpan = document.createElement('span');
            highlightSpan.className = cssClass;
            highlightSpan.textContent = match[0];
            fragment.appendChild(highlightSpan);
            
            lastIndex = regex.lastIndex;
        }
        
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        
        if (textNode.parentNode) {
            textNode.parentNode.replaceChild(fragment, textNode);
        }
    } catch (error) {
        handleError(error, 'highlightText');
    }
}

// Function to process text nodes for date and time highlighting
function processTextNode(textNode) {
    highlightText(textNode, DATE_PATTERNS.DATE_REGEX, CSS_CLASSES.DATE_HIGHLIGHT);
    highlightText(textNode, DATE_PATTERNS.TIME_ZONE_REGEX, CSS_CLASSES.TIMEZONE_HIGHLIGHT);
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
    
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') {
        return;
    }
    
    Array.from(node.childNodes).forEach(walkDOM);
}

// Single observer instance
let observer = null;
let isProcessing = false;

// Function to initialize highlighting
function initializeHighlighting() {
    processedContent.clear();
    
    if (observer) {
        observer.disconnect();
        observer = null;
    }

    console.log('Initial processing of document body');
    walkDOM(document.body);

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
        } catch (error) {
            handleError(error, 'MutationObserver');
        } finally {
            isProcessing = false;
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// Function to ensure observer is active
function ensureObserverIsActive() {
    if (!observer) {
        console.log('Reinitializing observer...');
        initializeHighlighting();
        return;
    }

    const highlightedElements = document.querySelectorAll(
        `.${CSS_CLASSES.DATE_HIGHLIGHT}, .${CSS_CLASSES.TIMEZONE_HIGHLIGHT}`
    );
    if (highlightedElements.length === 0) {
        console.log('No highlights found, reprocessing...');
        initializeHighlighting();
    }
}

// Initialize when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHighlighting, { once: true });
} else {
    initializeHighlighting();
}

// Periodically check observer status
setInterval(ensureObserverIsActive, TIME_CONSTANTS.CHECK_INTERVAL_MS);

// Handle Gmail's specific events
document.addEventListener('load', initializeHighlighting, true);
window.addEventListener('hashchange', initializeHighlighting);
window.addEventListener('popstate', initializeHighlighting);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "showToast") {
        showToast(request.message, request.isError);
        sendResponse({success: true});
    }
    return true;
});

// Add CSS for highlighting
const style = document.createElement('style');
style.innerHTML = `
    .${CSS_CLASSES.DATE_HIGHLIGHT} { 
        background-color: yellow; 
        color: black; 
    }
    .${CSS_CLASSES.TIMEZONE_HIGHLIGHT} { 
        background-color: green; 
        color: white; 
    }
`;
document.head.appendChild(style);

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
  showToast(event.detail.message);
});

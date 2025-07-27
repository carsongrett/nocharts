// ===== UI MANIPULATION FUNCTIONS =====

/**
 * Show loading overlay
 * @param {string} message - Optional loading message
 */
function showLoading(message = 'Researching...') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = loadingOverlay.querySelector('.loading-text');
    
    if (loadingText) {
        loadingText.textContent = message;
    }
    
    loadingOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Show error modal
 * @param {string} message - Error message to display
 * @param {Function} onClose - Optional callback when modal is closed
 */
function showError(message, onClose = null) {
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const errorClose = document.getElementById('errorClose');
    
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    
    errorModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Handle close button click
    const handleClose = () => {
        hideError();
        if (onClose) onClose();
    };
    
    errorClose.onclick = handleClose;
    
    // Handle clicking outside modal
    errorModal.onclick = (e) => {
        if (e.target === errorModal) {
            handleClose();
        }
    };
    
    // Auto-hide after timeout
    setTimeout(() => {
        if (errorModal.classList.contains('active')) {
            handleClose();
        }
    }, CONFIG.ERROR_DISPLAY_TIME);
}

/**
 * Hide error modal
 */
function hideError() {
    const errorModal = document.getElementById('errorModal');
    errorModal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Show success message
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
function showSuccess(message, duration = 3000) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-success';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1002;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after duration
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

/**
 * Update search input value
 * @param {string} value - Value to set
 */
function updateSearchInput(value) {
    const searchInput = document.getElementById('tickerInput');
    if (searchInput) {
        searchInput.value = value;
    }
}

/**
 * Focus search input
 */
function focusSearchInput() {
    const searchInput = document.getElementById('tickerInput');
    if (searchInput) {
        searchInput.focus();
    }
}

/**
 * Clear search input
 */
function clearSearchInput() {
    updateSearchInput('');
}

/**
 * Disable search form
 */
function disableSearchForm() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('tickerInput');
    const searchButton = searchForm.querySelector('.search-button');
    
    if (searchInput) searchInput.disabled = true;
    if (searchButton) searchButton.disabled = true;
}

/**
 * Enable search form
 */
function enableSearchForm() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('tickerInput');
    const searchButton = searchForm.querySelector('.search-button');
    
    if (searchInput) searchInput.disabled = false;
    if (searchButton) searchButton.disabled = false;
}

/**
 * Add loading state to button
 * @param {HTMLElement} button - Button element
 * @param {string} loadingText - Text to show while loading
 */
function addButtonLoading(button, loadingText = 'Loading...') {
    if (!button) return;
    
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `
        <div class="loading-spinner" style="width: 16px; height: 16px; margin-right: 8px;"></div>
        ${loadingText}
    `;
    button.disabled = true;
    button.classList.add('loading');
}

/**
 * Remove loading state from button
 * @param {HTMLElement} button - Button element
 */
function removeButtonLoading(button) {
    if (!button) return;
    
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
    }
    button.disabled = false;
    button.classList.remove('loading');
}

/**
 * Update page title
 * @param {string} title - New page title
 */
function updatePageTitle(title) {
    if (title) {
        document.title = `${title} - ${CONFIG.APP_NAME}`;
    } else {
        document.title = CONFIG.APP_NAME;
    }
}

/**
 * Update meta description
 * @param {string} description - New meta description
 */
function updateMetaDescription(description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
        metaDescription.setAttribute('content', description);
    }
}

/**
 * Scroll to element smoothly
 * @param {string|HTMLElement} element - Element to scroll to
 * @param {number} offset - Optional offset from top
 */
function scrollToElement(element, offset = 0) {
    const target = typeof element === 'string' ? document.querySelector(element) : element;
    if (target) {
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Scroll to top smoothly
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Add CSS animation keyframes
 */
function addAnimationKeyframes() {
    if (!document.getElementById('nocharts-animations')) {
        const style = document.createElement('style');
        style.id = 'nocharts-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes pulse {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
                100% {
                    transform: scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Add fade-in animation to element
 * @param {HTMLElement} element - Element to animate
 * @param {number} delay - Delay in milliseconds
 */
function addFadeInAnimation(element, delay = 0) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, delay);
}

/**
 * Add pulse animation to element
 * @param {HTMLElement} element - Element to animate
 * @param {number} duration - Duration in milliseconds
 */
function addPulseAnimation(element, duration = 1000) {
    if (!element) return;
    
    element.style.animation = `pulse ${duration}ms ease-in-out`;
    
    setTimeout(() => {
        element.style.animation = '';
    }, duration);
}

/**
 * Show/hide element with fade animation
 * @param {HTMLElement} element - Element to show/hide
 * @param {boolean} show - Whether to show or hide
 * @param {number} duration - Animation duration in milliseconds
 */
function toggleElement(element, show, duration = 300) {
    if (!element) return;
    
    if (show) {
        element.style.display = '';
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    } else {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }
}

/**
 * Update popular ticker buttons
 * @param {Array} tickers - Array of ticker symbols
 */
function updatePopularTickers(tickers = CONFIG.POPULAR_TICKERS) {
    const tickerButtons = document.querySelector('.ticker-buttons');
    if (!tickerButtons) return;
    
    tickerButtons.innerHTML = '';
    
    tickers.forEach(ticker => {
        const button = document.createElement('button');
        button.className = 'ticker-button';
        button.textContent = ticker;
        button.dataset.ticker = ticker;
        button.onclick = () => {
            updateSearchInput(ticker);
            document.getElementById('searchForm').dispatchEvent(new Event('submit'));
        };
        tickerButtons.appendChild(button);
    });
}

/**
 * Initialize UI animations
 */
function initializeUI() {
    addAnimationKeyframes();
    
    // Add fade-in animation to hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        addFadeInAnimation(hero, 100);
    }
    
    // Add fade-in animation to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        addFadeInAnimation(card, 200 + (index * 100));
    });
}

/**
 * Handle keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            focusSearchInput();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            hideError();
            hideLoading();
        }
    });
}

// Export UI functions
window.UI = {
    showLoading,
    hideLoading,
    showError,
    hideError,
    showSuccess,
    updateSearchInput,
    focusSearchInput,
    clearSearchInput,
    disableSearchForm,
    enableSearchForm,
    addButtonLoading,
    removeButtonLoading,
    updatePageTitle,
    updateMetaDescription,
    scrollToElement,
    scrollToTop,
    addFadeInAnimation,
    addPulseAnimation,
    toggleElement,
    updatePopularTickers,
    initializeUI,
    setupKeyboardShortcuts
}; 
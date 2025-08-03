// ===== MAIN APPLICATION LOGIC =====

// Global state
let currentStockData = null;
let isLoading = false;

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('Initializing NoCharts application...');
    
    // Add mock mode indicator to the page
    if (CONFIG.MOCK_MODE) {
        const mockIndicator = document.createElement('div');
        mockIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff6b6b;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        mockIndicator.textContent = '🔧 MOCK MODE';
        mockIndicator.title = 'Using mock data - no API calls';
        document.body.appendChild(mockIndicator);
    }
    
    // Check if UI is available
    if (typeof UI === 'undefined') {
        console.error('UI object not available, retrying in 100ms...');
        setTimeout(initializeApp, 100);
        return;
    }
    
    // Initialize UI
    UI.initializeUI();
    UI.setupKeyboardShortcuts();
    UI.setupMetricPopups();
    
    // Setup theme
    setupTheme();
    
    // Handle OAuth callback if present
    handleOAuthCallback();
    
    // Set up event listeners
    setupEventListeners();
    
    // Validate API keys
    validateApiConfiguration();
    
    // Focus search input on load
    setTimeout(() => {
        UI.focusSearchInput();
    }, 500);
    
    console.log('NoCharts application initialized successfully');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Search form submission
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }
    
    // Popular ticker buttons
    const tickerButtons = document.querySelectorAll('.ticker-button');
    tickerButtons.forEach(button => {
        button.addEventListener('click', handleTickerButtonClick);
    });
    
    // Search input events
    const searchInput = document.getElementById('tickerInput');
    if (searchInput) {
        // Debounced search suggestions
        const debouncedSearch = Utils.debounce(handleSearchInput, 300);
        searchInput.addEventListener('input', debouncedSearch);
        
        // Enter key handling
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchSubmit(e);
            }
        });
    }
    
    // Window events
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
}

/**
 * Handle search form submission
 * @param {Event} event - Form submission event
 */
async function handleSearchSubmit(event) {
    event.preventDefault();
    
    const searchInput = document.getElementById('tickerInput');
    const ticker = searchInput.value.trim();
    
    if (!ticker) {
        UI.showError('Please enter a stock ticker symbol');
        return;
    }
    
    if (!Utils.isValidTicker(ticker)) {
        UI.showError('Please enter a valid stock ticker symbol (1-5 letters)');
        return;
    }
    
    await searchStock(ticker);
}

/**
 * Handle ticker button clicks
 * @param {Event} event - Button click event
 */
async function handleTickerButtonClick(event) {
    const ticker = event.target.dataset.ticker;
    if (ticker) {
        UI.updateSearchInput(ticker);
        await searchStock(ticker);
    }
}

/**
 * Handle search input changes
 * @param {Event} event - Input event
 */
function handleSearchInput(event) {
    const value = event.target.value.trim();
    
    // Basic validation feedback
    if (value && !Utils.isValidTicker(value)) {
        event.target.classList.add('error');
    } else {
        event.target.classList.remove('error');
    }
}

/**
 * Main stock search function
 * @param {string} ticker - Stock ticker symbol
 */
async function searchStock(ticker) {
    if (isLoading) {
        console.log('Search already in progress, ignoring request');
        return;
    }
    
    const formattedTicker = Utils.formatTicker(ticker);
    
    try {
        isLoading = true;
        
        // Update UI
        UI.showLoading(`Researching ${formattedTicker}...`);
        UI.disableSearchForm();
        UI.updatePageTitle(formattedTicker);
        
        console.log(`Searching for stock: ${formattedTicker}`);
        
        // Get comprehensive stock data
        const stockData = await API.getComprehensiveStockData(formattedTicker);
        
        // Process the data
        const processedData = processStockData(stockData);
        
        // Store current data
        currentStockData = processedData;
        
        // Show success message
        UI.showSuccess(`Research completed for ${formattedTicker}`);
        
        // Update URL (for future navigation)
        updateURL(formattedTicker);
        
        // Redirect to ticker page
        window.location.href = `ticker.html?ticker=${formattedTicker}`;
        
    } catch (error) {
        console.error('Search failed:', error);
        handleSearchError(error, formattedTicker);
    } finally {
        isLoading = false;
        UI.hideLoading();
        UI.enableSearchForm();
    }
}

/**
 * Process stock data from API
 * @param {Object} stockData - Raw stock data from API
 * @returns {Object} - Processed stock data
 */
function processStockData(stockData) {
    const processed = {
        symbol: stockData.symbol,
        overview: stockData.overview ? DataProcessor.processStockOverview(stockData.overview) : null,
        quote: stockData.quote ? DataProcessor.processStockQuote(stockData.quote) : null,
        news: stockData.news ? DataProcessor.processNewsArticles(stockData.news) : [],
        lastUpdated: stockData.lastUpdated
    };
    
    // Add formatted display data
    processed.display = DataProcessor.formatStockDataForDisplay(processed);
    
    // Add news summary
    processed.newsSummary = DataProcessor.getNewsSummary(processed.news);
    
    // Add timeline
    processed.timeline = DataProcessor.createTimeline(processed.news);
    
    return processed;
}

/**
 * Display stock results (placeholder for Phase 2)
 * @param {Object} stockData - Processed stock data
 */
function displayStockResults(stockData) {
    console.log('Stock data received:', stockData);
    
    // For Phase 1, just show a success message
    // In Phase 2, this will create and display the ticker page
    
    const message = `
        Found data for ${stockData.symbol}:
        - Company: ${stockData.display.name}
        - Price: ${stockData.display.price}
        - News articles: ${stockData.news.length}
        - Last updated: ${stockData.lastUpdated}
    `;
    
    console.log(message);
    
    // Show a simple alert for now (will be replaced with proper UI in Phase 2)
    alert(`Research completed!\n\n${stockData.display.name} (${stockData.symbol})\nPrice: ${stockData.display.price}\nNews articles found: ${stockData.news.length}`);
}

/**
 * Handle search errors
 * @param {Error} error - Error object
 * @param {string} ticker - Stock ticker that was searched
 */
function handleSearchError(error, ticker) {
    let errorMessage = 'An error occurred while researching the stock.';
    
    if (error.message.includes('rate limit')) {
        errorMessage = 'API rate limit exceeded. Please try again in a few minutes.';
    } else if (error.message.includes('not found') || error.message.includes('Invalid API call')) {
        errorMessage = `Stock ticker "${ticker}" not found. Please check the symbol and try again.`;
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.message.includes('API key')) {
        errorMessage = 'API configuration error. Please check your API keys.';
    } else if (error.message.includes('No Reddit access token')) {
        errorMessage = 'Reddit authentication required. You will be redirected to authorize access.';
        console.log('🔗 Redirecting to Reddit OAuth...');
        // The OAuth redirect will happen automatically in the API layer
        return; // Don't show error message since redirect is expected
    } else if (error.message.includes('OAuth') || error.message.includes('redirect')) {
        errorMessage = 'Authentication in progress. Please complete the authorization process.';
        console.log('🔄 OAuth flow in progress...');
        return; // Don't show error message since redirect is expected
    }
    
    UI.showError(errorMessage);
}

/**
 * Handle OAuth callback if present in URL
 */
function handleOAuthCallback() {
    // Check for access token in URL fragment (implicit flow)
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get('access_token');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
        console.log('❌ OAuth error detected:', error);
        UI.showError(`Authentication failed: ${error}`);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }
    
    if (accessToken && state) {
        console.log('🔄 OAuth callback detected, processing...');
        
        // Show loading message
        UI.showLoading('Completing authentication...');
        
        // The API layer will handle the token storage automatically
        // when getRedditAccessToken() is called
        setTimeout(() => {
            UI.hideLoading();
            UI.showSuccess('Authentication completed successfully!');
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 1000);
    }
}

/**
 * Validate API configuration
 */
function validateApiConfiguration() {
    const validation = API.validateApiKeys();
    
    if (validation.message) {
        console.warn('API Configuration Warning:', validation.message);
        
        // Show warning in console for development
        if (validation.message.includes('not configured')) {
            console.warn('💡 Tip: Add your API keys to js/config.js to enable full functionality');
        }
    }
}

/**
 * Update URL with ticker (for future navigation)
 * @param {string} ticker - Stock ticker
 */
function updateURL(ticker) {
    const url = new URL(window.location);
    url.searchParams.set('ticker', ticker);
    window.history.pushState({}, '', url);
}

/**
 * Handle before unload event
 * @param {Event} event - Before unload event
 */
function handleBeforeUnload(event) {
    // Removed leave site warning - not needed for this app
    // Users should be able to navigate freely
}

/**
 * Handle online event
 */
function handleOnline() {
    console.log('Connection restored');
    UI.showSuccess('Connection restored');
}

/**
 * Handle offline event
 */
function handleOffline() {
    console.log('Connection lost');
    UI.showError('Connection lost. Some features may not work.');
}

/**
 * Get current stock data
 * @returns {Object|null} - Current stock data or null
 */
function getCurrentStockData() {
    return currentStockData;
}

/**
 * Clear current stock data
 */
function clearCurrentStockData() {
    currentStockData = null;
    UI.updatePageTitle('');
    updateURL('');
}

/**
 * Theme functionality
 */
function setupTheme() {
    const currentTheme = localStorage.getItem('nocharts-theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('nocharts-theme', newTheme);
    
    UI.addPulseAnimation(document.body, 300);
}

/**
 * Export main functions for debugging
 */

// Add testing utilities to console for development
window.NoChartsDebug = {
    // Clear all cache to force fresh API calls
    clearCache: () => {
        if (typeof API !== 'undefined' && API.clearAllCache) {
            API.clearAllCache();
            console.log('✅ Cache cleared');
        } else {
            console.log('❌ API not available');
        }
    },
    
    // Get cache statistics
    getCacheStats: () => {
        if (typeof API !== 'undefined' && API.getCacheStats) {
            const stats = API.getCacheStats();
            console.log('📊 Cache Stats:', stats);
            return stats;
        } else {
            console.log('❌ API not available');
        }
    },
    
    // Test API with minimal calls
    testAPI: async (ticker = 'AAPL') => {
        console.log(`🧪 Testing API with ticker: ${ticker}`);
        if (typeof API === 'undefined') {
            console.error('❌ API not available');
            return;
        }
        try {
            const data = await API.getComprehensiveStockData(ticker);
            console.log('✅ API Test Successful:', data);
            return data;
        } catch (error) {
            console.error('❌ API Test Failed:', error);
            throw error;
        }
    },
    
    // Check API keys
    checkKeys: () => {
        if (typeof API !== 'undefined' && API.validateApiKeys) {
            const validation = API.validateApiKeys();
            console.log('🔑 API Key Status:', validation);
            return validation;
        } else {
            console.log('❌ API not available');
        }
    },
    
    // Test Finnhub API only
    testFinnhub: async (ticker = 'AAPL') => {
        console.log(`🧪 Testing Finnhub API with ticker: ${ticker}`);
        if (typeof API === 'undefined') {
            console.error('❌ API not available');
            return;
        }
        try {
            const data = await API.getStockOverview(ticker);
            console.log('✅ Finnhub works:', data);
            return data;
        } catch (error) {
            console.error('❌ Finnhub failed:', error);
            throw error;
        }
    },
    
    // Test News API directly
    testNewsAPI: async () => {
        console.log('🧪 Testing News API directly...');
        if (typeof CONFIG === 'undefined') {
            console.error('❌ CONFIG not available');
            return;
        }
        try {
            const url = `https://newsapi.org/v2/everything?q=AAPL&pageSize=1&apiKey=${CONFIG.NEWS_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log('✅ News API works:', data);
            return data;
        } catch (error) {
            console.error('❌ News API failed:', error);
            throw error;
        }
    },
    
    // Test CORS with different approach
    testCORS: async () => {
        console.log('🧪 Testing CORS issues...');
        if (typeof CONFIG === 'undefined') {
            console.error('❌ CONFIG not available');
            return;
        }
        try {
            // Test without custom headers (which might trigger CORS preflight)
            const response = await fetch(`https://newsapi.org/v2/everything?q=AAPL&pageSize=1&apiKey=${CONFIG.NEWS_API_KEY}`, {
                method: 'GET',
                mode: 'cors'
            });
            const data = await response.json();
            console.log('✅ CORS test successful:', data);
            return data;
        } catch (error) {
            console.error('❌ CORS test failed:', error);
            throw error;
        }
    }
};

    console.log('🛠️ NoCharts Debug Tools Available:');
    console.log('  - NoChartsDebug.clearCache() - Clear all cache');
    console.log('  - NoChartsDebug.getCacheStats() - Get cache statistics');
    console.log('  - NoChartsDebug.testAPI("TICKER") - Test API with ticker');
    console.log('  - NoChartsDebug.checkKeys() - Check API key status');
    console.log('  - NoChartsDebug.testFinnhub("TICKER") - Test Finnhub only');
    console.log('  - NoChartsDebug.testNewsAPI() - Test News API directly');
    console.log('  - NoChartsDebug.testCORS() - Test CORS issues');

// Test if debug tools are working
console.log('✅ NoChartsDebug object created successfully');

// Show mock mode status
console.log('🔧 ===== MOCK MODE STATUS =====');
console.log('🔧 CONFIG.MOCK_MODE:', CONFIG.MOCK_MODE);
console.log('🔧 MockData available:', typeof MockData !== 'undefined');
console.log('🔧 CONFIG object available:', typeof CONFIG !== 'undefined');

if (CONFIG.MOCK_MODE) {
    console.log('🔧 ✅ MOCK MODE ENABLED - Using mock data instead of APIs');
    console.log('🔧 🚫 No API calls will be made');
} else {
    console.log('🌐 LIVE MODE - Using real APIs');
}
console.log('🔧 ==============================');
window.NoCharts = {
    initializeApp,
    searchStock,
    getCurrentStockData,
    clearCurrentStockData,
    processStockData,
    displayStockResults,
    setupTheme,
    toggleTheme
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Initialize app immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
} 
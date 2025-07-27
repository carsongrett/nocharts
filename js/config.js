// ===== CONFIGURATION FILE =====
// Add your API keys here

const CONFIG = {
    // API Keys
    ALPHA_VANTAGE_API_KEY: 'TNV5PE0PRBC456XO',
    NEWS_API_KEY: '5532986076b7449bad2768ba4eafd7fe',
    
    // API Endpoints
    ALPHA_VANTAGE_BASE_URL: 'https://www.alphavantage.co/query',
    NEWS_API_BASE_URL: 'https://newsapi.org/v2/everything',
    
    // App Settings
    APP_NAME: 'NoCharts',
    APP_VERSION: '1.0.0',
    
    // Cache Settings
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
    
    // Rate Limiting
    MAX_REQUESTS_PER_MINUTE: 5,
    
    // UI Settings
    LOADING_TIMEOUT: 30000, // 30 seconds
    ERROR_DISPLAY_TIME: 5000, // 5 seconds
    
    // Popular Tickers (for quick access)
    POPULAR_TICKERS: ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX'],
    
    // Feature Flags
    FEATURES: {
        NEWS_ENABLED: true,
        SENTIMENT_ENABLED: true,
        TIMELINE_ENABLED: true,
        CACHING_ENABLED: true
    },
    
    // Mock Data Mode (set to true to use mock data instead of APIs)
    MOCK_MODE: true
};

// Prevent modification of config object
Object.freeze(CONFIG);
Object.freeze(CONFIG.FEATURES);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 
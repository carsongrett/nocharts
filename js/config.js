// ===== CONFIGURATION FILE =====
// Add your API keys here

const CONFIG = {
    // API Keys
    FINNHUB_API_KEY: 'd23c7j1r01qgiro31s40d23c7j1r01qgiro31s4g',
    MARKETAUX_API_KEY: '4HYcOdj8vPGM4Zf1AQVLmOjweu9OBrtwLRjZOCYt',
    
    // API Endpoints
    FINNHUB_BASE_URL: 'https://finnhub.io/api/v1',
    MARKETAUX_BASE_URL: 'https://api.marketaux.com/v1',
    WIKIPEDIA_BASE_URL: 'https://en.wikipedia.org/api/rest_v1',
    
    // App Settings
    APP_NAME: 'NoCharts',
    APP_VERSION: '1.0.0',
    
    // Cache Settings
    CACHE_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
    
    // Rate Limiting
    MAX_REQUESTS_PER_MINUTE: 20,
    
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
    MOCK_MODE: false
};

// Prevent modification of config object
Object.freeze(CONFIG);
Object.freeze(CONFIG.FEATURES);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 
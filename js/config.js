// ===== CONFIGURATION FILE =====
// Add your API keys here

const CONFIG = {
    // API Keys
    FINNHUB_API_KEY: 'd23c7j1r01qgiro31s40d23c7j1r01qgiro31s4g',
    NEWS_API_KEY: '5532986076b7449bad2768ba4eafd7fe',
    
    // Reddit OAuth Configuration
    REDDIT_CLIENT_ID: '7SDzEZrEp4brTFp4eG9-wg',
    REDDIT_CLIENT_SECRET: 'BQICk0-7tYN53FPj1hrN--CC0NKOCQ',
    REDDIT_REDIRECT_URI: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? `${window.location.origin}/reddit-data-test.html`
        : 'https://carsongrett.github.io/nocharts/reddit-data-test.html',
    REDDIT_AUTH_URL: 'https://www.reddit.com/api/v1/authorize',
    REDDIT_TOKEN_URL: 'https://www.reddit.com/api/v1/access_token',
    REDDIT_API_BASE: 'https://oauth.reddit.com',
    
    // API Endpoints
    FINNHUB_BASE_URL: 'https://finnhub.io/api/v1',
    NEWS_API_BASE_URL: 'https://newsapi.org/v2/everything',
    
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
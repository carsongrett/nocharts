// ===== API HANDLING FUNCTIONS =====

/**
 * Make API request with error handling and caching
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {string} cacheKey - Optional cache key
 * @returns {Promise} - Promise with response data
 */
async function makeApiRequest(url, options = {}, cacheKey = null) {
    // Check if we're in mock mode and mock data is available
    if (CONFIG.MOCK_MODE && typeof MockData !== 'undefined') {
        console.log('🔧 Mock mode enabled, skipping API call:', url);
        throw new Error('API calls are disabled in mock mode. Use mock data instead.');
    }
    
    try {
        // Check rate limiting
        if (!Utils.checkRateLimit()) {
            throw new Error('Internal rate limit exceeded. Please try again later.');
        }
        
        // Check for rate limit in cache (to avoid repeated failed calls)
        if (cacheKey) {
            const rateLimitKey = `rate_limit_${cacheKey}`;
            const rateLimitTime = Utils.getCache(rateLimitKey);
            if (rateLimitTime) {
                const timeSinceLimit = Date.now() - rateLimitTime;
                if (timeSinceLimit < 60000) { // 1 minute cooldown
                    throw new Error('API rate limit exceeded. Please try again later.');
                } else {
                    // Clear rate limit cache after cooldown
                    Utils.clearCache(rateLimitKey);
                }
            }
        }
        
        // Check cache first
        if (cacheKey) {
            const cachedData = Utils.getCache(cacheKey);
            if (cachedData) {
                return cachedData;
            }
        }
        
        // Make the request
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // Don't add Content-Type for GET requests to avoid CORS preflight issues
                ...options.headers
            },
            ...options
        });
        
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse response
        const data = await response.json();
        
        // Cache the response
        if (cacheKey && data) {
            Utils.setCache(cacheKey, data);
        }
        
        return data;
        
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * Get stock profile from Finnhub
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with stock profile data
 */
async function getFinnhubStockProfile(symbol) {
    console.log('🔍 getFinnhubStockProfile called with symbol:', symbol);
    console.log('🔧 CONFIG.MOCK_MODE:', CONFIG.MOCK_MODE);
    console.log('🔧 MockData available:', typeof MockData !== 'undefined');
    
    // Use mock data if mock mode is enabled and available
    if (CONFIG.MOCK_MODE && typeof MockData !== 'undefined') {
        console.log('🔧 Using mock data for stock profile');
        try {
            return await MockData.getStockOverview(symbol);
        } catch (error) {
            console.error('Mock data failed, falling back to API:', error);
            // Continue to API call if mock data fails
        }
    }
    
    const formattedSymbol = Utils.formatTicker(symbol);
    const cacheKey = `finnhub_profile_${formattedSymbol}`;
    
    const url = `${CONFIG.FINNHUB_BASE_URL}/stock/profile2?symbol=${formattedSymbol}&token=${CONFIG.FINNHUB_API_KEY}`;
    
    try {
        const data = await makeApiRequest(url, {}, cacheKey);
        
        // Check for API error response
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
        
    } catch (error) {
        console.error('Failed to get Finnhub stock profile:', error);
        
        // Fallback to mock data if available
        if (typeof MockData !== 'undefined') {
            console.log('🔄 Falling back to mock data for stock profile');
            try {
                return MockData.getStockOverview(symbol);
            } catch (mockError) {
                console.error('Mock data fallback also failed:', mockError);
            }
        }
        
        throw error;
    }
}

/**
 * Get stock overview from Alpha Vantage (legacy - keeping for fallback)
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with stock data
 */
async function getStockOverview(symbol) {
    // Use Finnhub as primary, fallback to Alpha Vantage if needed
    try {
        return await getFinnhubStockProfile(symbol);
    } catch (error) {
        console.log('Finnhub failed, trying Alpha Vantage fallback...');
        // Fallback to Alpha Vantage implementation if needed
        throw error;
    }
}

/**
 * Get stock quote from Finnhub
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with quote data
 */
async function getFinnhubQuote(symbol) {
    console.log('🔍 getFinnhubQuote called with symbol:', symbol);
    console.log('🔧 CONFIG.MOCK_MODE:', CONFIG.MOCK_MODE);
    console.log('🔧 MockData available:', typeof MockData !== 'undefined');
    
    // Use mock data if mock mode is enabled and available
    if (CONFIG.MOCK_MODE && typeof MockData !== 'undefined') {
        console.log('🔧 Using mock data for stock quote');
        try {
            return await MockData.getStockQuote(symbol);
        } catch (error) {
            console.error('Mock data failed, falling back to API:', error);
            // Continue to API call if mock data fails
        }
    }
    
    const formattedSymbol = Utils.formatTicker(symbol);
    const cacheKey = `finnhub_quote_${formattedSymbol}`;
    
    const url = `${CONFIG.FINNHUB_BASE_URL}/quote?symbol=${formattedSymbol}&token=${CONFIG.FINNHUB_API_KEY}`;
    
    try {
        const data = await makeApiRequest(url, {}, cacheKey);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
        
    } catch (error) {
        console.error('Failed to get Finnhub quote:', error);
        
        // Fallback to mock data if available
        if (typeof MockData !== 'undefined') {
            console.log('🔄 Falling back to mock data for stock quote');
            try {
                return MockData.getStockQuote(symbol);
            } catch (mockError) {
                console.error('Mock data fallback also failed:', mockError);
            }
        }
        
        throw error;
    }
}

/**
 * Get stock quote from Alpha Vantage (legacy - keeping for fallback)
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with quote data
 */
async function getStockQuote(symbol) {
    // Use Finnhub as primary, fallback to Alpha Vantage if needed
    try {
        return await getFinnhubQuote(symbol);
    } catch (error) {
        console.log('Finnhub failed, trying Alpha Vantage fallback...');
        // Fallback to Alpha Vantage implementation if needed
        throw error;
    }
}

/**
 * Get company news from News API
 * @param {string} symbol - Stock symbol
 * @param {number} pageSize - Number of articles to fetch
 * @returns {Promise} - Promise with news data
 */
async function getCompanyNews(symbol, pageSize = 10, companyName = null) {
    console.log('🔍 getCompanyNews called with symbol:', symbol, 'pageSize:', pageSize);
    console.log('🔧 CONFIG.MOCK_MODE:', CONFIG.MOCK_MODE);
    console.log('🔧 MockData available:', typeof MockData !== 'undefined');
    
    // Use mock data if mock mode is enabled and available
    if (CONFIG.MOCK_MODE && typeof MockData !== 'undefined') {
        console.log('🔧 Using mock data for company news');
        try {
            return await MockData.getCompanyNews(symbol, pageSize);
        } catch (error) {
            console.error('Mock data failed, falling back to API:', error);
            // Continue to API call if mock data fails
        }
    }
    
    const formattedSymbol = Utils.formatTicker(symbol);
    const cacheKey = `company_news_${formattedSymbol}_${pageSize}`;
    
    // Use provided company name or fallback to symbol
    const searchTerm = companyName || formattedSymbol;
    
    const url = `${CONFIG.NEWS_API_BASE_URL}?q=${encodeURIComponent(searchTerm)}&pageSize=${pageSize}&sortBy=publishedAt&language=en&apiKey=${CONFIG.NEWS_API_KEY}`;
    
    try {
        // Check cache first
        const cachedData = Utils.getCache(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        
        // Check rate limiting
        if (!Utils.checkRateLimit()) {
            throw new Error('Internal rate limit exceeded. Please try again later.');
        }
        
        // Make News API request without problematic headers
        const response = await fetch(url, {
            method: 'GET',
            // No Content-Type header to avoid CORS issues
        });
        
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse response
        const data = await response.json();
        
        // Cache the response
        if (data && !data.status === 'error') {
            Utils.setCache(cacheKey, data.articles || []);
        }
        
        if (data.status === 'error') {
            throw new Error(data.message || 'News API error');
        }
        
        return data.articles || [];
        
    } catch (error) {
        console.error('Failed to get company news:', error);
        
        // If CORS error, try to provide helpful message
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            console.warn('CORS error with News API, falling back to mock data');
            // Return mock data as fallback
            if (typeof MockData !== 'undefined') {
                return MockData.getCompanyNews(symbol, pageSize);
            }
        }
        
        throw error;
    }
}

/**
 * Get earnings calendar from Alpha Vantage
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with earnings data
 */
async function getEarningsCalendar(symbol) {
    const formattedSymbol = Utils.formatTicker(symbol);
    const cacheKey = `earnings_${formattedSymbol}`;
    
    const url = `${CONFIG.ALPHA_VANTAGE_BASE_URL}?function=EARNINGS_CALENDAR&symbol=${formattedSymbol}&horizon=3month&apikey=${CONFIG.ALPHA_VANTAGE_API_KEY}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        
        // Parse CSV response
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const earnings = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const earning = {};
                headers.forEach((header, index) => {
                    earning[header.trim()] = values[index] ? values[index].trim() : '';
                });
                earnings.push(earning);
            }
        }
        
        // Cache the parsed data
        Utils.setCache(cacheKey, earnings);
        
        return earnings;
        
    } catch (error) {
        console.error('Failed to get earnings calendar:', error);
        throw error;
    }
}

/**
 * Get company search results from Alpha Vantage
 * @param {string} keywords - Search keywords
 * @returns {Promise} - Promise with search results
 */
async function searchCompanies(keywords) {
    const cacheKey = `company_search_${keywords.toLowerCase().replace(/\s+/g, '_')}`;
    
    const url = `${CONFIG.ALPHA_VANTAGE_BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${CONFIG.ALPHA_VANTAGE_API_KEY}`;
    
    try {
        const data = await makeApiRequest(url, {}, cacheKey);
        
        if (data['Error Message']) {
            throw new Error(data['Error Message']);
        }
        
        if (data['Note']) {
            // Cache rate limit to prevent repeated calls
            const rateLimitKey = `rate_limit_${cacheKey}`;
            Utils.setCache(rateLimitKey, Date.now(), 60000); // 1 minute cache
            throw new Error('API rate limit exceeded. Please try again later.');
        }
        
        return data.bestMatches || [];
        
    } catch (error) {
        console.error('Failed to search companies:', error);
        throw error;
    }
}

/**
 * Get market sentiment from Reddit (placeholder for future implementation)
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with sentiment data
 */
async function getRedditSentiment(symbol) {
    // This is a placeholder for future Reddit API integration
    // For now, return mock data
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                symbol: Utils.formatTicker(symbol),
                mentions: Math.floor(Math.random() * 100) + 10,
                sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
                confidence: Math.random() * 0.5 + 0.5,
                lastUpdated: new Date().toISOString()
            });
        }, 1000);
    });
}

/**
 * Get basic financials from Finnhub
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with basic financial data
 */
async function getFinnhubBasicFinancials(symbol) {
    console.log('🔍 getFinnhubBasicFinancials called with symbol:', symbol);
    console.log('🔧 CONFIG.MOCK_MODE:', CONFIG.MOCK_MODE);
    console.log('🔧 MockData available:', typeof MockData !== 'undefined');
    
    // Use mock data if mock mode is enabled and available
    if (CONFIG.MOCK_MODE && typeof MockData !== 'undefined') {
        console.log('🔧 Using mock data for basic financials');
        try {
            return await MockData.getStockOverview(symbol);
        } catch (error) {
            console.error('Mock data failed, falling back to API:', error);
            // Continue to API call if mock data fails
        }
    }
    
    const formattedSymbol = Utils.formatTicker(symbol);
    const cacheKey = `finnhub_basic_financials_${formattedSymbol}`;
    
    const url = `${CONFIG.FINNHUB_BASE_URL}/stock/metric?symbol=${formattedSymbol}&metric=all&token=${CONFIG.FINNHUB_API_KEY}`;
    
    try {
        const data = await makeApiRequest(url, {}, cacheKey);
        
        // Check for API error response
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
        
    } catch (error) {
        console.error('Failed to get Finnhub basic financials:', error);
        
        // Fallback to mock data if available
        if (typeof MockData !== 'undefined') {
            console.log('🔄 Falling back to mock data for basic financials');
            try {
                return MockData.getStockOverview(symbol);
            } catch (mockError) {
                console.error('Mock data fallback also failed:', mockError);
            }
        }
        
        throw error;
    }
}

/**
 * Get earnings data from Finnhub
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with earnings data
 */
async function getFinnhubEarnings(symbol) {
    console.log('🔍 getFinnhubEarnings called with symbol:', symbol);
    console.log('🔧 CONFIG.MOCK_MODE:', CONFIG.MOCK_MODE);
    console.log('🔧 MockData available:', typeof MockData !== 'undefined');
    
    // Use mock data if mock mode is enabled and available
    if (CONFIG.MOCK_MODE && typeof MockData !== 'undefined') {
        console.log('🔧 Using mock data for earnings');
        try {
            return await MockData.getStockOverview(symbol);
        } catch (error) {
            console.error('Mock data failed, falling back to API:', error);
            // Continue to API call if mock data fails
        }
    }
    
    const formattedSymbol = Utils.formatTicker(symbol);
    const cacheKey = `finnhub_earnings_${formattedSymbol}`;
    
    const url = `${CONFIG.FINNHUB_BASE_URL}/stock/earnings?symbol=${formattedSymbol}&limit=10&token=${CONFIG.FINNHUB_API_KEY}`;
    
    try {
        const data = await makeApiRequest(url, {}, cacheKey);
        
        // Check for API error response
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
        
    } catch (error) {
        console.error('Failed to get Finnhub earnings:', error);
        
        // Fallback to mock data if available
        if (typeof MockData !== 'undefined') {
            console.log('🔄 Falling back to mock data for earnings');
            try {
                return MockData.getStockOverview(symbol);
            } catch (mockError) {
                console.error('Mock data fallback also failed:', mockError);
            }
        }
        
        throw error;
    }
}

/**
 * Get comprehensive stock data (combines multiple APIs)
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with comprehensive stock data
 */
async function getComprehensiveStockData(symbol) {
    console.log('🔍 getComprehensiveStockData called with symbol:', symbol);
    console.log('🔧 CONFIG.MOCK_MODE:', CONFIG.MOCK_MODE);
    console.log('🔧 MockData available:', typeof MockData !== 'undefined');
    
    // Use mock data if mock mode is enabled and available
    if (CONFIG.MOCK_MODE && typeof MockData !== 'undefined') {
        console.log('🔧 Using mock data for comprehensive stock data');
        try {
            return await MockData.getComprehensiveStockData(symbol);
        } catch (error) {
            console.error('Mock data failed, falling back to API:', error);
            // Continue to API call if mock data fails
        }
    }
    
    const formattedSymbol = Utils.formatTicker(symbol);
    
    try {
        // First get Finnhub profile to extract company name
        const profile = await getFinnhubStockProfile(formattedSymbol);
        const companyName = profile?.name || formattedSymbol;
        
        // Then fetch quote, basic financials, earnings, and news in parallel
        const [quote, basicFinancials, earnings, news] = await Promise.allSettled([
            getFinnhubQuote(formattedSymbol),
            getFinnhubBasicFinancials(formattedSymbol),
            getFinnhubEarnings(formattedSymbol),
            getCompanyNews(formattedSymbol, 5, companyName)
        ]);
        
        // Combine results
        const result = {
            symbol: formattedSymbol,
            overview: profile, // Use Finnhub profile instead of Alpha Vantage overview
            quote: quote.status === 'fulfilled' ? quote.value : null,
            basicFinancials: basicFinancials.status === 'fulfilled' ? basicFinancials.value : null,
            earnings: earnings.status === 'fulfilled' ? earnings.value : null,
            news: news.status === 'fulfilled' ? news.value : [],
            lastUpdated: new Date().toISOString()
        };
        
        // Log any failed requests
        if (quote.status === 'rejected') {
            console.warn('Stock quote failed:', quote.reason);
        }
        if (news.status === 'rejected') {
            console.warn('Company news failed:', news.reason);
        }
        
        return result;
        
    } catch (error) {
        console.error('Failed to get comprehensive stock data:', error);
        throw error;
    }
}

/**
 * Validate API keys
 * @returns {Object} - Object with validation results
 */
function validateApiKeys() {
    const results = {
        finnhub: false,
        newsApi: false,
        message: ''
    };
    
    if (CONFIG.FINNHUB_API_KEY && CONFIG.FINNHUB_API_KEY !== 'your_finnhub_key_here') {
        results.finnhub = true;
    }
    
    if (CONFIG.NEWS_API_KEY && CONFIG.NEWS_API_KEY !== 'your_news_api_key_here') {
        results.newsApi = true;
    }
    
    if (!results.finnhub && !results.newsApi) {
        results.message = 'No API keys configured. Please add your API keys to config.js';
    } else if (!results.finnhub) {
        results.message = 'Finnhub API key not configured';
    } else if (!results.newsApi) {
        results.message = 'News API key not configured';
    }
    
    return results;
}

/**
 * Test Alpha Vantage API connection
 * @param {string} symbol - Stock symbol to test
 * @returns {Promise} - Promise with test results
 */
async function testAlphaVantageAPI(symbol = 'AAPL') {
    console.log('🧪 Testing Alpha Vantage API with symbol:', symbol);
    
    try {
        // Test stock overview
        console.log('📊 Testing stock overview...');
        const overview = await getStockOverview(symbol);
        console.log('✅ Stock overview test passed:', overview ? 'Data received' : 'No data');
        
        // Test stock quote
        console.log('💰 Testing stock quote...');
        const quote = await getStockQuote(symbol);
        console.log('✅ Stock quote test passed:', quote ? 'Data received' : 'No data');
        
        return {
            success: true,
            overview: overview ? 'Data received' : 'No data',
            quote: quote ? 'Data received' : 'No data',
            message: 'Alpha Vantage API test completed successfully'
        };
        
    } catch (error) {
        console.error('❌ Alpha Vantage API test failed:', error);
        return {
            success: false,
            error: error.message,
            message: 'Alpha Vantage API test failed'
        };
    }
}

// Export API functions
window.API = {
    makeApiRequest,
    getFinnhubStockProfile,
    getFinnhubQuote,
    getFinnhubBasicFinancials,
    getFinnhubEarnings,
    getStockOverview,
    getStockQuote,
    getCompanyNews,
    getEarningsCalendar,
    searchCompanies,
    getRedditSentiment,
    getComprehensiveStockData,
    validateApiKeys,
    testAlphaVantageAPI,
    // Cache management for testing
    clearAllCache: () => Utils.clearCache(),
    getCacheStats: () => {
        const cacheSize = Utils.getCacheSize ? Utils.getCacheSize() : 'Unknown';
        return { cacheSize, cacheDuration: CONFIG.CACHE_DURATION };
    }
}; 
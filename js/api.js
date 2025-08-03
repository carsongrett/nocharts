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
 * Get stock overview from Finnhub
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with stock data
 */
async function getStockOverview(symbol) {
    return await getFinnhubStockProfile(symbol);
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
 * Get stock quote from Finnhub
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with quote data
 */
async function getStockQuote(symbol) {
    return await getFinnhubQuote(symbol);
}

/**
 * Get company news from News API
 * @param {string} symbol - Stock symbol
 * @param {number} pageSize - Number of articles to fetch
 * @returns {Promise} - Promise with news data
 */
async function getCompanyNews(symbol, pageSize = 10, companyName = null) {
    console.log('🔍 getCompanyNews called with symbol:', symbol, 'pageSize:', pageSize);
    
    const formattedSymbol = Utils.formatTicker(symbol);
    const cacheKey = `company_news_${formattedSymbol}_${pageSize}`;
    
    // Use provided company name or fallback to symbol
    const searchTerm = companyName || formattedSymbol;
    
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
        
        // Try Reddit first (as requested)
        console.log('🔗 Trying Reddit API first...');
        try {
            const redditPosts = await getRedditNews(symbol, pageSize);
            console.log('✅ Reddit API successful');
            Utils.setCache(cacheKey, redditPosts);
            return redditPosts;
        } catch (redditError) {
            console.warn('❌ Reddit API failed, trying News API:', redditError.message);
            
            // Try News API as fallback
            const url = `${CONFIG.NEWS_API_BASE_URL}?q=${encodeURIComponent(searchTerm)}&pageSize=${pageSize}&sortBy=publishedAt&language=en&apiKey=${CONFIG.NEWS_API_KEY}`;
            
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
            
            if (data.status === 'error') {
                throw new Error(data.message || 'News API error');
            }
            
            const articles = data.articles || [];
            Utils.setCache(cacheKey, articles);
            console.log('✅ News API successful');
            return articles;
            
        }
        
    } catch (error) {
        console.error('Failed to get company news from both sources:', error);
        
        // Return empty array instead of throwing error to prevent undefined issues
        console.warn('All news sources failed, returning empty array');
        return [];
    }
}

/**
 * Get earnings calendar from Finnhub
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with earnings data
 */
async function getEarningsCalendar(symbol) {
    const formattedSymbol = Utils.formatTicker(symbol);
    const cacheKey = `earnings_${formattedSymbol}`;
    
    try {
        // Use Finnhub earnings data instead of Alpha Vantage
        const earnings = await getFinnhubEarnings(formattedSymbol);
        
        // Transform Finnhub earnings data to match expected format
        const transformedEarnings = earnings.map(earning => ({
            symbol: earning.symbol,
            reportDate: earning.period,
            estimate: earning.estimate,
            actual: earning.actual,
            surprise: earning.surprise,
            surprisePercent: earning.surprisePercent
        }));
        
        // Cache the transformed data
        Utils.setCache(cacheKey, transformedEarnings);
        
        return transformedEarnings;
        
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
    
    try {
        // Use Finnhub symbol lookup instead of Alpha Vantage
        const formattedKeywords = encodeURIComponent(keywords);
        const url = `${CONFIG.FINNHUB_BASE_URL}/search?q=${formattedKeywords}&token=${CONFIG.FINNHUB_API_KEY}`;
        
        const data = await makeApiRequest(url, {}, cacheKey);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Transform Finnhub search results to match expected format
        const transformedResults = data.result?.map(item => ({
            symbol: item.symbol,
            name: item.description,
            type: item.type,
            primaryExchange: item.primaryExchange
        })) || [];
        
        return transformedResults;
        
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
 * Test Finnhub API connection
 * @param {string} symbol - Stock symbol to test
 * @returns {Promise} - Promise with test results
 */
async function testFinnhubAPI(symbol = 'AAPL') {
    console.log('🧪 Testing Finnhub API with symbol:', symbol);
    
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
            message: 'Finnhub API test completed successfully'
        };
        
    } catch (error) {
        console.error('❌ Finnhub API test failed:', error);
        return {
            success: false,
            error: error.message,
            message: 'Finnhub API test failed'
        };
    }
}

/**
 * Get Reddit posts about a company using OAuth
 * @param {string} symbol - Stock symbol
 * @param {number} pageSize - Number of posts to return
 * @returns {Promise} - Promise with Reddit posts
 */
async function getRedditNews(symbol, pageSize = 10) {
    console.log('🔍 getRedditNews called with symbol:', symbol, 'pageSize:', pageSize);
    
    const formattedSymbol = Utils.formatTicker(symbol);
    const cacheKey = `reddit_news_${formattedSymbol}_${pageSize}`;
    
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
        
        // Use OAuth API to search Reddit
        const searchEndpoint = `/search.json?q=${encodeURIComponent(formattedSymbol)}&restrict_sr=1&sort=new&limit=${pageSize}`;
        
        console.log('🔗 Making authenticated Reddit API request...');
        const data = await makeRedditApiRequest(searchEndpoint);
        
        if (!data || !data.data || !data.data.children) {
            throw new Error('No Reddit data returned');
        }
        
        // Transform Reddit posts to match news article format
        const posts = transformRedditData(data, 'Reddit OAuth API');
        
        // Cache the response
        Utils.setCache(cacheKey, posts);
        
        console.log(`✅ Reddit OAuth API returned ${posts.length} posts for ${formattedSymbol}`);
        return posts;
        
    } catch (error) {
        console.error('Failed to get Reddit news:', error);
        throw error; // Re-throw to let caller handle the error
    }
}

/**
 * Parse RSS feed and convert to JSON format
 * @param {string} rssText - RSS feed text
 * @returns {Object} - Parsed data in Reddit JSON format
 */
function parseRSSFeed(rssText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rssText, 'text/xml');
    
    const items = xmlDoc.querySelectorAll('item');
    const children = Array.from(items).map(item => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        
        return {
            data: {
                title: title,
                selftext: description,
                permalink: link.replace('https://www.reddit.com', ''),
                author: 'Reddit User',
                score: Math.floor(Math.random() * 100) + 10, // Mock score
                num_comments: Math.floor(Math.random() * 50) + 5, // Mock comments
                created_utc: new Date(pubDate).getTime() / 1000
            }
        };
    });
    
    return { data: { children } };
}

/**
 * Transform Reddit data to news article format
 * @param {Object} data - Reddit API response
 * @param {string} source - Source name for logging
 * @returns {Array} - Transformed posts
 */
function transformRedditData(data, source) {
    const posts = data.data?.children?.map(post => {
        const createdUtc = post.data.created_utc;
        const timestampMs = createdUtc ? createdUtc * 1000 : null;
        const date = timestampMs ? new Date(timestampMs) : new Date();
        
        // Validate the date
        const isValidDate = !isNaN(date.getTime());
        const publishedAt = isValidDate ? date.toISOString() : new Date().toISOString();
        const relativeTime = isValidDate ? Utils.getRelativeTime(date) : 'Unknown time';
        
        return {
            title: post.data.title,
            description: post.data.selftext?.substring(0, 200) + '...' || 'No description available',
            content: post.data.selftext || '',
            url: `https://reddit.com${post.data.permalink}`,
            imageUrl: '', // Reddit posts don't have images
            source: { name: 'Reddit r/stocks' },
            author: post.data.author || 'Anonymous',
            publishedAt: publishedAt,
            relativeTime: relativeTime,
            sentiment: analyzeRedditSentiment(post.data.title + ' ' + (post.data.selftext || '')),
            score: post.data.score,
            numComments: post.data.num_comments,
            category: 'reddit'
        };
    }) || [];
    
    return posts;
}

/**
 * Get sample Reddit data for fallback
 * @param {string} symbol - Stock symbol
 * @param {number} pageSize - Number of posts
 * @returns {Array} - Sample Reddit posts
 */
function getSampleRedditData(symbol, pageSize) {
    const samplePosts = [
        {
            title: `What do you think about $${symbol}?`,
            description: `Just curious about everyone's thoughts on ${symbol} stock. Looking for different perspectives on the current valuation and future prospects.`,
            content: `Just curious about everyone's thoughts on ${symbol} stock. Looking for different perspectives on the current valuation and future prospects.`,
            url: `https://reddit.com/r/stocks/comments/example/${symbol.toLowerCase()}_discussion/`,
            imageUrl: '',
            source: { name: 'Reddit r/stocks' },
            author: 'RedditUser',
            publishedAt: new Date().toISOString(),
            relativeTime: '1d ago',
            sentiment: { score: 0, sentiment: 'neutral' },
            score: 25,
            numComments: 12,
            category: 'reddit'
        },
        {
            title: `${symbol} earnings analysis`,
            description: `Detailed analysis of ${symbol}'s recent earnings report. Key insights and trends from this quarter's financial results.`,
            content: `Detailed analysis of ${symbol}'s recent earnings report. Key insights and trends from this quarter's financial results.`,
            url: `https://reddit.com/r/stocks/comments/example/${symbol.toLowerCase()}_earnings/`,
            imageUrl: '',
            source: { name: 'Reddit r/stocks' },
            author: 'StockAnalyst',
            publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            relativeTime: '2d ago',
            sentiment: { score: 2, sentiment: 'positive' },
            score: 45,
            numComments: 8,
            category: 'reddit'
        }
    ];
    
    return samplePosts.slice(0, pageSize);
}

/**
 * Simple sentiment analysis for Reddit posts
 * @param {string} text - Text to analyze
 * @returns {Object} - Sentiment analysis result
 */
function analyzeRedditSentiment(text) {
    if (!text) return { score: 0, sentiment: 'neutral' };
    
    const positiveWords = [
        'positive', 'growth', 'increase', 'up', 'higher', 'strong', 'profit', 'gain',
        'success', 'win', 'beat', 'exceed', 'surge', 'rally', 'bullish', 'optimistic',
        'improve', 'better', 'excellent', 'outperform', 'upgrade', 'buy', 'strong',
        'moon', '🚀', '💎', 'hodl', 'diamond', 'hands'
    ];
    
    const negativeWords = [
        'negative', 'fall', 'drop', 'loss', 'decline', 'weak', 'concern', 'risk',
        'down', 'lower', 'crash', 'bearish', 'pessimistic', 'worse', 'sell',
        'dump', 'paper', 'hands', '💩', '📉'
    ];
    
    const textLower = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        const matches = textLower.match(regex);
        if (matches) positiveCount += matches.length;
    });
    
    negativeWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        const matches = textLower.match(regex);
        if (matches) negativeCount += matches.length;
    });
    
    const score = positiveCount - negativeCount;
    
    if (score > 0) return { score, sentiment: 'positive' };
    if (score < 0) return { score, sentiment: 'negative' };
    return { score, sentiment: 'neutral' };
}

/**
 * Reddit OAuth Authentication Functions
 */

/**
 * Generate Reddit OAuth authorization URL
 * @returns {string} - Authorization URL
 */
function getRedditAuthUrl() {
    console.log('🔧 Debug - CONFIG.REDDIT_REDIRECT_URI:', CONFIG.REDDIT_REDIRECT_URI);
    console.log('🔧 Debug - window.location.hostname:', window.location.hostname);
    
    const params = new URLSearchParams({
        client_id: CONFIG.REDDIT_CLIENT_ID,
        response_type: 'token', // Use implicit flow for client-side
        state: generateRandomState(),
        redirect_uri: CONFIG.REDDIT_REDIRECT_URI,
        duration: 'permanent',
        scope: 'read'
    });
    
    const authUrl = `${CONFIG.REDDIT_AUTH_URL}?${params.toString()}`;
    console.log('🔧 Debug - Generated auth URL:', authUrl);
    
    return authUrl;
}

/**
 * Generate random state for OAuth security
 * @returns {string} - Random state string
 */
function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from Reddit
 * @returns {Promise<Object>} - Token response
 */
async function exchangeRedditCode(code) {
    console.log('🔄 Exchanging Reddit authorization code for token...');
    console.log('🔧 Code:', code);
    console.log('🔧 Redirect URI:', CONFIG.REDDIT_REDIRECT_URI);
    
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: CONFIG.REDDIT_REDIRECT_URI
    });
    
    try {
        const response = await fetch(CONFIG.REDDIT_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${CONFIG.REDDIT_CLIENT_ID}:${CONFIG.REDDIT_CLIENT_SECRET}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'nocharts/1.0'
            },
            body: params.toString()
        });
        
        console.log('🔧 Token exchange response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Token exchange failed:', errorText);
            throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
        }
        
        const tokenData = await response.json();
        console.log('✅ Token exchange successful:', tokenData);
        return tokenData;
        
    } catch (error) {
        console.error('❌ Token exchange error:', error);
        
        // If it's a CORS error, provide helpful message
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            console.error('❌ CORS error - Reddit token endpoint doesn\'t support client-side requests');
            throw new Error('Token exchange failed due to CORS restrictions. This requires a server-side implementation.');
        }
        
        throw error;
    }
}

/**
 * Get Reddit access token (from storage or auth flow)
 * @returns {Promise<string>} - Access token
 */
async function getRedditAccessToken() {
    // Check if we have a stored token
    const storedToken = localStorage.getItem('reddit_access_token');
    const tokenExpiry = localStorage.getItem('reddit_token_expiry');
    
    if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        console.log('✅ Using stored Reddit access token');
        return storedToken;
    }
    
    // Check if we have an access token in URL fragment (implicit flow)
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get('access_token');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
        console.error('❌ Reddit OAuth error:', error);
        throw new Error(`Reddit OAuth error: ${error}`);
    }
    
    if (accessToken && state) {
        console.log('✅ Reddit access token found in URL');
        
        // Store token (permanent token, so set expiry far in future)
        localStorage.setItem('reddit_access_token', accessToken);
        localStorage.setItem('reddit_token_expiry', (Date.now() + 365 * 24 * 60 * 60 * 1000).toString()); // 1 year
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        return accessToken;
    }
    
    // No token available, need to authenticate
    console.log('❌ No Reddit access token available, need to authenticate');
    throw new Error('No Reddit access token available. Please authenticate first.');
}

/**
 * Make authenticated Reddit API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - API response
 */
async function makeRedditApiRequest(endpoint, options = {}) {
    try {
        const accessToken = await getRedditAccessToken();
        
        const response = await fetch(`${CONFIG.REDDIT_API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'nocharts/1.0',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`Reddit API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        if (error.message.includes('No Reddit access token')) {
            // Redirect to Reddit auth
            window.location.href = getRedditAuthUrl();
            return null;
        }
        throw error;
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
    getRedditNews,
    getEarningsCalendar,
    searchCompanies,
    getRedditSentiment,
    getComprehensiveStockData,
    validateApiKeys,
    testFinnhubAPI,
    // Reddit OAuth functions
    getRedditAuthUrl,
    getRedditAccessToken,
    makeRedditApiRequest,
    // Cache management for testing
    clearAllCache: () => Utils.clearCache(),
    getCacheStats: () => {
        const cacheSize = Utils.getCacheSize ? Utils.getCacheSize() : 'Unknown';
        return { cacheSize, cacheDuration: CONFIG.CACHE_DURATION };
    }
}; 
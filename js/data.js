// ===== DATA PROCESSING FUNCTIONS =====

/**
 * Process Finnhub stock profile data
 * @param {Object} data - Raw Finnhub profile data
 * @returns {Object} - Processed profile data
 */
function processFinnhubProfile(data) {
    if (!data || Object.keys(data).length === 0) {
        return null;
    }
    
    return {
        symbol: data.ticker || '',
        name: data.name || '',
        description: data.name || '', // Finnhub doesn't provide descriptions
        exchange: data.exchange || '',
        currency: data.currency || 'USD',
        country: data.country || '',
        sector: data.finnhubIndustry || '',
        industry: data.finnhubIndustry || '',
        marketCap: data.marketCapitalization ? parseFloat(data.marketCapitalization) : null,
        peRatio: null, // Finnhub doesn't provide P/E in profile
        pbRatio: null, // Finnhub doesn't provide P/B in profile
        dividendYield: null, // Finnhub doesn't provide dividend in profile
        eps: null, // Finnhub doesn't provide EPS in profile
        beta: null, // Finnhub doesn't provide beta in profile
        fiftyTwoWeekHigh: null, // Finnhub doesn't provide 52-week data in profile
        fiftyTwoWeekLow: null,
        volume: null, // Volume comes from quote data
        avgVolume: null,
        weburl: data.weburl || '',
        logo: data.logo || '',
        ipo: data.ipo || ''
    };
}

/**
 * Process stock overview data (legacy - for Alpha Vantage compatibility)
 * @param {Object} data - Raw overview data from API
 * @returns {Object} - Processed overview data
 */
function processStockOverview(data) {
    if (!data || Object.keys(data).length === 0) {
        return null;
    }
    
    return {
        symbol: data.Symbol || '',
        name: data.Name || '',
        description: data.Description || '',
        exchange: data.Exchange || '',
        currency: data.Currency || 'USD',
        country: data.Country || '',
        sector: data.Sector || '',
        industry: data.Industry || '',
        marketCap: data.MarketCapitalization ? parseFloat(data.MarketCapitalization) : null,
        peRatio: data.PERatio ? parseFloat(data.PERatio) : null,
        pbRatio: data.PriceToBookRatio ? parseFloat(data.PriceToBookRatio) : null,
        dividendYield: data.DividendYield ? parseFloat(data.DividendYield) : null,
        eps: data.EPS ? parseFloat(data.EPS) : null,
        beta: data.Beta ? parseFloat(data.Beta) : null,
        fiftyTwoWeekHigh: data['52WeekHigh'] ? parseFloat(data['52WeekHigh']) : null,
        fiftyTwoWeekLow: data['52WeekLow'] ? parseFloat(data['52WeekLow']) : null,
        volume: data.Volume ? parseInt(data.Volume) : null,
        avgVolume: data.AverageVolume ? parseInt(data.AverageVolume) : null
    };
}

/**
 * Process Finnhub quote data
 * @param {Object} data - Raw Finnhub quote data
 * @returns {Object} - Processed quote data
 */
function processFinnhubQuote(data) {
    if (!data || Object.keys(data).length === 0) {
        return null;
    }
    
    return {
        symbol: '', // Symbol comes from profile data
        price: data.c ? parseFloat(data.c) : null,
        change: data.d ? parseFloat(data.d) : null,
        changePercent: data.dp ? parseFloat(data.dp) : null,
        volume: null, // Finnhub quote doesn't include volume
        high: data.h ? parseFloat(data.h) : null,
        low: data.l ? parseFloat(data.l) : null,
        open: data.o ? parseFloat(data.o) : null,
        previousClose: data.pc ? parseFloat(data.pc) : null,
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Process Finnhub basic financials data
 * @param {Object} data - Raw Finnhub basic financials data
 * @returns {Object} - Processed basic financials data
 */
function processFinnhubBasicFinancials(data) {
    if (!data || Object.keys(data).length === 0) {
        return null;
    }
    
    // /stock/metric endpoint returns different structure
    // Handle the actual response format from the correct endpoint
    const metric = data.metric || {};
    
    return {
        peRatio: metric.peTTM ? parseFloat(metric.peTTM) : null,
        dividendYield: metric.currentDividendYieldTTM ? parseFloat(metric.currentDividendYieldTTM) : null,
        pbRatio: metric.pb ? parseFloat(metric.pb) : null,
        beta: metric.beta ? parseFloat(metric.beta) : null,
        marketCap: metric.marketCapitalization ? parseFloat(metric.marketCapitalization) : null,
        profitMargin: metric.netProfitMarginTTM ? parseFloat(metric.netProfitMarginTTM) : null,
        currentRatio: metric.currentRatioQuarterly ? parseFloat(metric.currentRatioQuarterly) : null,
        revenueGrowth: metric.revenueGrowthTTMYoy ? parseFloat(metric.revenueGrowthTTMYoy) : null,
        weekHigh: metric['52WeekHigh'] ? parseFloat(metric['52WeekHigh']) : null,
        weekLow: metric['52WeekLow'] ? parseFloat(metric['52WeekLow']) : null,
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Process Finnhub earnings data
 * @param {Object} data - Raw Finnhub earnings data
 * @returns {Object} - Processed earnings data
 */
function processFinnhubEarnings(data) {
    if (!data || Object.keys(data).length === 0) {
        return null;
    }
    
    // Finnhub earnings returns an array of earnings data
    // Get the most recent earnings data
    const earningsArray = Array.isArray(data) ? data : [data];
    const latestEarnings = earningsArray.length > 0 ? earningsArray[0] : {};
    
    return {
        eps: latestEarnings.eps ? parseFloat(latestEarnings.eps) : null,
        revenue: latestEarnings.revenue ? parseFloat(latestEarnings.revenue) : null,
        earningsDate: latestEarnings.date || null,
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Process stock quote data (legacy - for Alpha Vantage compatibility)
 * @param {Object} data - Raw quote data from API
 * @returns {Object} - Processed quote data
 */
function processStockQuote(data) {
    if (!data || Object.keys(data).length === 0) {
        return null;
    }
    
    return {
        symbol: data['01. symbol'] || '',
        price: data['05. price'] ? parseFloat(data['05. price']) : null,
        change: data['09. change'] ? parseFloat(data['09. change']) : null,
        changePercent: data['10. change percent'] ? 
            parseFloat(data['10. change percent'].replace('%', '')) : null,
        volume: data['06. volume'] ? parseInt(data['06. volume']) : null,
        high: data['03. high'] ? parseFloat(data['03. high']) : null,
        low: data['04. low'] ? parseFloat(data['04. low']) : null,
        open: data['02. open'] ? parseFloat(data['02. open']) : null,
        previousClose: data['08. previous close'] ? parseFloat(data['08. previous close']) : null,
        lastUpdated: data['07. latest trading day'] || new Date().toISOString()
    };
}

/**
 * Process news articles data
 * @param {Array} articles - Raw news articles from API
 * @returns {Array} - Processed news articles
 */
function processNewsArticles(articles) {
    if (!Array.isArray(articles)) {
        return [];
    }
    
    return articles.map(article => ({
        title: article.title || '',
        description: article.description || '',
        content: article.content || '',
        url: article.url || '',
        imageUrl: article.urlToImage || '',
        source: article.source?.name || '',
        author: article.author || '',
        publishedAt: article.publishedAt || '',
        relativeTime: Utils.getRelativeTime(article.publishedAt),
        sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
        category: categorizeNews(article.title + ' ' + (article.description || ''))
    }));
}

/**
 * Simple sentiment analysis
 * @param {string} text - Text to analyze
 * @returns {Object} - Sentiment analysis result
 */
function analyzeSentiment(text) {
    if (!text) return { score: 0, sentiment: 'neutral' };
    
    const positiveWords = [
        'positive', 'growth', 'increase', 'up', 'higher', 'strong', 'profit', 'gain',
        'success', 'win', 'beat', 'exceed', 'surge', 'rally', 'bullish', 'optimistic',
        'improve', 'better', 'excellent', 'outperform', 'upgrade', 'buy', 'strong'
    ];
    
    const negativeWords = [
        'negative', 'decline', 'decrease', 'down', 'lower', 'weak', 'loss', 'drop',
        'fail', 'lose', 'miss', 'fall', 'crash', 'bearish', 'pessimistic', 'worse',
        'underperform', 'downgrade', 'sell', 'weak', 'concern', 'risk', 'volatile'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
    });
    
    const score = positiveCount - negativeCount;
    
    if (score > 0) return { score, sentiment: 'positive' };
    if (score < 0) return { score, sentiment: 'negative' };
    return { score, sentiment: 'neutral' };
}

/**
 * Categorize news article
 * @param {string} text - Text to categorize
 * @returns {string} - News category
 */
function categorizeNews(text) {
    if (!text) return 'general';
    
    const textLower = text.toLowerCase();
    
    if (textLower.includes('earnings') || textLower.includes('quarterly') || textLower.includes('financial')) {
        return 'earnings';
    }
    if (textLower.includes('merger') || textLower.includes('acquisition') || textLower.includes('deal')) {
        return 'm&a';
    }
    if (textLower.includes('product') || textLower.includes('launch') || textLower.includes('release')) {
        return 'product';
    }
    if (textLower.includes('ceo') || textLower.includes('executive') || textLower.includes('leadership')) {
        return 'leadership';
    }
    if (textLower.includes('regulation') || textLower.includes('legal') || textLower.includes('lawsuit')) {
        return 'regulatory';
    }
    if (textLower.includes('market') || textLower.includes('trading') || textLower.includes('stock')) {
        return 'market';
    }
    
    return 'general';
}

/**
 * Process earnings data
 * @param {Array} earnings - Raw earnings data from API
 * @returns {Array} - Processed earnings data
 */
function processEarningsData(earnings) {
    if (!Array.isArray(earnings)) {
        return [];
    }
    
    return earnings.map(earning => ({
        symbol: earning.symbol || '',
        reportDate: earning.reportDate || '',
        estimate: earning.estimate ? parseFloat(earning.estimate) : null,
        actual: earning.actual ? parseFloat(earning.actual) : null,
        surprise: earning.surprise ? parseFloat(earning.surprise) : null,
        surprisePercent: earning.surprisePercent ? parseFloat(earning.surprisePercent) : null,
        period: earning.period || '',
        year: earning.year || ''
    }));
}

/**
 * Group news by category
 * @param {Array} articles - Processed news articles
 * @returns {Object} - News grouped by category
 */
function groupNewsByCategory(articles) {
    const grouped = {};
    
    articles.forEach(article => {
        const category = article.category || 'general';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(article);
    });
    
    return grouped;
}

/**
 * Sort news by date
 * @param {Array} articles - News articles to sort
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} - Sorted news articles
 */
function sortNewsByDate(articles, order = 'desc') {
    return [...articles].sort((a, b) => {
        const dateA = new Date(a.publishedAt);
        const dateB = new Date(b.publishedAt);
        
        if (order === 'asc') {
            return dateA - dateB;
        } else {
            return dateB - dateA;
        }
    });
}

/**
 * Filter news by sentiment
 * @param {Array} articles - News articles to filter
 * @param {string} sentiment - Sentiment to filter by ('positive', 'negative', 'neutral')
 * @returns {Array} - Filtered news articles
 */
function filterNewsBySentiment(articles, sentiment) {
    if (!sentiment || sentiment === 'all') {
        return articles;
    }
    
    return articles.filter(article => article.sentiment === sentiment);
}

/**
 * Get news summary statistics
 * @param {Array} articles - News articles to analyze
 * @returns {Object} - Summary statistics
 */
function getNewsSummary(articles) {
    if (!Array.isArray(articles) || articles.length === 0) {
        return {
            total: 0,
            positive: 0,
            negative: 0,
            neutral: 0,
            averageSentiment: 0,
            categories: {}
        };
    }
    
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    const categoryCounts = {};
    let totalSentimentScore = 0;
    
    articles.forEach(article => {
        // Count sentiments
        sentimentCounts[article.sentiment]++;
        totalSentimentScore += article.sentiment.score;
        
        // Count categories
        const category = article.category || 'general';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return {
        total: articles.length,
        positive: sentimentCounts.positive,
        negative: sentimentCounts.negative,
        neutral: sentimentCounts.neutral,
        averageSentiment: totalSentimentScore / articles.length,
        categories: categoryCounts
    };
}

/**
 * Create timeline from news and earnings data
 * @param {Array} news - News articles
 * @param {Array} earnings - Earnings data
 * @returns {Array} - Timeline events
 */
function createTimeline(news, earnings = []) {
    const timeline = [];
    
    // Add news events
    news.forEach(article => {
        timeline.push({
            type: 'news',
            date: new Date(article.publishedAt),
            title: article.title,
            description: article.description,
            url: article.url,
            sentiment: article.sentiment,
            category: article.category,
            source: article.source
        });
    });
    
    // Add earnings events
    earnings.forEach(earning => {
        timeline.push({
            type: 'earnings',
            date: new Date(earning.reportDate),
            title: `Earnings Report - ${earning.period} ${earning.year}`,
            description: `EPS Estimate: ${earning.estimate}, Actual: ${earning.actual}`,
            symbol: earning.symbol,
            estimate: earning.estimate,
            actual: earning.actual,
            surprise: earning.surprise,
            surprisePercent: earning.surprisePercent
        });
    });
    
    // Sort by date (newest first)
    return timeline.sort((a, b) => b.date - a.date);
}

/**
 * Format stock data for display
 * @param {Object} stockData - Combined stock data
 * @returns {Object} - Formatted data for UI
 */
function formatStockDataForDisplay(stockData) {
    const { overview, quote, news } = stockData;
    
    return {
        symbol: stockData.symbol,
        name: overview?.name || stockData.symbol,
        price: quote?.price ? Utils.formatCurrency(quote.price) : 'N/A',
        change: quote?.change ? Utils.formatCurrency(quote.change) : 'N/A',
        changePercent: quote?.changePercent ? Utils.formatPercentage(quote.changePercent / 100) : 'N/A',
        isPositive: quote?.change > 0,
        isNegative: quote?.change < 0,
        marketCap: overview?.marketCap ? Utils.formatCurrency(overview.marketCap) : 'N/A',
        peRatio: overview?.peRatio ? overview.peRatio.toFixed(2) : 'N/A',
        volume: quote?.volume ? Utils.formatNumber(quote.volume) : 'N/A',
        description: overview?.description ? Utils.truncateText(overview.description, 200) : '',
        sector: overview?.sector || 'N/A',
        industry: overview?.industry || 'N/A',
        newsCount: news?.length || 0,
        lastUpdated: stockData.lastUpdated
    };
}

/**
 * Validate and clean user input
 * @param {string} input - User input to validate
 * @returns {string|null} - Cleaned input or null if invalid
 */
function validateUserInput(input) {
    if (!input || typeof input !== 'string') {
        return null;
    }
    
    const cleaned = input.trim().toUpperCase();
    
    // Basic validation for stock symbols
    if (cleaned.length < 1 || cleaned.length > 5) {
        return null;
    }
    
    if (!/^[A-Z]+$/.test(cleaned)) {
        return null;
    }
    
    return cleaned;
}

/**
 * Cache management functions
 */
const DataCache = {
    /**
     * Get cached data with key
     * @param {string} key - Cache key
     * @returns {any} - Cached data or null
     */
    get: (key) => Utils.getCache(key),
    
    /**
     * Set cached data
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    set: (key, data, ttl) => Utils.setCache(key, data, ttl),
    
    /**
     * Clear specific cache entry
     * @param {string} key - Cache key to clear
     */
    clear: (key) => Utils.clearCache(key),
    
    /**
     * Clear all cache
     */
    clearAll: () => Utils.clearCache(),
    
    /**
     * Get cache statistics
     * @returns {Object} - Cache statistics
     */
    getStats: () => {
        // This would need to be implemented in Utils if needed
        return { size: 0, entries: 0 };
    }
};

// Export data processing functions
window.DataProcessor = {
    processFinnhubProfile,
    processFinnhubQuote,
    processFinnhubBasicFinancials,
    processFinnhubEarnings,
    processStockOverview,
    processStockQuote,
    processNewsArticles,
    analyzeSentiment,
    categorizeNews,
    processEarningsData,
    groupNewsByCategory,
    sortNewsByDate,
    filterNewsBySentiment,
    getNewsSummary,
    createTimeline,
    formatStockDataForDisplay,
    validateUserInput,
    DataCache
}; 
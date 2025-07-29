// ===== UTILITY FUNCTIONS =====

// Cache for storing API responses
const cache = new Map();

// Rate limiting
let requestCount = 0;
let lastRequestTime = 0;

/**
 * Validate stock ticker symbol
 * @param {string} ticker - Stock ticker symbol
 * @returns {boolean} - True if valid
 */
function isValidTicker(ticker) {
    if (!ticker || typeof ticker !== 'string') return false;
    
    // Remove whitespace and convert to uppercase
    const cleanTicker = ticker.trim().toUpperCase();
    
    // Check length (1-5 characters typical for US stocks)
    if (cleanTicker.length < 1 || cleanTicker.length > 5) return false;
    
    // Check if contains only letters
    if (!/^[A-Z]+$/.test(cleanTicker)) return false;
    
    return true;
}

/**
 * Format ticker symbol
 * @param {string} ticker - Stock ticker symbol
 * @returns {string} - Formatted ticker
 */
function formatTicker(ticker) {
    if (!ticker) return '';
    return ticker.trim().toUpperCase();
}

/**
 * Simple cache implementation
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 */
function setCache(key, data, ttl = CONFIG.CACHE_DURATION) {
    if (!CONFIG.FEATURES.CACHING_ENABLED) return;
    
    const item = {
        data,
        timestamp: Date.now(),
        ttl
    };
    
    cache.set(key, item);
}

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
function getCache(key) {
    if (!CONFIG.FEATURES.CACHING_ENABLED) return null;
    
    const item = cache.get(key);
    if (!item) return null;
    
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
        cache.delete(key);
        return null;
    }
    
    return item.data;
}

/**
 * Clear cache
 * @param {string} key - Optional specific key to clear
 */
function clearCache(key = null) {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
}

/**
 * Get cache size
 * @returns {number} - Number of cached items
 */
function getCacheSize() {
    return cache.size;
}

/**
 * Rate limiting check
 * @returns {boolean} - True if request is allowed
 */
function checkRateLimit() {
    const now = Date.now();
    
    // Reset counter if more than 1 minute has passed
    if (now - lastRequestTime > 60000) {
        requestCount = 0;
        lastRequestTime = now;
    }
    
    if (requestCount >= CONFIG.MAX_REQUESTS_PER_MINUTE) {
        return false;
    }
    
    requestCount++;
    return true;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
    if (num === null || num === undefined) return 'N/A';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted currency
 */
function formatCurrency(amount, currency = 'USD') {
    if (amount === null || amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage
 */
function formatPercentage(value, decimals = 2) {
    if (value === null || value === undefined) return 'N/A';
    
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Get relative time string
 * @param {Date|string} date - Date to format
 * @returns {string} - Relative time string
 */
function getRelativeTime(date) {
    // Handle invalid dates gracefully
    if (!date || isNaN(new Date(date).getTime())) {
        return 'Unknown time';
    }
    
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return targetDate.toLocaleDateString();
}

/**
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} - Random ID
 */
function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Check if device is mobile
 * @returns {boolean} - True if mobile device
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device is iOS
 * @returns {boolean} - True if iOS device
 */
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if device is Android
 * @returns {boolean} - True if Android device
 */
function isAndroid() {
    return /Android/.test(navigator.userAgent);
}

/**
 * Get device pixel ratio
 * @returns {number} - Device pixel ratio
 */
function getPixelRatio() {
    return window.devicePixelRatio || 1;
}

/**
 * Sleep function for async operations
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with function result
 */
async function retry(fn, maxRetries = 3, baseDelay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            
            const delay = baseDelay * Math.pow(2, i);
            await sleep(delay);
        }
    }
}

/**
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any} - Cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Merge objects
 * @param {...Object} objects - Objects to merge
 * @returns {Object} - Merged object
 */
function merge(...objects) {
    return objects.reduce((result, obj) => {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    result[key] = merge(result[key] || {}, obj[key]);
                } else {
                    result[key] = obj[key];
                }
            }
        }
        return result;
    }, {});
}

// Export functions for use in other modules
window.Utils = {
    isValidTicker,
    formatTicker,
    setCache,
    getCache,
    clearCache,
    getCacheSize,
    checkRateLimit,
    debounce,
    throttle,
    formatNumber,
    formatCurrency,
    formatPercentage,
    truncateText,
    getRelativeTime,
    generateId,
    isMobile,
    isIOS,
    isAndroid,
    getPixelRatio,
    sleep,
    retry,
    deepClone,
    merge
}; 
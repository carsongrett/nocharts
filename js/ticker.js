// ===== TICKER PAGE FUNCTIONALITY =====

class TickerPage {
    constructor() {
        this.stockData = null;
        this.timeline = null;
        this.currentTheme = this.getStoredTheme();
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.loadStockData();
    }

    setupTheme() {
        // Apply stored theme
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Setup theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    setupEventListeners() {
        // Error modal close button
        const errorClose = document.getElementById('errorClose');
        if (errorClose) {
            errorClose.addEventListener('click', () => {
                UI.hideError();
            });
        }

        // Header search input
        const headerSearch = document.getElementById('headerSearch');
        if (headerSearch) {
            headerSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleHeaderSearch();
                }
            });
        }

        // Company description click to expand
        const companyDescription = document.getElementById('companyDescription');
        if (companyDescription) {
            companyDescription.addEventListener('click', () => {
                this.toggleCompanyDescription();
            });
        }

        // Window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    handleHeaderSearch() {
        const headerSearch = document.getElementById('headerSearch');
        if (!headerSearch) return;

        const symbol = headerSearch.value.trim().toUpperCase();
        if (!symbol) return;

        // Valid symbols from mock data
        const validSymbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'NFLX', 'TSLA', 'AAPL'];
        
        if (validSymbols.includes(symbol)) {
            // Navigate to ticker page
            window.location.href = `ticker.html?ticker=${symbol}`;
        } else {
            // Show "n/a" message
            alert('n/a');
            headerSearch.value = '';
        }
    }

    toggleCompanyDescription() {
        const descriptionText = document.getElementById('descriptionText');
        if (descriptionText) {
            descriptionText.classList.toggle('expanded');
        }
    }

    async loadStockData() {
        const urlParams = new URLSearchParams(window.location.search);
        const ticker = urlParams.get('ticker');

        if (!ticker) {
            this.showError('No stock ticker provided');
            return;
        }

        try {
            this.showLoading();
            
            // Check if API is available
            if (typeof API === 'undefined') {
                throw new Error('API not available. Please check script loading order.');
            }
            
            // Get comprehensive stock data
            const stockData = await API.getComprehensiveStockData(ticker);
            
            // Process the data
            this.stockData = this.processStockData(stockData);
            
            // Display the results
            this.displayStockData();
            
            // Initialize timeline
            this.initializeTimeline();
            
            // Update page metadata
            this.updatePageMetadata();
            
        } catch (error) {
            console.error('Failed to load stock data:', error);
            this.handleError(error, ticker);
        } finally {
            this.hideLoading();
        }
    }

    processStockData(stockData) {
        // Check if DataProcessor is available
        if (typeof DataProcessor === 'undefined') {
            console.error('DataProcessor not available');
            throw new Error('Data processing not available. Please check script loading order.');
        }
        
        const processed = {
            symbol: stockData.symbol,
            overview: stockData.overview ? DataProcessor.processFinnhubProfile(stockData.overview) : null,
            quote: stockData.quote ? DataProcessor.processFinnhubQuote(stockData.quote) : null,
            basicFinancials: stockData.basicFinancials ? DataProcessor.processFinnhubBasicFinancials(stockData.basicFinancials) : null,
            earnings: stockData.earnings ? DataProcessor.processFinnhubEarnings(stockData.earnings) : null,
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

    displayStockData() {
        if (!this.stockData) return;

        // Update stock header
        this.updateStockHeader();
        
        // Update overview cards
        this.updateOverviewCards();
        
        // Update company description
        this.updateCompanyDescription();
        
        // Show content
        this.showContent();
    }

    updateStockHeader() {
        const { display, quote } = this.stockData;
        
        // Stock symbol and company name
        const symbolElement = document.getElementById('stockSymbol');
        const companyElement = document.getElementById('companyName');
        
        if (symbolElement) symbolElement.textContent = display.symbol;
        if (companyElement) companyElement.textContent = display.name;
        
        // Stock price and change
        const priceElement = document.getElementById('stockPrice');
        const changeElement = document.getElementById('stockChange');
        
        if (priceElement) priceElement.textContent = display.price;
        if (changeElement) {
            changeElement.textContent = `${display.change} (${display.changePercent})`;
            changeElement.className = `change ${display.isPositive ? 'positive' : display.isNegative ? 'negative' : ''}`;
        }
    }

    updateOverviewCards() {
        const { overview, basicFinancials, earnings, newsSummary } = this.stockData;
        
        // Company info
        if (overview) {
            this.updateElement('sector', overview.sector || 'N/A');
            this.updateElement('industry', overview.industry || 'N/A');
            
                           // Format market cap properly
               let marketCap = 'N/A';
               if (overview.marketCap) {
                   const marketCapValue = parseFloat(overview.marketCap);
                   // Finnhub returns market cap in millions, so we need to convert properly
                   if (marketCapValue >= 1e6) {
                       marketCap = `$${(marketCapValue / 1e6).toFixed(1)}T`;
                   } else if (marketCapValue >= 1e3) {
                       marketCap = `$${(marketCapValue / 1e3).toFixed(1)}B`;
                   } else {
                       marketCap = `$${marketCapValue.toFixed(1)}M`;
                   }
               }
            this.updateElement('marketCap', marketCap);
        }
        
                   // Basic financials
           if (basicFinancials) {
               this.updateElement('peRatio', basicFinancials.peRatio ? basicFinancials.peRatio.toFixed(2) : 'N/A');
               this.updateElement('dividendYield', basicFinancials.dividendYield ? `${basicFinancials.dividendYield.toFixed(2)}%` : 'N/A');
               this.updateElement('revenueGrowth', basicFinancials.revenueGrowth ? `${basicFinancials.revenueGrowth.toFixed(2)}%` : 'N/A');
               
               // Format 52-week range
               let weekRange = 'N/A';
               if (basicFinancials.weekHigh && basicFinancials.weekLow) {
                   weekRange = `$${basicFinancials.weekLow.toFixed(2)} - $${basicFinancials.weekHigh.toFixed(2)}`;
               }
               this.updateElement('weekHighLow', weekRange);
               
               this.updateElement('profitMargin', basicFinancials.profitMargin ? `${basicFinancials.profitMargin.toFixed(2)}%` : 'N/A');
               this.updateElement('currentRatio', basicFinancials.currentRatio ? basicFinancials.currentRatio.toFixed(2) : 'N/A');
           } else {
               // Fallback to N/A if no basic financials
               this.updateElement('peRatio', 'N/A');
               this.updateElement('dividendYield', 'N/A');
               this.updateElement('revenueGrowth', 'N/A');
               this.updateElement('weekHighLow', 'N/A');
               this.updateElement('profitMargin', 'N/A');
               this.updateElement('currentRatio', 'N/A');
           }
        
        // Earnings data (if available)
        if (earnings) {
            // Update any earnings-related fields if needed
            // For now, we'll keep the existing structure
        }
        
        // News summary
        if (newsSummary) {
            this.updateElement('totalArticles', newsSummary.total);
            this.updateElement('positiveArticles', newsSummary.positive);
            this.updateElement('negativeArticles', newsSummary.negative);
            this.updateElement('neutralArticles', newsSummary.neutral);
        }
    }

    updateCompanyDescription() {
        const { overview } = this.stockData;
        const descriptionElement = document.getElementById('descriptionText');
        
        if (descriptionElement && overview && overview.description) {
            const truncatedText = typeof Utils !== 'undefined' ? Utils.truncateText(overview.description, 500) : overview.description.substring(0, 500) + (overview.description.length > 500 ? '...' : '');
            descriptionElement.textContent = truncatedText;
        } else if (descriptionElement) {
            descriptionElement.textContent = 'No company description available.';
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    initializeTimeline() {
        if (!this.stockData || !this.stockData.timeline) return;
        
        // Check if TimelineManager is available
        if (typeof TimelineManager === 'undefined') {
            console.error('TimelineManager not available');
            return;
        }
        
        try {
            // Initialize timeline
            this.timeline = TimelineManager.initializeTimeline();
            
            // Add timeline items
            this.timeline.addItems(this.stockData.timeline);
            
            // Animate timeline in
            setTimeout(() => {
                this.timeline.animateIn();
            }, 100);
        } catch (error) {
            console.error('Failed to initialize timeline:', error);
        }
    }

    updatePageMetadata() {
        const { display } = this.stockData;
        
        // Check if UI is available
        if (typeof UI === 'undefined') {
            console.error('UI not available');
            return;
        }
        
        // Update page title
        UI.updatePageTitle(`${display.symbol} - ${display.name}`);
        
        // Update meta description
        const description = `${display.name} (${display.symbol}) stock research and news analysis. Current price: ${display.price}. ${display.newsCount} recent news articles analyzed.`;
        UI.updateMetaDescription(description);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Store theme preference
        this.storeTheme(this.currentTheme);
        
        // Add animation
        UI.addPulseAnimation(document.body, 300);
    }

    getStoredTheme() {
        return localStorage.getItem('nocharts-theme') || 'light';
    }

    storeTheme(theme) {
        localStorage.setItem('nocharts-theme', theme);
    }

    showLoading() {
        const loadingState = document.getElementById('loadingState');
        const stockContent = document.getElementById('stockContent');
        const errorState = document.getElementById('errorState');
        
        if (loadingState) loadingState.classList.remove('hidden');
        if (stockContent) stockContent.classList.add('hidden');
        if (errorState) errorState.classList.add('hidden');
    }

    hideLoading() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) loadingState.classList.add('hidden');
    }

    showContent() {
        const stockContent = document.getElementById('stockContent');
        if (stockContent) stockContent.classList.remove('hidden');
    }

    showError(message) {
        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');
        const loadingState = document.getElementById('loadingState');
        const stockContent = document.getElementById('stockContent');
        
        if (errorMessage) errorMessage.textContent = message;
        if (errorState) errorState.classList.remove('hidden');
        if (loadingState) loadingState.classList.add('hidden');
        if (stockContent) stockContent.classList.add('hidden');
    }

    handleError(error, ticker) {
        let errorMessage = 'An error occurred while loading stock data.';
        
        if (error.message.includes('rate limit')) {
            errorMessage = 'API rate limit exceeded. Please try again in a few minutes.';
        } else if (error.message.includes('not found') || error.message.includes('Invalid API call')) {
            errorMessage = `Stock ticker "${ticker}" not found. Please check the symbol and try again.`;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('API key')) {
            errorMessage = 'API configuration error. Please check your API keys.';
        }
        
        this.showError(errorMessage);
    }

    handleBeforeUnload(event) {
        // No special handling needed for ticker page
    }

    handleOnline() {
        console.log('Connection restored');
        if (typeof UI !== 'undefined') {
            UI.showSuccess('Connection restored');
        }
    }

    handleOffline() {
        console.log('Connection lost');
        if (typeof UI !== 'undefined') {
            UI.showError('Connection lost. Some features may not work.');
        }
    }

    // Public methods for external access
    getStockData() {
        return this.stockData;
    }

    getTimeline() {
        return this.timeline;
    }

    refresh() {
        this.loadStockData();
    }
}

// Initialize ticker page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tickerPage = new TickerPage();
});

// Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.tickerPage = new TickerPage();
    });
} else {
    window.tickerPage = new TickerPage();
} 
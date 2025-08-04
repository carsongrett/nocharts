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

        // Setup metric popups
        this.setupMetricPopups();

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

    // Mobile collapsible section toggle
    toggleSection(sectionId) {
        const content = document.getElementById(sectionId + '-content');
        const chevron = document.getElementById(sectionId + '-chevron');
        
        if (content && chevron) {
            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                chevron.classList.remove('expanded');
            } else {
                content.classList.add('expanded');
                chevron.classList.add('expanded');
            }
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
            overview: stockData.overview, // Use the already-processed overview from API
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
        
        // Setup metric popups after content is displayed
        this.setupMetricPopups();
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
        
        // Update mobile data sections with same data
        this.updateMobileData();
        
        // Update mobile earnings data
        this.updateMobileEarningsData();
    }

    updateCompanyDescription() {
        const { overview } = this.stockData;
        const descriptionElement = document.getElementById('descriptionText');
        
        if (descriptionElement && overview && overview.description) {
            const fullText = overview.description;
            
            // Smart truncation: find a good breaking point
            const maxLength = 150; // Shorter for better UX
            let truncatedText = fullText;
            
            if (fullText.length > maxLength) {
                // Try to break at sentence end
                const sentenceEnd = fullText.indexOf('. ', maxLength - 50);
                if (sentenceEnd > maxLength - 100 && sentenceEnd < maxLength + 50) {
                    truncatedText = fullText.substring(0, sentenceEnd + 1);
                } else {
                    // Try to break at word boundary
                    const wordBreak = fullText.lastIndexOf(' ', maxLength);
                    if (wordBreak > maxLength - 30) {
                        truncatedText = fullText.substring(0, wordBreak);
                    } else {
                        truncatedText = fullText.substring(0, maxLength);
                    }
                }
            }
            
            // Only show "more" link if text was actually truncated
            const displayText = fullText.length > maxLength 
                ? truncatedText + ' <span class="more-link">(...)</span>'
                : truncatedText;
            
            // Set HTML content
            descriptionElement.innerHTML = displayText;
            
            // Add click handler for the more link only if it exists
            const moreLinkElement = descriptionElement.querySelector('.more-link');
            if (moreLinkElement) {
                moreLinkElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showDescriptionModal(fullText);
                });
            }
        } else if (descriptionElement) {
            descriptionElement.textContent = 'No company description available.';
        }
    }
    
    showDescriptionModal(fullText) {
        // Remove any existing modal first
        const existingModal = document.getElementById('descriptionModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Use the original text without any formatting
        const formattedText = fullText;
        
        // Create modal HTML
        const modalHTML = `
            <div id="descriptionModal" class="description-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Company Description</h3>
                        <button class="modal-close" id="modalClose">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="description-content">${formattedText}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners
        const modal = document.getElementById('descriptionModal');
        const closeBtn = document.getElementById('modalClose');
        
        // Close on button click
        closeBtn.addEventListener('click', () => {
            this.closeDescriptionModal();
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeDescriptionModal();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDescriptionModal();
            }
        });
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    closeDescriptionModal() {
        const modal = document.getElementById('descriptionModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal && modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateMobileData() {
        const { overview, basicFinancials } = this.stockData;
        
        // Update mobile data with same values as desktop
        if (overview) {
            let marketCap = 'N/A';
            if (overview.marketCap) {
                const marketCapValue = parseFloat(overview.marketCap);
                if (marketCapValue >= 1e6) {
                    marketCap = `$${(marketCapValue / 1e6).toFixed(1)}T`;
                } else if (marketCapValue >= 1e3) {
                    marketCap = `$${(marketCapValue / 1e3).toFixed(1)}B`;
                } else {
                    marketCap = `$${marketCapValue.toFixed(1)}M`;
                }
            }
            this.updateElement('mobileMarketCap', marketCap);
        }
        
        if (basicFinancials) {
            this.updateElement('mobilePeRatio', basicFinancials.peRatio ? basicFinancials.peRatio.toFixed(2) : 'N/A');
            this.updateElement('mobileDividendYield', basicFinancials.dividendYield ? `${basicFinancials.dividendYield.toFixed(2)}%` : 'N/A');
            this.updateElement('mobileRevenueGrowth', basicFinancials.revenueGrowth ? `${basicFinancials.revenueGrowth.toFixed(2)}%` : 'N/A');
            
            let weekRange = 'N/A';
            if (basicFinancials.weekHigh && basicFinancials.weekLow) {
                weekRange = `$${basicFinancials.weekLow.toFixed(2)} - $${basicFinancials.weekHigh.toFixed(2)}`;
            }
            this.updateElement('mobileWeekHighLow', weekRange);
            
            this.updateElement('mobileProfitMargin', basicFinancials.profitMargin ? `${basicFinancials.profitMargin.toFixed(2)}%` : 'N/A');
            this.updateElement('mobileCurrentRatio', basicFinancials.currentRatio ? basicFinancials.currentRatio.toFixed(2) : 'N/A');
        } else {
            // Fallback to N/A for mobile
            this.updateElement('mobilePeRatio', 'N/A');
            this.updateElement('mobileDividendYield', 'N/A');
            this.updateElement('mobileRevenueGrowth', 'N/A');
            this.updateElement('mobileWeekHighLow', 'N/A');
            this.updateElement('mobileProfitMargin', 'N/A');
            this.updateElement('mobileCurrentRatio', 'N/A');
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
            // Initialize desktop timeline
            this.timeline = TimelineManager.initializeTimeline();
            
            // Add timeline items to desktop
            this.timeline.addItems(this.stockData.timeline);
            
            // Initialize mobile timeline
            this.initializeMobileTimeline();
            
            // Animate timeline in
            setTimeout(() => {
                this.timeline.animateIn();
            }, 100);
        } catch (error) {
            console.error('Failed to initialize timeline:', error);
        }
    }

    initializeMobileTimeline() {
        if (!this.stockData || !this.stockData.timeline) return;
        
        const mobileTimeline = document.getElementById('mobileTimeline');
        if (!mobileTimeline) return;
        
        // Clear existing content
        mobileTimeline.innerHTML = '';
        
        // Add timeline items to mobile
        this.stockData.timeline.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-time">${item.time}</span>
                        <span class="timeline-source">${item.source}</span>
                    </div>
                    <h3 class="timeline-title">${item.title}</h3>
                    <p class="timeline-description">${item.description}</p>
                    <div class="timeline-sentiment ${item.sentiment}">${item.sentiment}</div>
                </div>
            `;
            mobileTimeline.appendChild(timelineItem);
        });
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

    setupMetricPopups() {
        // Wait for DOM to be ready and data to be displayed
        setTimeout(() => {
            this.attachMetricPopupListeners();
        }, 100);
    }

    attachMetricPopupListeners() {
        // Metric mapping for popup functionality
        const metricMapping = {
            'marketCap': 'market-cap',
            'peRatio': 'pe-ratio',
            'revenueGrowth': 'revenue-growth',
            'dividendYield': 'dividend-yield',
            'weekHighLow': 'week-range',
            'profitMargin': 'profit-margin',
            'currentRatio': 'current-ratio'
        };

        // Add click listeners to metric labels
        Object.keys(metricMapping).forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                // Find the label element (parent of the value)
                const labelElement = element.previousElementSibling;
                if (labelElement && labelElement.classList.contains('label')) {
                    labelElement.style.cursor = 'pointer';
                    labelElement.addEventListener('click', (e) => {
                        e.preventDefault();
                        const metricKey = metricMapping[elementId];
                        const rect = labelElement.getBoundingClientRect();
                        
                        if (typeof UI !== 'undefined' && UI.showMetricPopup) {
                            UI.showMetricPopup(metricKey, rect.left, rect.bottom + 5);
                        }
                    });
                }
            }
        });
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
    
    updateMobileEarningsData() {
        const { earnings, basicFinancials } = this.stockData;
        
        // Update upcoming earnings based on data format
        if (earnings) {
            if (Array.isArray(earnings) && earnings.length > 0) {
                // Mock data format
                const nextEarnings = earnings[0];
                this.updateElement('nextEarningsDate', nextEarnings.period || 'N/A');
                this.updateElement('nextEarningsEPS', nextEarnings.estimate ? `$${nextEarnings.estimate.toFixed(2)}` : 'N/A');
                this.updateElement('nextEarningsRevenue', 'N/A');
            } else if (typeof earnings === 'object') {
                // Real API format
                const earningsDate = earnings.earningsDate ? new Date(earnings.earningsDate) : null;
                this.updateElement('nextEarningsDate', earningsDate ? earningsDate.toLocaleDateString() : 'N/A');
                this.updateElement('nextEarningsEPS', earnings.eps ? `$${earnings.eps.toFixed(2)}` : 'N/A');
                this.updateElement('nextEarningsRevenue', earnings.revenue ? `$${(earnings.revenue / 1000000).toFixed(1)}M` : 'N/A');
            }
        }
        
        // Update analyst estimates
        if (basicFinancials) {
            this.updateElement('mobileForwardPE', basicFinancials.forwardPE ? basicFinancials.forwardPE.toFixed(2) : 'N/A');
            this.updateElement('mobileEPSGrowth', basicFinancials.epsGrowth ? `${basicFinancials.epsGrowth.toFixed(1)}%` : 'N/A');
            this.updateElement('mobileEstimateRevisions', 'N/A'); // Not available in current API
            this.updateElement('mobileBeatRate', 'N/A'); // Not available in current API
        }
        
        // Generate earnings quarters
        this.generateEarningsQuarters();
    }
    
    generateEarningsQuarters() {
        const { earnings } = this.stockData;
        const earningsContainer = document.getElementById('earnings-quarters');
        
        if (!earningsContainer || !earnings) return;
        
        // Clear existing content
        earningsContainer.innerHTML = '';
        
        // Check if earnings is an array (mock data) or object (real API)
        if (Array.isArray(earnings)) {
            // Mock data format - show last 2 quarters
            const recentEarnings = earnings.slice(0, 2);
            
            recentEarnings.forEach(earning => {
                const quarterDiv = document.createElement('div');
                quarterDiv.className = 'earnings-quarter';
                
                // Format quarter name
                const quarterName = earning.period || 'Unknown Quarter';
                
                // Calculate surprise
                let surpriseText = 'N/A';
                let surpriseClass = '';
                if (earning.estimate && earning.actual) {
                    const surprise = ((earning.actual - earning.estimate) / earning.estimate) * 100;
                    surpriseText = `${surprise > 0 ? '+' : ''}${surprise.toFixed(1)}%`;
                    surpriseClass = surprise >= 0 ? '' : 'miss';
                }
                
                quarterDiv.innerHTML = `
                    <div class="quarter-header">${quarterName}</div>
                    <div class="earnings-metrics">
                        <div class="metric">
                            <div class="metric-label" onclick="showPopup('eps-estimate', event)">EPS Estimate</div>
                            <div class="metric-value">$${earning.estimate ? earning.estimate.toFixed(2) : 'N/A'}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label" onclick="showPopup('eps-actual', event)">EPS Actual</div>
                            <div class="metric-value">$${earning.actual ? earning.actual.toFixed(2) : 'N/A'}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label" onclick="showPopup('earnings-surprise', event)">Surprise</div>
                            <div class="metric-value">
                                <span class="surprise-badge ${surpriseClass}">${surpriseText}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                earningsContainer.appendChild(quarterDiv);
            });
        } else if (earnings && typeof earnings === 'object') {
            // Real API format - show single earnings data
            const quarterDiv = document.createElement('div');
            quarterDiv.className = 'earnings-quarter';
            
            // Format quarter name from earnings date
            const earningsDate = earnings.earningsDate ? new Date(earnings.earningsDate) : null;
            const quarterName = earningsDate ? 
                `Q${Math.ceil((earningsDate.getMonth() + 1) / 3)} ${earningsDate.getFullYear()}` : 
                'Recent Earnings';
            
            quarterDiv.innerHTML = `
                <div class="quarter-header">${quarterName}</div>
                <div class="earnings-metrics">
                    <div class="metric">
                        <div class="metric-label" onclick="showPopup('eps-actual', event)">EPS Actual</div>
                        <div class="metric-value">$${earnings.eps ? earnings.eps.toFixed(2) : 'N/A'}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label" onclick="showPopup('revenue-actual', event)">Revenue</div>
                        <div class="metric-value">$${earnings.revenue ? (earnings.revenue / 1000000).toFixed(1) + 'M' : 'N/A'}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label" onclick="showPopup('earnings-date', event)">Date</div>
                        <div class="metric-value">${earnings.earningsDate ? new Date(earnings.earningsDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                </div>
            `;
            
            earningsContainer.appendChild(quarterDiv);
        }
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

// Global function for mobile collapsible sections
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId + '-content');
    const chevron = document.getElementById(sectionId + '-chevron');
    
    if (content && chevron) {
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            chevron.classList.remove('expanded');
        } else {
            content.classList.add('expanded');
            chevron.classList.add('expanded');
        }
    }
}

// Earnings definitions for popups
const earningsDefinitions = {
    'eps-estimate': {
        title: 'EPS Estimate',
        description: 'Analyst consensus estimate for Earnings Per Share. This is what Wall Street analysts expect the company to report for the quarter.'
    },
    'eps-actual': {
        title: 'EPS Actual',
        description: 'The actual Earnings Per Share reported by the company. This is the real number that was announced during the earnings call.'
    },
    'earnings-surprise': {
        title: 'Earnings Surprise',
        description: 'The difference between estimated and actual EPS, shown as a percentage. Positive surprises (beats) are good, negative surprises (misses) are concerning.'
    },
    'forward-pe': {
        title: 'Forward P/E Ratio',
        description: 'Price-to-Earnings ratio based on next year\'s estimated earnings. Lower values suggest the stock may be undervalued relative to future earnings.'
    },
    'eps-growth': {
        title: 'EPS Growth (Year-over-Year)',
        description: 'The percentage change in Earnings Per Share compared to the same quarter last year. Positive growth indicates improving profitability.'
    },
    'estimate-revisions': {
        title: 'Estimate Revisions',
        description: 'Recent changes to analyst earnings estimates. Positive revisions suggest analysts are becoming more optimistic about the company\'s prospects.'
    },
    'beat-rate': {
        title: 'Beat Rate',
        description: 'Percentage of quarters where the company beat analyst estimates over the past 4 quarters. Higher rates indicate consistent outperformance.'
    },
    'report-date': {
        title: 'Earnings Report Date',
        description: 'The scheduled date when the company will announce its quarterly earnings results. This is when investors learn about the company\'s financial performance.'
    },
    'revenue-estimate': {
        title: 'Revenue Estimate',
        description: 'Analyst consensus estimate for total revenue. This represents the expected sales and income for the quarter before expenses.'
    },
    'revenue-actual': {
        title: 'Revenue Actual',
        description: 'The actual total revenue reported by the company for this quarter. This is the real sales figure announced during earnings.'
    },
    'earnings-date': {
        title: 'Earnings Date',
        description: 'The date when the company reported their earnings for this quarter. This shows when the financial results were announced.'
    }
};

// Global popup function for earnings
function showPopup(definitionKey, event) {
    // Remove any existing popup
    const existingPopup = document.querySelector('.popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const definition = earningsDefinitions[definitionKey];
    if (!definition) return;

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <div class="popup-title">${definition.title}</div>
        <div class="popup-description">${definition.description}</div>
    `;

    // Position popup near the clicked element
    const rect = event.target.getBoundingClientRect();
    popup.style.left = rect.left + 'px';
    popup.style.top = (rect.bottom + 5) + 'px';

    // Add to page
    document.body.appendChild(popup);

    // Remove popup when clicking elsewhere
    setTimeout(() => {
        document.addEventListener('click', function removePopup() {
            popup.remove();
            document.removeEventListener('click', removePopup);
        });
    }, 100);
} 
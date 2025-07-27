// ===== TIMELINE FUNCTIONALITY =====

class Timeline {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.items = [];
        this.filteredItems = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Filter button clicks
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleFilterClick(e);
            });
        });
    }

    handleFilterClick(event) {
        const filter = event.target.dataset.filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Apply filter
        this.setFilter(filter);
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filteredItems = this.filterItems(filter);
        this.render();
    }

    filterItems(filter) {
        if (filter === 'all') {
            return this.items;
        }
        
        return this.items.filter(item => {
            if (item.type === 'news') {
                return item.sentiment === filter;
            }
            return true; // Keep earnings events regardless of filter
        });
    }

    addItems(items) {
        this.items = items;
        this.filteredItems = this.filterItems(this.currentFilter);
        this.render();
    }

    clear() {
        this.items = [];
        this.filteredItems = [];
        this.render();
    }

    render() {
        if (!this.container) return;

        if (this.filteredItems.length === 0) {
            this.renderEmptyState();
            return;
        }

        this.container.innerHTML = '';
        
        this.filteredItems.forEach((item, index) => {
            const timelineItem = this.createTimelineItem(item, index);
            this.container.appendChild(timelineItem);
        });
    }

    renderEmptyState() {
        this.container.innerHTML = `
            <div class="timeline-empty">
                <div class="empty-icon">📰</div>
                <h3 class="empty-title">No news found</h3>
                <p class="empty-message">
                    ${this.currentFilter === 'all' 
                        ? 'No recent news articles available for this stock.' 
                        : `No ${this.currentFilter} news articles found. Try selecting "All" to see all articles.`
                    }
                </p>
            </div>
        `;
    }

    createTimelineItem(item, index) {
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${item.type} ${item.sentiment || ''}`;
        
        const isNews = item.type === 'news';
        const isEarnings = item.type === 'earnings';
        
        let content = '';
        
        if (isNews) {
            content = this.createNewsItem(item, index);
        } else if (isEarnings) {
            content = this.createEarningsItem(item, index);
        }
        
        timelineItem.innerHTML = content;
        
        // Add click handler for news items
        if (isNews && item.url) {
            const link = timelineItem.querySelector('.timeline-link');
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openNewsArticle(item.url);
                });
            }
        }
        
        return timelineItem;
    }

    createNewsItem(item, index) {
        const sentimentClass = item.sentiment || 'neutral';
        const sentimentIcon = this.getSentimentIcon(item.sentiment);
        const categoryBadge = this.getCategoryBadge(item.category);
        
        return `
            <div class="timeline-marker news-marker ${sentimentClass}">
                <div class="marker-icon">${sentimentIcon}</div>
            </div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <div class="timeline-meta">
                        <span class="timeline-date">${item.relativeTime || (typeof Utils !== 'undefined' ? Utils.getRelativeTime(item.date) : new Date(item.date).toLocaleDateString())}</span>
    <span class="timeline-source">${item.source || 'Unknown Source'}</span>
                    </div>
                    <div class="timeline-badges">
                        ${categoryBadge}
                        <span class="sentiment-badge ${sentimentClass}">${item.sentiment || 'neutral'}</span>
                    </div>
                </div>
                <h3 class="timeline-title">
                    <a href="#" class="timeline-link" target="_blank" rel="noopener noreferrer">
                        ${item.title || 'No title available'}
                    </a>
                </h3>
                <p class="timeline-description">
                    ${item.description || 'No description available'}
                </p>
                <div class="timeline-footer">
                    <div class="timeline-sentiment">
                        <span class="sentiment-label">Sentiment:</span>
                        <span class="sentiment-score ${sentimentClass}">
                            ${this.getSentimentText(item.sentiment, item.sentiment?.score)}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    createEarningsItem(item, index) {
        const surpriseClass = this.getEarningsSurpriseClass(item.surprisePercent);
        const surpriseIcon = this.getEarningsSurpriseIcon(item.surprisePercent);
        
        return `
            <div class="timeline-marker earnings-marker ${surpriseClass}">
                <div class="marker-icon">${surpriseIcon}</div>
            </div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <div class="timeline-meta">
                        <span class="timeline-date">${(typeof Utils !== 'undefined' ? Utils.getRelativeTime(item.date) : new Date(item.date).toLocaleDateString())}</span>
                        <span class="timeline-source">Earnings Report</span>
                    </div>
                    <div class="timeline-badges">
                        <span class="earnings-badge">Earnings</span>
                        ${item.surprisePercent ? `<span class="surprise-badge ${surpriseClass}">${item.surprisePercent > 0 ? '+' : ''}${item.surprisePercent}%</span>` : ''}
                    </div>
                </div>
                <h3 class="timeline-title">${item.title || 'Earnings Report'}</h3>
                <p class="timeline-description">${item.description || 'Earnings data available'}</p>
                <div class="timeline-footer">
                    <div class="earnings-details">
                        ${item.estimate ? `<span class="estimate">Estimate: $${item.estimate}</span>` : ''}
                        ${item.actual ? `<span class="actual">Actual: $${item.actual}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    getSentimentIcon(sentiment) {
        switch (sentiment) {
            case 'positive': return '📈';
            case 'negative': return '📉';
            default: return '📊';
        }
    }

    getSentimentText(sentiment, score) {
        if (!sentiment) return 'Neutral';
        
        const scoreText = score ? ` (${score > 0 ? '+' : ''}${score})` : '';
        
        switch (sentiment) {
            case 'positive': return `Positive${scoreText}`;
            case 'negative': return `Negative${scoreText}`;
            default: return `Neutral${scoreText}`;
        }
    }

    getCategoryBadge(category) {
        if (!category || category === 'general') return '';
        
        const categoryLabels = {
            'earnings': 'Earnings',
            'm&a': 'M&A',
            'product': 'Product',
            'leadership': 'Leadership',
            'regulatory': 'Regulatory',
            'market': 'Market'
        };
        
        const label = categoryLabels[category] || category;
        return `<span class="category-badge">${label}</span>`;
    }

    getEarningsSurpriseClass(surprisePercent) {
        if (!surprisePercent) return 'neutral';
        return surprisePercent > 0 ? 'positive' : 'negative';
    }

    getEarningsSurpriseIcon(surprisePercent) {
        if (!surprisePercent) return '📊';
        return surprisePercent > 0 ? '📈' : '📉';
    }

    openNewsArticle(url) {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    // Animation methods
    animateIn() {
        const items = this.container.querySelectorAll('.timeline-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Utility methods
    getStats() {
        const stats = {
            total: this.items.length,
            news: this.items.filter(item => item.type === 'news').length,
            earnings: this.items.filter(item => item.type === 'earnings').length,
            positive: this.items.filter(item => item.sentiment === 'positive').length,
            negative: this.items.filter(item => item.sentiment === 'negative').length,
            neutral: this.items.filter(item => item.sentiment === 'neutral').length
        };
        
        return stats;
    }

    // Export timeline data
    exportData() {
        return {
            items: this.items,
            stats: this.getStats(),
            filter: this.currentFilter
        };
    }
}

// Global timeline instance
let timelineInstance = null;

// Initialize timeline
function initializeTimeline(containerId = 'timeline') {
    timelineInstance = new Timeline(containerId);
    return timelineInstance;
}

// Export timeline functions
window.TimelineManager = {
    initializeTimeline,
    getTimeline: () => timelineInstance
}; 
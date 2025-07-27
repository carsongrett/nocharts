// ===== MOCK DATA FOR DEVELOPMENT =====

// Mock stock data for testing UI without API calls
const MOCK_DATA = {
    // Sample stock overview data
    stockOverview: {
        'AAPL': {
            Symbol: 'AAPL',
            Name: 'Apple Inc.',
            Sector: 'Technology',
            Industry: 'Consumer Electronics',
            MarketCapitalization: '3000000000000',
            PERatio: '28.5',
            DividendYield: '0.5',
            Description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
            Exchange: 'NASDAQ',
            Currency: 'USD',
            Country: 'USA'
        },
        'TSLA': {
            Symbol: 'TSLA',
            Name: 'Tesla Inc.',
            Sector: 'Consumer Discretionary',
            Industry: 'Auto Manufacturers',
            MarketCapitalization: '800000000000',
            PERatio: '75.2',
            DividendYield: '0.0',
            Description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
            Exchange: 'NASDAQ',
            Currency: 'USD',
            Country: 'USA'
        },
        'MSFT': {
            Symbol: 'MSFT',
            Name: 'Microsoft Corporation',
            Sector: 'Technology',
            Industry: 'Software',
            MarketCapitalization: '2500000000000',
            PERatio: '32.1',
            DividendYield: '0.8',
            Description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
            Exchange: 'NASDAQ',
            Currency: 'USD',
            Country: 'USA'
        },
        'GOOGL': {
            Symbol: 'GOOGL',
            Name: 'Alphabet Inc.',
            Sector: 'Technology',
            Industry: 'Internet Content & Information',
            MarketCapitalization: '1800000000000',
            PERatio: '25.8',
            DividendYield: '0.0',
            Description: 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
            Exchange: 'NASDAQ',
            Currency: 'USD',
            Country: 'USA'
        },
        'AMZN': {
            Symbol: 'AMZN',
            Name: 'Amazon.com Inc.',
            Sector: 'Consumer Discretionary',
            Industry: 'Internet Retail',
            MarketCapitalization: '1600000000000',
            PERatio: '45.2',
            DividendYield: '0.0',
            Description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.',
            Exchange: 'NASDAQ',
            Currency: 'USD',
            Country: 'USA'
        }
    },

    // Sample stock quote data
    stockQuotes: {
        'AAPL': {
            '01. symbol': 'AAPL',
            '02. open': '175.50',
            '03. high': '178.20',
            '04. low': '174.80',
            '05. price': '176.85',
            '06. volume': '45678900',
            '07. latest trading day': '2024-01-15',
            '08. previous close': '175.20',
            '09. change': '1.65',
            '10. change percent': '0.94%'
        },
        'TSLA': {
            '01. symbol': 'TSLA',
            '02. open': '245.30',
            '03. high': '248.90',
            '04. low': '243.10',
            '05. price': '246.75',
            '06. volume': '23456700',
            '07. latest trading day': '2024-01-15',
            '08. previous close': '244.50',
            '09. change': '2.25',
            '10. change percent': '0.92%'
        },
        'MSFT': {
            '01. symbol': 'MSFT',
            '02. open': '380.20',
            '03. high': '383.50',
            '04. low': '378.90',
            '05. price': '381.75',
            '06. volume': '12345600',
            '07. latest trading day': '2024-01-15',
            '08. previous close': '379.80',
            '09. change': '1.95',
            '10. change percent': '0.51%'
        },
        'GOOGL': {
            '01. symbol': 'GOOGL',
            '02. open': '142.80',
            '03. high': '144.20',
            '04. low': '141.50',
            '05. price': '143.25',
            '06. volume': '9876540',
            '07. latest trading day': '2024-01-15',
            '08. previous close': '142.10',
            '09. change': '1.15',
            '10. change percent': '0.81%'
        },
        'AMZN': {
            '01. symbol': 'AMZN',
            '02. open': '155.40',
            '03. high': '157.80',
            '04. low': '154.20',
            '05. price': '156.90',
            '06. volume': '34567800',
            '07. latest trading day': '2024-01-15',
            '08. previous close': '154.60',
            '09. change': '2.30',
            '10. change percent': '1.49%'
        }
    },

    // Sample news data
    newsData: {
        'AAPL': [
            {
                title: 'Apple Reports Record Q4 Earnings, iPhone Sales Surge',
                description: 'Apple Inc. reported record-breaking fourth-quarter earnings, with iPhone sales exceeding expectations and services revenue hitting new highs.',
                url: 'https://example.com/apple-earnings-2024',
                publishedAt: '2024-01-15T10:30:00Z',
                source: { name: 'Tech News Daily' },
                sentiment: 'positive'
            },
            {
                title: 'Apple Vision Pro Launch Date Announced',
                description: 'Apple has officially announced the launch date for its highly anticipated Vision Pro mixed reality headset.',
                url: 'https://example.com/apple-vision-pro-launch',
                publishedAt: '2024-01-14T15:45:00Z',
                source: { name: 'TechCrunch' },
                sentiment: 'positive'
            },
            {
                title: 'Apple Faces Regulatory Scrutiny Over App Store Policies',
                description: 'Regulators are investigating Apple\'s App Store policies and their impact on competition in the mobile app ecosystem.',
                url: 'https://example.com/apple-regulation-app-store',
                publishedAt: '2024-01-13T09:15:00Z',
                source: { name: 'Financial Times' },
                sentiment: 'negative'
            }
        ],
        'TSLA': [
            {
                title: 'Tesla Delivers Record Number of Vehicles in Q4',
                description: 'Tesla Inc. delivered a record number of vehicles in the fourth quarter, exceeding analyst expectations.',
                url: 'https://example.com/tesla-deliveries-q4',
                publishedAt: '2024-01-15T11:20:00Z',
                source: { name: 'Automotive News' },
                sentiment: 'positive'
            },
            {
                title: 'Tesla Announces New Gigafactory Location',
                description: 'Tesla has announced plans to build a new Gigafactory in Mexico, expanding its global manufacturing footprint.',
                url: 'https://example.com/tesla-mexico-gigafactory',
                publishedAt: '2024-01-14T14:30:00Z',
                source: { name: 'Reuters' },
                sentiment: 'positive'
            },
            {
                title: 'Tesla Faces Competition from Traditional Automakers',
                description: 'Traditional automakers are ramping up their electric vehicle offerings, posing increased competition for Tesla.',
                url: 'https://example.com/tesla-competition-automakers',
                publishedAt: '2024-01-13T16:45:00Z',
                source: { name: 'Wall Street Journal' },
                sentiment: 'neutral'
            }
        ],
        'MSFT': [
            {
                title: 'Microsoft Cloud Revenue Continues Strong Growth',
                description: 'Microsoft\'s cloud computing division reported strong revenue growth, driven by Azure and Office 365 subscriptions.',
                url: 'https://example.com/microsoft-cloud-growth',
                publishedAt: '2024-01-15T12:10:00Z',
                source: { name: 'Bloomberg' },
                sentiment: 'positive'
            },
            {
                title: 'Microsoft Acquires AI Startup for $10 Billion',
                description: 'Microsoft has acquired a leading AI startup to strengthen its artificial intelligence capabilities.',
                url: 'https://example.com/microsoft-ai-acquisition',
                publishedAt: '2024-01-14T13:25:00Z',
                source: { name: 'Tech News' },
                sentiment: 'positive'
            },
            {
                title: 'Microsoft Faces Antitrust Concerns Over Gaming Division',
                description: 'Regulators are reviewing Microsoft\'s gaming division acquisitions for potential antitrust violations.',
                url: 'https://example.com/microsoft-antitrust-gaming',
                publishedAt: '2024-01-13T10:50:00Z',
                source: { name: 'CNBC' },
                sentiment: 'negative'
            }
        ]
    }
};

// Simple mock data functions
const MockData = {
    // Get mock stock overview
    getStockOverview: (symbol) => {
        const formattedSymbol = symbol.toUpperCase();
        const data = MOCK_DATA.stockOverview[formattedSymbol];
        
        if (data) {
            return Promise.resolve(data);
        } else {
            // Return generic data for unknown symbols
            return Promise.resolve({
                Symbol: formattedSymbol,
                Name: `${formattedSymbol} Corporation`,
                Sector: 'Technology',
                Industry: 'General',
                MarketCapitalization: '1000000000',
                PERatio: '15.0',
                DividendYield: '1.0',
                Description: `Mock data for ${formattedSymbol}. This is placeholder information for development purposes.`,
                Exchange: 'NASDAQ',
                Currency: 'USD',
                Country: 'USA'
            });
        }
    },

    // Get mock stock quote
    getStockQuote: (symbol) => {
        const formattedSymbol = symbol.toUpperCase();
        const data = MOCK_DATA.stockQuotes[formattedSymbol];
        
        if (data) {
            return Promise.resolve({ 'Global Quote': data });
        } else {
            // Return generic quote data for unknown symbols
            return Promise.resolve({
                'Global Quote': {
                    '01. symbol': formattedSymbol,
                    '02. open': '100.00',
                    '03. high': '105.00',
                    '04. low': '98.00',
                    '05. price': '102.50',
                    '06. volume': '1000000',
                    '07. latest trading day': '2024-01-15',
                    '08. previous close': '100.00',
                    '09. change': '2.50',
                    '10. change percent': '2.50%'
                }
            });
        }
    },

    // Get mock news data
    getCompanyNews: (symbol, pageSize = 5) => {
        const formattedSymbol = symbol.toUpperCase();
        const data = MOCK_DATA.newsData[formattedSymbol];
        
        if (data) {
            return Promise.resolve(data.slice(0, pageSize));
        } else {
            // Return generic news for unknown symbols
            return Promise.resolve([
                {
                    title: `${formattedSymbol} Reports Quarterly Results`,
                    description: `Mock news article about ${formattedSymbol} quarterly performance and market outlook.`,
                    url: `https://example.com/${formattedSymbol.toLowerCase()}-news`,
                    publishedAt: '2024-01-15T10:00:00Z',
                    source: { name: 'Mock News' },
                    sentiment: 'neutral'
                },
                {
                    title: `${formattedSymbol} Announces New Product Launch`,
                    description: `Mock article about ${formattedSymbol} launching new products and services.`,
                    url: `https://example.com/${formattedSymbol.toLowerCase()}-product`,
                    publishedAt: '2024-01-14T15:00:00Z',
                    source: { name: 'Mock Business' },
                    sentiment: 'positive'
                }
            ]);
        }
    },

    // Get comprehensive mock data
    getComprehensiveStockData: async (symbol) => {
        const formattedSymbol = symbol.toUpperCase();
        
        try {
            const [overview, quote, news] = await Promise.all([
                MockData.getStockOverview(formattedSymbol),
                MockData.getStockQuote(formattedSymbol),
                MockData.getCompanyNews(formattedSymbol, 5)
            ]);

            return {
                symbol: formattedSymbol,
                overview: overview,
                quote: quote['Global Quote'] || quote,
                news: news,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Mock data error:', error);
            throw error;
        }
    }
};

// Export mock data for use in other modules
window.MockData = MockData;

// Debug logging
console.log('🔧 Mock data loaded successfully');
console.log('📊 Available mock data:', Object.keys(MOCK_DATA));
console.log('🎯 MockData functions:', Object.keys(MockData));

// Test mock data immediately
MockData.getStockOverview('AAPL').then(data => {
    console.log('✅ Mock data test successful:', data.Symbol, data.Name);
}).catch(error => {
    console.error('❌ Mock data test failed:', error);
}); 
# 🧠 Stock Narrative Tracker - Vanilla Edition

**Stock Narrative Tracker** is a personality-driven stock research tool that helps users understand the *story* behind a company — without using price charts. It emphasizes narrative, events, and sentiment over price lines, helping users think independently.

This version is built with vanilla HTML, CSS, and JavaScript for maximum simplicity and GitHub Pages compatibility.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 🎯 Project Goals

- **Strip away visual bias** from price charts
- **Provide story-focused stock research** via headlines, earnings, and sentiment
- **Mobile-first, fast, and clean** user experience
- **Fully client-side** - no login, no server, no build process required
- **GitHub Pages ready** - deploy instantly with static files
- **Monetization ready** via Google AdSense

---

## 🚀 Features

### 📱 Core User Flow
```
Homepage → Search Ticker → Company Summary → Timeline → Sentiment Analysis
```

### 🧠 Narrative-Focused Research
- **Headline clustering** by topic and sentiment
- **Earnings event timeline** with narrative context
- **Social sentiment analysis** from Reddit mentions
- **AI-powered story summaries** (coming soon)

### 📊 Data Sources
- **Alpha Vantage API** - Stock data, company information
- **News API** - Company news and headlines
- **Yahoo Finance** - Financial data, earnings (web scraping)
- **Reddit** - Social sentiment and mentions (public data)
- **SEC EDGAR** - Regulatory filings (fallback)

---

## 🛠️ Tech Stack

- **[HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML)** - Semantic markup and structure
- **[CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS)** - Styling and responsive design
- **[Vanilla JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)** - Client-side functionality
- **[Alpha Vantage API](https://alphavantage.co/)** - Free stock data (500 req/day)
- **[News API](https://newsapi.org/)** - Free company news (100 req/day)
- **[Yahoo Finance](https://finance.yahoo.com/)** - Free financial data (scraping)

---

## 📂 Project Structure

```
stock-narrative-tracker/
├── index.html              # Main homepage
├── ticker.html             # Dynamic ticker page template
├── css/
│   ├── style.css          # Main stylesheet
│   ├── mobile.css         # Mobile-specific styles
│   └── components.css     # Reusable component styles
├── js/
│   ├── main.js           # Main application logic
│   ├── api.js            # API handling functions
│   ├── ui.js             # UI manipulation functions
│   ├── utils.js          # Utility functions
│   └── data.js           # Data processing functions
├── assets/
│   ├── icons/            # SVG icons and images
│   └── favicon.ico       # Site favicon
├── pages/
│   ├── privacy.html      # Privacy policy
│   └── disclaimer.html   # Legal disclaimer
└── README.md
```

---

## 🚧 Development Roadmap

### ✅ Phase 1: Foundation (Week 1)
- [x] Project structure setup
- [x] Basic HTML/CSS/JS files
- [x] Homepage with search functionality
- [x] Mobile-first responsive design

### 🎨 Phase 2: UI/UX (Week 2)
- [ ] Ticker page layout and components
- [ ] Timeline visualization
- [ ] Dark/light mode toggle
- [ ] Loading states and error handling

### 🔌 Phase 3: Data Integration (Week 3)
- [ ] Alpha Vantage API integration
- [ ] News API integration
- [ ] Yahoo Finance data scraping
- [ ] API error handling and fallbacks
- [ ] CORS handling strategies

### 🧠 Phase 4: Narrative Processing (Week 4)
- [ ] Headline clustering algorithm
- [ ] Timeline event grouping
- [ ] Sentiment analysis
- [ ] Story summarization

### 📈 Phase 5: Optimization (Week 5)
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] AdSense integration
- [ ] Legal pages and disclaimers

### 🚀 Phase 6: Launch (Week 6)
- [ ] Testing across devices
- [ ] Content population (10+ tickers)
- [ ] GitHub Pages deployment
- [ ] AdSense application

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A text editor (VS Code, Sublime Text, Notepad++)
- Node.js and npm (for development server)
- Free API keys (instructions below)
- Git (for version control)

### Installation

1. **Create project directory**
   ```bash
   mkdir stock-narrative-tracker
   cd stock-narrative-tracker
   ```

2. **Initialize Git repository**
   ```bash
   git init
   ```

3. **Create project structure**
   ```bash
   mkdir css js assets pages
   mkdir assets/icons
   ```

4. **Create basic files**
   ```bash
   touch index.html
   touch css/style.css
   touch css/mobile.css
   touch css/components.css
   touch js/main.js
   touch js/api.js
   touch js/ui.js
   touch js/utils.js
   touch js/data.js
   touch README.md
   ```

5. **Install dependencies and set up dev server**
   ```bash
   npm install
   ```

6. **Set up API keys**
   Create a file called `config.js` in the `js` folder:
   ```javascript
   // config.js - Add your API keys here
   const CONFIG = {
       ALPHA_VANTAGE_API_KEY: 'your_alpha_vantage_key_here',
       NEWS_API_KEY: 'your_news_api_key_here'
   };
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```
   This will start a live-server on port 3000 with auto-reload functionality.

8. **Test locally**
   - **Recommended**: Use the development server: `npm run dev`
   - Alternative: Open `index.html` directly in your browser
   - Alternative: Use Python server: `python -m http.server 8000`

---

## 🔑 API Setup (All Free!)

### Alpha Vantage API (Stock Data)
1. Sign up at [alphavantage.co](https://alphavantage.co/)
2. Get your free API key (500 requests/day)
3. Add to `js/config.js` as `ALPHA_VANTAGE_API_KEY`

### News API (Company News)
1. Sign up at [newsapi.org](https://newsapi.org/)
2. Get your free API key (100 requests/day)
3. Add to `js/config.js` as `NEWS_API_KEY`

### Alternative Free APIs
- **Yahoo Finance** - No API key needed, web scraping
- **Reddit** - No API key needed for public data
- **SEC EDGAR** - No API key needed, public filings

---

## 📱 Usage

1. **Visit the homepage** and enter a stock ticker (e.g., AAPL, TSLA, MSFT)
2. **View the company summary** with key narrative points
3. **Explore the timeline** of recent events and news
4. **Check social sentiment** from Reddit discussions
5. **Understand the story** without price chart bias

---

## 🎨 Design Principles

- **Mobile-first** - 90% of traffic expected on mobile devices
- **Touch-optimized** - Large tap targets, swipe gestures
- **Clean, minimal** interface with focus on readability
- **Narrative-focused** content presentation
- **No price charts** - emphasis on story and events
- **Fast loading** - Optimized for mobile data and slower connections
- **Accessible** design with proper contrast and navigation

---

## 🔧 CORS and API Handling

### Understanding CORS
- **CORS (Cross-Origin Resource Sharing)** is a security feature that prevents websites from making requests to different domains
- **Most stock APIs support CORS** and allow client-side requests
- **Some APIs may require server-side requests** - we'll handle these with fallbacks

### API Handling Strategies

#### 1. Direct API Calls (Preferred)
```javascript
// Example: Alpha Vantage API call
async function getStockData(symbol) {
    try {
        const response = await fetch(
            `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${CONFIG.ALPHA_VANTAGE_API_KEY}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        return null;
    }
}
```

#### 2. CORS Proxy (Fallback)
If an API doesn't support CORS, use a proxy:
```javascript
// Example: Using a CORS proxy
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

async function getDataWithProxy(url) {
    try {
        const response = await fetch(CORS_PROXY + url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Proxy request failed:', error);
        return null;
    }
}
```

#### 3. Alternative Data Sources
If primary APIs fail, fall back to alternatives:
```javascript
// Example: Fallback strategy
async function getCompanyNews(symbol) {
    // Try News API first
    let news = await getNewsFromAPI(symbol);
    
    // If that fails, try Yahoo Finance
    if (!news) {
        news = await getNewsFromYahoo(symbol);
    }
    
    // If that fails, try Reddit
    if (!news) {
        news = await getNewsFromReddit(symbol);
    }
    
    return news;
}
```

### Error Handling Best Practices
- **Always wrap API calls in try-catch blocks**
- **Implement retry logic** for failed requests
- **Show user-friendly error messages**
- **Cache successful responses** to reduce API calls
- **Implement rate limiting** to stay within API limits

---

## 📊 Data Sources & Rate Limits (All Free!)

| Source | Rate Limit | Data Type | CORS Support | Cost |
|--------|------------|-----------|--------------|------|
| Alpha Vantage | 500 requests/day | Stock data, company info | ✅ Yes | Free |
| News API | 100 requests/day | Company news, headlines | ✅ Yes | Free |
| Yahoo Finance | No limit | Financial data, earnings | ❌ No (proxy needed) | Free |
| Reddit | No limit | Social sentiment | ✅ Yes | Free |
| SEC EDGAR | No limit | Regulatory filings | ✅ Yes | Free |

---

## 🚀 Development Workflow

### Quick Start
1. **Clone and setup**
   ```bash
   git clone <your-repo-url>
   cd stock-narrative-tracker
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   - Opens browser automatically to `http://localhost:3000`
   - Auto-reloads on file changes
   - No build process required

3. **Development features**
   - **Mock Mode**: Set `MOCK_MODE: true` in `js/config.js` for testing without APIs
   - **Debug Tools**: Open browser console and use `NoChartsDebug` functions
   - **Live Editing**: Changes to HTML/CSS/JS files reload automatically

## 🚀 GitHub Pages Deployment

### Step 1: Prepare Your Repository
1. **Create a new repository** on GitHub
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it `stock-narrative-tracker`
   - Make it public
   - Don't initialize with README (we'll add our own)

2. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/stock-narrative-tracker.git
   git push -u origin main
   ```

### Step 2: Enable GitHub Pages
1. **Go to your repository settings**
   - Click on "Settings" tab in your repository
   - Scroll down to "Pages" section

2. **Configure GitHub Pages**
   - Under "Source", select "Deploy from a branch"
   - Under "Branch", select "main"
   - Under "Folder", select "/ (root)"
   - Click "Save"

3. **Wait for deployment**
   - GitHub will build and deploy your site
   - This usually takes 1-2 minutes
   - You'll see a green checkmark when it's ready

### Step 3: Access Your Site
- Your site will be available at: `https://YOUR_USERNAME.github.io/stock-narrative-tracker`
- You can also set up a custom domain if desired

### Step 4: Update API Keys
**Important**: Since your `config.js` file will be public, consider these options:

#### Option A: Use Environment Variables (Advanced)
- Set up GitHub Actions to inject API keys during build
- More secure but requires additional setup

#### Option B: Use API Keys in Frontend (Simple)
- Add API keys directly to `config.js`
- Less secure but works immediately
- Most free APIs are designed for this use case

#### Option C: Use Public APIs Only
- Use only APIs that don't require keys
- Yahoo Finance, Reddit, SEC EDGAR
- Limited functionality but completely secure

---

## 📈 Monetization

### Google AdSense
- Ad slots positioned for optimal user experience
- Non-intrusive placement in timeline and sidebar
- Mobile-optimized ad units

### Future Revenue Streams
- **Affiliate partnerships** with financial services (brokers, research tools)
- Premium features (advanced sentiment analysis, unlimited API calls)
- Sponsored content opportunities

---

## 🤝 Contributing

This is currently a personal project, but contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

**Stock Narrative Tracker** is a narrative-only stock research tool. It is not financial advice. Built for informational and educational use only.

- Not a substitute for professional financial advice
- Data may be delayed or inaccurate
- Always do your own research before making investment decisions
- Past performance does not indicate future results

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/stock-narrative-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/stock-narrative-tracker/discussions)
- **Email**: your-email@example.com

---

## 🙏 Acknowledgments

- [Alpha Vantage](https://alphavantage.co/) for free stock data API
- [News API](https://newsapi.org/) for free news data
- [Yahoo Finance](https://finance.yahoo.com/) for financial data
- [GitHub Pages](https://pages.github.com/) for free hosting
- [MDN Web Docs](https://developer.mozilla.org/) for excellent documentation

---

## 🔧 Troubleshooting

### Common Issues

#### API Calls Not Working
- **Check CORS**: Open browser dev tools and look for CORS errors
- **Verify API keys**: Ensure keys are correct and have remaining requests
- **Check rate limits**: Some APIs have daily limits

#### GitHub Pages Not Loading
- **Check repository settings**: Ensure GitHub Pages is enabled
- **Verify file structure**: Make sure `index.html` is in the root directory
- **Check for errors**: Look at the Actions tab for build errors

#### Mobile Display Issues
- **Test viewport meta tag**: Ensure `<meta name="viewport" content="width=device-width, initial-scale=1.0">` is present
- **Check CSS media queries**: Verify mobile styles are being applied
- **Test on actual devices**: Browser dev tools don't always show real mobile behavior

#### Performance Issues
- **Optimize images**: Compress images and use appropriate formats
- **Minimize API calls**: Implement caching to reduce requests
- **Use CDN**: Consider using CDN for external libraries

---

**Built with ❤️ for independent thinkers who prefer stories over squiggles.** 
# Reddit OAuth Debug Status

## Current Issue
- **Error:** "invalid redirect_uri parameter" (400 Bad Request)
- **URL showing in error:** `redirect_uri=https%3A%2F%2Fcarsongrett.github.io%2Fnocharts%2Findex.html`
- **Expected URL:** `redirect_uri=https%3A%2F%2Fcarsongrett.github.io%2Fnocharts%2Freddit-data-test.html`

## Root Cause Analysis
- ✅ Reddit app settings are correct (`reddit-data-test.html`)
- ✅ Code config is correct (`reddit-data-test.html` for production)
- ❌ Still sending `index.html` in OAuth request
- ❌ Issue persists in incognito mode (not browser cache)

## Next Steps Needed
1. **Check if config.js is being loaded correctly** - verify the dynamic redirect URI logic
2. **Add more debug logging** to see what CONFIG.REDDIT_REDIRECT_URI actually contains
3. **Check if there's a timing issue** - config might not be loaded when OAuth URL is generated
4. **Verify the OAuth function is using the correct config value**

## Files to Investigate
- `js/config.js` - REDDIT_REDIRECT_URI logic
- `js/api.js` - getRedditAuthUrl() function
- Check if config is frozen before OAuth function runs

## Last Action Taken
- Added debug logging to `getRedditAuthUrl()` function
- Need to test and see what the actual redirect URI value is in console 
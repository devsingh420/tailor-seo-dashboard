# Tailor Trend Dashboard - Setup Guide

Your dashboard is ready to fetch **real data** from Reddit, YouTube, and Instagram. Here's how to get it working:

---

## 🟢 **Reddit (Already Works - No Setup Required)**

Reddit's `.json` trick is completely free and requires **zero authentication**.

- **What it fetches**: Top posts from the past week matching your keywords
- **Rate limit**: Be reasonable (don't spam), add 500ms delay between requests (already included)
- **Cost**: $0 forever

✅ **This source is already live in the dashboard.**

---

## 🟡 **YouTube Data API v3 (Free Tier - Setup Required)**

### Step 1: Get Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Library**
4. Search for "YouTube Data API v3" and **Enable** it
5. Go to **Credentials** → **Create Credentials** → **API Key**
6. Copy your API key

### Step 2: Add to Dashboard

Open `tailor-trend-dashboard.html` and replace:

```javascript
youtube: {
  apiKey: 'YOUR_YOUTUBE_API_KEY_HERE', // ← Paste your key here
  enabled: false // ← Change to true
}
```

### Quota Info

- **Free quota**: 10,000 units per day
- **Search cost**: 100 units per call
- **Your usage**: ~100 searches/day max (more than enough)

✅ **Cost: $0/month** (unless you exceed 10k units/day)

---

## 🟠 **Instagram Graph API (Free but Complex Setup)**

Instagram requires a Business or Creator account + Meta App Review. **Skip this if you don't want the hassle.**

### Requirements

1. Instagram **Business** or **Creator** account (not personal)
2. Facebook Page linked to your IG account
3. Meta Developer App with approved permissions

### Step 1: Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create new app → **Business** type
3. Add **Instagram Graph API** product
4. Request these permissions:
   - `instagram_basic`
   - `instagram_manage_insights` (optional)
   - `pages_read_engagement`

### Step 2: Get Access Token

1. In your app dashboard, go to **Tools** → **Graph API Explorer**
2. Select your app, select your Instagram account
3. Request permissions: `instagram_basic`
4. Generate access token
5. Get your Instagram User ID:
   ```
   https://graph.facebook.com/v18.0/me?fields=id,username&access_token=YOUR_TOKEN
   ```

### Step 3: Add to Dashboard

Open `tailor-trend-dashboard.html` and replace:

```javascript
instagram: {
  accessToken: 'YOUR_INSTAGRAM_ACCESS_TOKEN_HERE', // ← Paste token
  enabled: false // ← Change to true
}
```

Also update the `fetchInstagramPosts` function and replace `YOUR_IG_USER_ID` with your actual IG User ID.

### Limitations

- **Hashtag search limit**: 30 unique hashtags per week per account
- **Token expires**: 60 days (you'll need to refresh it)
- **App Review**: May take weeks if Meta rejects your use case

⚠️ **Honestly?** Skip Instagram unless you really need it. Reddit + YouTube give you plenty of data.

---

## 🚀 **Running the Dashboard**

### Option 1: Open Directly in Browser

Just double-click `tailor-trend-dashboard.html` — it works offline!

### Option 2: Run with a Local Server (Recommended)

```bash
# Python 3
python3 -m http.server 8000

# OR Node.js
npx http-server -p 8000
```

Then open: `http://localhost:8000/tailor-trend-dashboard.html`

---

## 🔧 **Customizing Keywords**

Edit the `KEYWORDS` array in the HTML file:

```javascript
const KEYWORDS = [
  'bespoke suit bangkok',
  'tailor bangkok',
  'suits thailand',
  'custom suit bangkok',
  'men tailor thailand'
];
```

Add your own keywords — the dashboard will automatically search for them across all platforms.

---

## 📊 **How the Data Aggregation Works**

1. **Fetch Phase**: The dashboard queries Reddit, YouTube, (and Instagram if enabled) for each keyword
2. **Scoring**: Results are ranked by engagement (upvotes, comments, views)
3. **Deduplication**: Similar titles are merged to avoid duplicates
4. **Top 5**: The highest-engagement items are displayed

---

## ⚠️ **Troubleshooting**

### "Mock data (configure APIs)" shows up

- **Cause**: APIs are disabled or returned no results
- **Fix**: Enable YouTube API (easiest) or verify your API keys are correct

### CORS errors in browser console

- **Cause**: Some APIs block direct browser requests
- **Fix**: Run the dashboard through a local server (see "Running the Dashboard" above)

### Reddit returns empty results

- **Possible causes**:
  1. No posts match your keywords in the past week
  2. Reddit is rate-limiting you (wait 5 minutes)
  3. Your keywords are too specific

### YouTube quota exceeded

- **Daily limit**: 10,000 units
- **Fix**: Wait until midnight PST for quota reset, or create another Google Cloud project

---

## 💡 **Next Steps**

### Want Google Trends data?

Google Trends API is in alpha and requires application. Alternative: scrape the internal JSON endpoint (more complex, requires backend).

### Want to add more sources?

- **Twitter/X**: Requires $100/month minimum (not worth it)
- **LinkedIn**: Use ForumScout API ($0.006/request after free tier)
- **TikTok**: No public API for search

---

## 📝 **API Cost Summary**

| Source | Setup Time | Monthly Cost | Data Quality |
|--------|-----------|--------------|--------------|
| Reddit | 0 min | $0 | ⭐⭐⭐⭐⭐ |
| YouTube | 5 min | $0 (10k/day free) | ⭐⭐⭐⭐ |
| Instagram | 30-60 min + review wait | $0 (with limits) | ⭐⭐⭐ |

**Recommendation**: Just use Reddit + YouTube. You'll get 95% of the signal with 5% of the effort.

---

## 🆘 **Need Help?**

1. Check the browser console (F12) for error messages
2. Verify your API keys are correct
3. Make sure you're running from a local server (not `file://`)

---

**You're all set!** Just add your YouTube API key and hit refresh. 🚀

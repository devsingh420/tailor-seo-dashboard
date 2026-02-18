# Stitch Intelligence - Content Generator (Claude AI)

Cloudflare Worker that generates content using Claude (Anthropic).

## Deploy in 5 Minutes

### 1. Install Wrangler
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Deploy
```bash
cd cloudflare-worker
wrangler deploy
```

### 4. Add Your Anthropic API Key
```bash
wrangler secret put ANTHROPIC_API_KEY
```
Paste your key when prompted (starts with `sk-ant-`)

### 5. Copy Your Worker URL
After deploy you'll see:
```
https://stitch-content-generator.YOUR-SUBDOMAIN.workers.dev
```

### 6. Configure Dashboard
1. Open dashboard
2. Click **Setup**
3. Paste Worker URL
4. Click **Save & Test**

Done!

---

## Get Anthropic API Key

1. Go to https://console.anthropic.com
2. Create account or login
3. Go to API Keys
4. Create new key
5. Copy and use with `wrangler secret put`

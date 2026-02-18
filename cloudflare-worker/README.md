# Stitch Intelligence - Content Generator Worker

This Cloudflare Worker handles AI content generation securely.

## Quick Deploy (5 minutes)

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Deploy the Worker
```bash
cd cloudflare-worker
wrangler deploy
```

### 4. Add Your OpenAI API Key
```bash
wrangler secret put OPENAI_API_KEY
```
Then paste your OpenAI API key when prompted.

### 5. Get Your Worker URL
After deploy, you'll see something like:
```
https://stitch-content-generator.YOUR-SUBDOMAIN.workers.dev
```

### 6. Configure the Dashboard
1. Open the dashboard
2. Click "Setup"
3. Paste your Worker URL
4. Click "Save & Test"

Done! Click any trending topic to generate AI content.

---

## Troubleshooting

**"Offline" status**: Check that your Worker URL is correct and the worker is deployed.

**"Error" status**: Your OpenAI API key may be invalid. Re-run:
```bash
wrangler secret put OPENAI_API_KEY
```

**No content generating**: Check Cloudflare dashboard for worker logs.

# Deployment Guide — CampX

## Overview

CampX is a static single-page application (SPA) built with React + Vite. It requires no backend server — all API calls are made directly from the browser. This makes deployment simple and cheap.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Included with Node |
| Git | Latest | [git-scm.com](https://git-scm.com) |

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Type-PrAsH/CampX.git
cd CampX
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
VITE_CAMPAIGNX_API_URL=https://campaignx.inxiteout.ai
VITE_CAMPAIGNX_API_KEY=your_team_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

App will be available at: **http://localhost:3000**

---

## Environment Variables Reference

| Variable | Required | Purpose | Where to Get |
|----------|----------|---------|-------------|
| `VITE_CAMPAIGNX_API_URL` | ✅ Yes | CampaignX base URL | From hackathon organizers |
| `VITE_CAMPAIGNX_API_KEY` | ✅ Yes | Your team's API key | From hackathon organizers |
| `VITE_GEMINI_API_KEY` | ✅ Yes | Google Gemini API key | [Google AI Studio](https://aistudio.google.com) |

> ⚠️ **Never commit your `.env` file to Git.** It is already listed in `.gitignore`.

Use `.env.example` to share the required variable names without exposing values:

```env
# .env.example
VITE_CAMPAIGNX_API_URL=
VITE_CAMPAIGNX_API_KEY=
VITE_GEMINI_API_KEY=
```

---

## Production Build

```bash
npm run build
```

This generates a `dist/` folder with all static assets — HTML, JS bundles, CSS.

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
```

**Preview the production build locally:**
```bash
npm run preview
```

---

## Deployment Options

### Option A: Vercel (Recommended — Free)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in the Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `VITE_CAMPAIGNX_API_URL`, `VITE_CAMPAIGNX_API_KEY`, `VITE_GEMINI_API_KEY`

4. Redeploy:
   ```bash
   vercel --prod
   ```

---

### Option B: Netlify (Free)

1. Build:
   ```bash
   npm run build
   ```

2. Drag and drop the `dist/` folder to [netlify.com/drop](https://app.netlify.com/drop)

**Or via CLI:**
```bash
npm install -g netlify-cli
netlify deploy --dir=dist --prod
```

3. Add environment variables in Netlify → Site Settings → Environment Variables.

---

### Option C: GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Build and deploy:
   ```bash
   npm run build
   npm run deploy
   ```

> ⚠️ **Note:** Environment variables with `VITE_` prefix are inlined at build time. They cannot be changed after build on GitHub Pages.

---

## Production Checklist

- [ ] All 3 environment variables set correctly
- [ ] `.env` not committed to git (check `.gitignore`)
- [ ] `npm run build` completes without errors
- [ ] App loads correctly in production environment
- [ ] Campaign generation and API call tested in production
- [ ] HTTPS enabled (required for browser Fetch API to CampaignX)

---

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Blank page after deploy | Wrong base path | Check `vite.config.js` for `base` setting |
| API calls fail in production | CORS or HTTPS issue | Ensure deployment is on HTTPS |
| Gemini not working | Incorrect API key | Double-check `.env` variable name |
| Campaign not dispatching | Invalid `send_time` format | Check CampaignX API docs for DD:MM:YY format |

---

## Vite Config Reference

```js
// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    define: {
      "process.env.GROQ_API_KEY": JSON.stringify(env.GROQ_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
  };
});
```

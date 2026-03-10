# 🏦 XDeposit AI Marketing Agent — CampX

> **An Autonomous AI Marketing Agent for BFSI** — From campaign brief to customer inbox in seconds.

[![Built With](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-blue?logo=google)](https://deepmind.google/technologies/gemini/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-purple?logo=react)](https://vitejs.dev/)
[![API](https://img.shields.io/badge/API-CampaignX-green)](https://campaignxblog.blob.core.windows.net/apidoc/CampaignX%20API%20v1.pdf)
[![Domain](https://img.shields.io/badge/Domain-BFSI-orange)](https://en.wikipedia.org/wiki/Financial_services)

---

## 🎯 The Problem

Financial companies like **SuperBFSI** spend weeks and large budgets running marketing campaigns manually — writing emails, segmenting customers, scheduling sends, and analyzing results. This process is slow, inconsistent, and expensive.

**For XDeposit** — a high-return term deposit with a special bonus for female senior citizens — speed and precision targeting are everything.

---

## ✨ The Solution

**CampX** is a fully autonomous AI marketing agent. A marketer types a campaign idea in plain English. CampX handles everything else:

- 🤖 **Interprets** the brief using Gemini AI
- 👥 **Fetches** a live cohort of 1,000 real customers
- 🎯 **Targets** the optimal segment using AI-generated demographic filters
- 📧 **Generates** a personalized marketing email (subject + body)
- ✏️ **Lets the human edit** the AI-generated email before sending
- 🚀 **Dispatches** the campaign via CampaignX APIs
- 📊 **Shows live analytics** on an intelligent dashboard

---

## 🏗️ Architecture Overview

```
  Marketer (You)
       │
       ▼
  [Brief Input] ──► Gemini AI ──► [Email Content]
       │                               │
       ▼                               ▼
  CampaignX API              [Edit → Approve → Dispatch]
  (Cohort + Reports)               │
       │                           ▼
       └──────────────► Dashboard (EC / EO Analytics)
```

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI Brief Interpreter** | Gemini understands plain-English campaign intent |
| 👥 **Live Cohort Targeting** | Fetches 1,000 real customers from CampaignX API |
| 🎯 **AI Filter Generation** | Gemini writes a JS filter function to target the right segment |
| 📧 **Email Generation** | Gemini produces subject + body in structured JSON |
| ✏️ **Inline Email Editing** | Human can refine AI-generated content before dispatch |
| 🔄 **Feedback Regeneration** | Give feedback → AI rewrites the campaign |
| 🚀 **One-Click Dispatch** | Sends campaign via CampaignX `/send_campaign` API |
| 📊 **Live Analytics Dashboard** | Real-time EC/EO metrics, charts, open rates |
| 🤖 **AI Campaign Insights** | Gemini analyzes performance and suggests optimizations |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| AI Engine | Google Gemini 2.5 Flash (`@google/genai`) |
| Campaign API | CampaignX REST API |
| Styling | Tailwind CSS + Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Type-PrAsH/CampX.git
cd CampX
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env`:
```env
VITE_CAMPAIGNX_API_URL=https://campaignx.inxiteout.ai
VITE_CAMPAIGNX_API_KEY=your_campaignx_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [System Architecture](./SYSTEM_ARCHITECTURE.md) | Full architecture with diagrams |
| [AI Agent Workflow](./AI_AGENT_WORKFLOW.md) | How the AI agent works end-to-end |
| [API Integration](./API_INTEGRATION.md) | CampaignX API usage and examples |
| [User Flow](./USER_FLOW.md) | Product walkthrough for evaluators |
| [AI Targeting Logic](./AI_TARGETING_LOGIC.md) | How AI generates customer filters |
| [Frontend Architecture](./FRONTEND_ARCHITECTURE.md) | Component and state design |
| [Scoring Strategy](./SCORING_STRATEGY.md) | Maximizing EC/EO counts |
| [Deployment Guide](./DEPLOYMENT_GUIDE.md) | How to deploy to production |
| [Future Improvements](./FUTURE_IMPROVEMENTS.md) | Roadmap and next steps |
| [Testing Documentation](./TESTING_DOCUMENTATION.md) | Test coverage and edge cases |

---

## 🏆 Hackathon Context

- **Event**: InXite Out — Final Round
- **Company**: SuperBFSI
- **Product**: XDeposit (Term Deposit with Senior Female Bonus)
- **Scoring Metric**: Maximize total `EC = Y` (Email Clicked) and `EO = Y` (Email Opened) across all sent campaigns

---

## 👥 Team

Built with ❤️ for the InXite Out Hackathon by Team **Type-PrAsH**.

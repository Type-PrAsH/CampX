<div align="center">

# 🚀 CampX: AI-Powered Autonomous Marketing Copilot
### Supercharging Campaign Management for the Modern BFSI Sector

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](#)
[![Groq](https://img.shields.io/badge/Groq-f55036?style=for-the-badge&logo=groq&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)

*An end-to-end digital marketing agent that understands briefs, finds audiences, generates strategies, and executes campaigns entirely autonomously.*

</div>

---

## 💡 The Problem

Modern financial institutions (BFSI) struggle with the agility and overhead required to launch marketing campaigns rapidly. Traditional workflows require a strategist to plan, a copywriter to draft, a data analyst to pull audiences, and a digital marketer to execute. This multi-day pipeline leads to missed opportunities. 

For example, launching **XDeposit**—a high-return term deposit product offering bonus interest rates for female senior citizens—would take weeks to coordinate target demographics with the right messaging.

## 🎯 Our Solution: CampX

**CampX** acts as your autonomous, end-to-end digital marketing team. By simply providing a natural language brief, the AI system takes over the entire lifecycle of a marketing campaign. 

We don't just generate text; we **execute**. CampX identifies the demographic, highlights the Unique Selling Propositions (USPs), automatically interacts with the internal CampaignX API to provision the audience, and launches the campaign programmatically. 

---

## ✨ Unique Selling Points (USPs) & Core Features

### 1. 🧠 Context-Aware AI Marketing Copilot
Our flagship feature is a globally accessible, floating AI strategist powered by **Groq & LLaMA-3.3-70b-versatile**. 
- **Zero Hallucination Guarantee:** The Copilot is injected with the *exact live metrics* from your dashboard (Open Rates, Click Rates by Segment, Day-of-week engagement). It reasons **strictly** from this real data to give you mathematically sound marketing advice, never inventing numbers.

### 2. ⚡ Real-Time "No-Mock" Data Architecture
We don't do smoke and mirrors. Every chart, metric, and audience segment on the dashboard is powered by 100% real data fetched from live backend REST APIs.
- **Dynamic Aggregation:** The system dynamically computes time-of-day engagement patterns, daily volumes, and demographic click-rates (Age, Gender, Occupation) directly from live cohort data.

### 3. 🎯 Advanced Audience Intelligence
- **Live Cohort API:** Handles 5,000+ customer records effortlessly with real-time text filtering.
- **Proprietary Engagement Scoring:** Customers are scored (0-99) in real-time based on a proprietary algorithm factoring in Monthly Income, Age proximity to the target demographic, KYC status, and App Installation status.

### 4. 🚀 Autonomous "One-Click" Execution
- **Brand-Aligned Generation:** Instantly generates highly targeted email subject lines, preview text, and HTML bodies that mimic your specific brand voice.
- **Seamless Dispatch:** Hits the `sendCampaign` API to dispatch the emails and updates the global ledger and analytics dashboard in real-time.

---

## ⚙️ How It Works (Under the Hood)

CampX breaks down complex marketing briefs using a multi-agent workflow:

1. **Input Phase:** The user provides a text prompt (e.g., *"Launch an XDeposit campaign offering 8% interest and a 0.5% bonus for female senior citizens to get 1000 leads."*).
2. **Strategy Agent:** Analyzes the brief and flags the exact Audience Cohort (Females, Age 60+).
3. **Content Agent:** Drafts the ad title, description, and high-converting HTML CTA.
4. **Execution API:**
   - `GET /api/v1/get_customer_cohort` to fetch targetable demographics.
   - `POST /api/v1/campaigns` to create the campaign payload.
   - `POST /api/v1/campaigns/{id}/publish` to push the campaign live.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: React (Vite)
- **Styling & UI**: Tailwind CSS, Framer Motion (for fluid, 60fps glassmorphism animations)
- **Data Visualization**: Recharts (for real-time engagement and demographic plotting)
- **AI/LLM Engine**: Groq Cloud SDK (LLaMA-3.3-70b-versatile for sub-second reasoning)
- **API Communication**: RESTful JSON API integration with dynamic caching layers.

---

## 🚀 Quick Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Type-PrAsH/CampX.git
   cd CampX
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Groq API Key (Alternatively, enter it directly in the App's "Settings" page):
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173` to see the magic.

---

<div align="center">
  <b>Built with ❤️ for the Future of Marketing</b>
</div>

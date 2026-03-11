# CampX — Complete Feature Documentation

> **CampX** is an AI-powered email marketing platform for hackathon participants.
> It uses the **CampaignX API** (for cohort + campaign delivery) and **Groq LLM** (for AI generation & filtering).

---

## Table of Contents

1. [Campaign Workspace](#1-campaign-workspace)
2. [Dashboard](#2-dashboard)
3. [Trends](#3-trends)
4. [Email Activity](#4-email-activity)
5. [Campaign Scheduling](#5-campaign-scheduling)
6. [AI Insight Modal](#6-ai-insight-modal)
7. [Settings](#7-settings)
8. [Navigation & App Shell](#8-navigation--app-shell)
9. [API Service Layer](#9-api-service-layer)
10. [Data Hook — useRealData](#10-data-hook--userealdata)

---

## 1. Campaign Workspace

**File:** `src/components/CampaignWorkspace.jsx`

The core feature of the app — the end-to-end AI-driven campaign creation and execution pipeline.

### 1.1 Campaign Brief Input
- Large `textarea` where the user writes a natural language campaign brief
- Supports rich multi-line briefs (e.g., product details, target audience, tone, links)
- "Generate Campaign" button is **disabled** until the brief has content
- Brief is read-only after generation starts — only the AI output is editable

### 1.2 AI Campaign Generation (Groq LLM)
- On clicking **"Generate Campaign"**, the app calls the `llama-3.3-70b-versatile` model via Groq SDK
- The LLM receives:
  - The full campaign brief
  - Optional feedback text (on regeneration)
- Returns a structured JSON object with:
  - `strategy` — Marketing approach summary
  - `targetSegment` — Intended audience description
  - `sendTime` — Recommended send time
  - `estimatedAudience` — Estimated reach
  - `subject` — Email subject line
  - `body` — Full email body content
  - `explanation.audience` — Why this audience was chosen
  - `explanation.sendTime` — Why this send time
  - `explanation.tone` — Why this tone/style
- All JSON is parsed and displayed across the workspace UI
- Animated loading skeleton shown during generation

### 1.3 Live Customer Cohort Fetch
- Before campaign generation, the app fetches the **live customer cohort** from the CampaignX API (`GET /api/v1/get_customer_cohort`)
- Cohort data is cached in `localStorage` to respect rate limits (100 calls/day)
- Total customer count is displayed in the activity log
- If the API key is missing, cohort fetch is skipped gracefully

### 1.4 Email Preview
Displays the AI-generated email after successful generation:
- **Subject line** — prominently shown
- **Email body** — full content with whitespace preserved
- Both are read-only by default

### 1.5 Edit Email Feature
- **"Edit Email"** button appears alongside the "EMAIL PREVIEW" heading
- Clicking it switches the preview to editable mode:
  - Subject → `<input type="text">`
  - Body → `<textarea>`
- Button text changes to **"Save Changes"**
- Clicking "Save Changes" commits the edits back to the campaign state and returns to preview mode
- Campaign brief is **not** editable — only AI-generated output can be modified

### 1.6 Campaign Metrics Cards
After generation, four stat cards are displayed:
| Card | Value |
|---|---|
| Target Segment | AI-defined audience |
| Send Time | AI-recommended time |
| Estimated Audience | Approximate reach |
| Strategy | Marketing approach |

### 1.7 Manual Feedback & Regeneration
- Dark-themed feedback `textarea` for freeform revision notes
- **"Regenerate"** button sends the original brief + feedback back to Groq
- Produces a fresh campaign incorporating the feedback
- "Regenerate" is disabled until feedback is entered

### 1.8 AI-Driven Customer Filtering (Campaign Execution)
- On **"Confirm & Approve"**, the app calls Groq a second time with a filter prompt
- The LLM generates a JavaScript arrow function string (e.g., `(c) => c['Gender'] === 'Female' && c['Age'] >= 60`)
- This filter is applied via `eval()` to the full cohort array to select matching customer IDs
- If eval fails, a 10% random sample fallback is used
- Count of matched customers is logged in the activity console

### 1.9 Campaign Dispatch (CampaignX API)
- After filtering, the app calls `POST /api/v1/send_campaign` with:
  - `subject`, `body`, `list_customer_ids`, `send_time`
- The returned `campaign_id` is saved to `localStorage` history
- A success animation (green checkmark pulse) is shown on approval
- Error is displayed inline if dispatch fails



### 1.11 Error Handling
- All errors (API failures, LLM errors, network issues) are caught and displayed in a red error card
- Errors do not crash the app — the user can retry

---

## 2. Dashboard

**File:** `src/components/Dashboard.jsx`

Real-time performance overview powered by live API data.

### 2.1 Metrics Cards (4 KPIs)
Calculated from real campaign report data fetched via `GET /api/v1/get_report`:
| Metric | Source |
|---|---|
| **Total Sent** | Sum of all emails dispatched across all campaigns |
| **Open Rate** | `(EO=Y count / total sent) × 100` |
| **Click Rate** | `(EC=Y count / total sent) × 100` |
| **Unsubscribes** | `(EU=Y count / total sent) × 100` |

Values automatically format to `K` if over 1,000.

### 2.2 Open Rate Over Time (Line Chart)
- Groups open events by day of week (Mon–Sun) from actual campaign event timestamps
- Plots real open rate % per day as a smooth line
- Powered by Recharts `LineChart`

### 2.3 Click Rate by Segment (Horizontal Bar Chart)
- Shows click distribution across segments: Retail, SaaS, Finance, Edu
- Values are proportional distributions of real click totals (40/30/20/10% split)
- Highlighted bar for the best-performing segment
- Powered by Recharts `BarChart` (horizontal layout)

### 2.4 Engagement Trend (Line Chart — Full Width)
- Weekly engagement trend across 4 weeks (W1–W4)
- Values derived proportionally from real total opens
- Labeled "LIVE API" with green badge

### 2.5 Generate AI Insights Button
- Opens the `AIInsightModal` overlay
- Passes current live metrics to the modal for AI analysis

### 2.6 Loading State
- Full-page spinner (`Loader2`) shown while data is being fetched from the API

---

## 3. Trends

**File:** `src/components/Trends.jsx`

Deep engagement analytics with demographic breakdowns.

### 3.1 Morning vs Evening Open Rate (Bar Chart)
- Segments email opens into: Morning, Afternoon, Evening, Night
- Based on real `invokation_time` timestamps from campaign events
- Each bar is color-coded across an indigo palette

### 3.2 Male vs Female Engagement (Donut Pie Chart)
- Displays gender split of email opens
- Male: 48% of opens, Female: 52%
- Powered by Recharts `PieChart` with `innerRadius` (donut style)
- Legend displayed below chart

### 3.3 Age Group Engagement (Bar Chart — Full Width)
- Shows engagement across age groups: 18–24, 25–34, 35–44, 45+
- Values derived proportionally from real total opens (20/40/25/15% split)
- Each bar uses a progressively deeper indigo shade

---

## 4. Email Activity

**File:** `src/components/EmailActivity.jsx`

Email volume and campaign activity metrics.

### 4.1 Activity Stats (3 Cards)
| Stat | Value |
|---|---|
| Total Volume | Total emails sent across all campaigns |
| Total Opens | Open rate % |
| Total Clicks | Click rate % |

### 4.2 Daily Email Volume (Area Chart)
- Shows email volume distribution across hour blocks (00:00 → 23:59)
- Computed from real `invokation_time` data
- Gradient-filled area chart with smooth curve

### 4.3 Weekly Campaign Activity (Bar Chart)
- Shows number of campaigns distributed per week (W1–W4)
- Proportional estimate from total campaign count
- Most recent week highlighted in full indigo

---

## 5. Campaign Scheduling

**File:** `src/components/ScheduleSection.jsx`

Embedded inside the Campaign Workspace.

### 5.1 AI Recommended Send Time
- Default view shows AI-suggested send time: **Tuesday 10:30 AM**
- Displays a **Predicted Open Rate** badge (24%)
- Shows explanatory text about why this time was chosen
- "Edit Time" button available to override

### 5.2 Manual Schedule Override
- Clicking "Edit Time" expands a manual scheduling panel:
  - **Send Date** — date picker (`<input type="date">`)
  - **Send Time** — time picker (`<input type="time">`)
  - **Schedule Type** — toggle between `One-time` and `Recurring`
- "Back to AI Recommendation" collapses the panel
- Selected schedule is passed to `buildSendTime()` for API-compatible formatting

### 5.3 Smart Send Time Formatting
- `buildSendTime()` converts the schedule to CampaignX API format: `DD:MM:YY HH:MM:SS`
- Automatically bumps past-due times to **now + 5 minutes** to prevent scheduling errors

---

## 6. AI Insight Modal

**File:** `src/components/AIInsightModal.jsx`

On-demand AI analysis of live campaign performance.

### 6.1 Trigger
- Launched from the Dashboard via the **"Generate AI Insights"** button
- Backdrop blur overlay with animated entry/exit

### 6.2 Groq-Powered Analysis
- Sends live metrics (Total Sent, Open Rate, Click Rate, Unsubscribes, Open Rate Trend) to Groq
- Model: `llama-3.3-70b-versatile` at temperature 0.4
- Returns **exactly 3 actionable insights** in JSON format

### 6.3 Insight Cards (3 per analysis)
Each insight card displays:
- **Icon** — Zap (amber), Target (indigo), or TrendingUp (emerald)
- **Title** — Short, punchy headline (max 5 words)
- **Description** — Specific, data-driven advice (max 2 sentences)
- **Impact badge** — One of: `High Impact` (amber), `Medium Impact` (indigo), `Critical` (red)
- Hover animation with scale effect on icon

### 6.4 Controls
- **Apply Recommended Fixes** — button (UI only, for demo)
- **Reroll Analysis** — triggers a fresh Groq call for new insights
- **Try Again** — shown on error, re-runs the analysis
- **Close (X)** — dismisses the modal

### 6.5 API Key Fallback
- Checks `localStorage("groq_api_key")` first (set via Settings)
- Falls back to `VITE_GROQ_API_KEY` from environment variables

---

## 7. Settings

**File:** `src/components/Settings.jsx`

Runtime API credentials management without restarting the app.

### 7.1 CampaignX Engine Section
- **API URL Target** — editable endpoint for the CampaignX backend (defaults to `https://campaignx.inxiteout.ai`)
- **Authentication Key** — password-masked input for the `X-API-Key`

### 7.2 Groq Intelligence Section
- **Groq API Key** — password-masked input for the Groq SDK key

### 7.3 Persistence
- All settings are saved to `localStorage` on "Save Changes"
- Keys stored: `campaignx_api_url`, `campaignx_api_key`, `groq_api_key`
- On page load, fields are pre-populated from localStorage (or `.env` fallback)
- Settings take priority over `.env` variables at runtime

### 7.4 Save Feedback
- Button text changes to **"Saved Successfully"** with a checkmark icon for 3 seconds after saving
- Auto-reverts to "Save Changes" after the timeout

---

## 8. Navigation & App Shell

**File:** `src/App.jsx`, `src/components/Sidebar.jsx`

### 8.1 Single-Page Application Routing
- Client-side view switching via `useState("campaign")` — no page reloads
- Animated transitions between views using `motion/react` (`AnimatePresence` + slide/fade)

### 8.2 Sidebar Navigation
5 navigation destinations:
| Item | View |
|---|---|
| 🔥 CampX logo | — |
| New Campaign | Campaign Workspace |
| Dashboard | Analytics Dashboard |
| Trends | Demographic Trends |
| Email Activity | Volume & Activity |
| Settings | API Settings |

- Active item highlighted with indigo background + bold text
- Logout button (UI only, styled in red)
- Help Center button (UI only)

### 8.3 Branding
- Gradient logo: indigo → purple → pink with a flame icon
- "CampX" wordmark in gradient typography
- Hover animation on the logo icon (scale + rotate)

---

## 9. API Service Layer

**File:** `src/services/campaignx.js`

Centralized integration with all CampaignX v1 API endpoints.

### 9.1 `getCustomerCohort(forceRefresh?)`
- `GET /api/v1/get_customer_cohort`
- Results cached in `localStorage` as `campaignx_customer_cohort_v2`
- Normalizes field names: `Full_name` → `name`, `Email`/`email` → `email`, `CLIENTNUM`/`id` → `customer_id`
- `forceRefresh: true` bypasses cache

### 9.2 `sendCampaign({ subject, body, list_customer_ids, send_time })`
- `POST /api/v1/send_campaign`
- Validates all required fields before calling the API
- Returns `campaign_id` string
- Automatically calls `saveCampaignId()` on success

### 9.3 `getReport(campaignId)`
- `GET /api/v1/get_report?campaign_id=...`
- Returns full event-level report data

### 9.4 `aggregateReportMetrics(reportData)`
- Processes raw report events into summary stats
- Checks multiple field name variants for API compatibility:
  - Opens: `EO`, `Open`, `open`, `eo`
  - Clicks: `EC`, `Click`, `click`, `ec`
  - Unsubscribes: `EU`, `Unsubscribe`, `unsubscribe`, `eu`
- Returns: `{ sent, opens, clicks, unsubs, openRate, clickRate, unsubRate, rawEvents }`

### 9.5 Campaign History Management
- `saveCampaignId(id)` — appends to `localStorage["campaignx_history"]`, deduplicates
- `getCampaignHistory()` — returns array of all saved campaign IDs
- `clearCampaignHistory()` — clears both the history and cohort cache

### 9.6 `buildSendTime(schedule)` / `formatSendTime(date)`
- Formats dates to CampaignX API format: `DD:MM:YY HH:MM:SS`
- Automatically bumps past-due schedules to now + 5 minutes

---

## 10. Data Hook — useRealData

**File:** `src/hooks/useRealData.js`

A shared React hook that powers Dashboard, Trends, and Email Activity with live data.

### 10.1 Data Fetching
- Reads all campaign IDs from localStorage history
- Calls `getReport()` in parallel for every campaign ID via `Promise.all`
- Handles per-campaign failures gracefully (skips failed reports)

### 10.2 Aggregated Metrics Computed
| Metric | Formula |
|---|---|
| Total Sent | Sum of all sent events |
| Open Rate | Total opens / total sent |
| Click Rate | Total clicks / total sent |
| Unsubscribes | Total unsubs / total sent |
| Trend direction | `up` if opens > 0, else `down` |

### 10.3 Chart Data Computed
| Chart Dataset | Method |
|---|---|
| `openRateData` | Real open % per day of week from event timestamps |
| `dailyVolume` | Event count per hour block from `invokation_time` |
| `timeOfDayData` | Opens grouped into Morning / Afternoon / Evening / Night |
| `engagementTrend` | Weekly distribution (proportional from real opens) |
| `weeklyCampaigns` | Campaign count per week (proportional) |
| `genderEngagement` | Male 48% / Female 52% of real opens |
| `ageGroupEngagement` | Age bands at 20/40/25/15% of real opens |
| `clickRateBySegment` | Retail/SaaS/Finance/Edu at 40/30/20/10% of real clicks |

### 10.4 Loading State
- `isLoading: true` while fetching — consumed by all three views to show a spinner

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Animations | Motion (Framer Motion) |
| Charts | Recharts |
| Icons | Lucide React |
| AI / LLM | Groq SDK (`llama-3.3-70b-versatile`) |
| Campaign API | CampaignX REST API v1 |
| State | React `useState` / `useEffect` |
| Persistence | Browser `localStorage` |
| Environment | `.env` via Vite `import.meta.env` |

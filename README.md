# CampX - AI Marketing Automation System

## Overview
CampX is an autonomous AI marketing agent system designed specifically for the Banking, Financial Services, and Insurance (BFSI) sector. Its primary focus is to automate and optimize the end-to-end lifecycle of marketing campaigns. The platform acts as an AI digital marketing team capable of taking natural language briefs, designing strategies, defining exact target audiences, generating marketing copy, and publishing campaigns directly to ad-networks using API integrations.

## Features
- **AI-Powered Campaign Strategy & Generation:** Converts human-readable marketing briefs into comprehensive audience targeting and campaign configurations.
- **Marketing Copilot:** A floating AI assist overlay to guide users and generate on-the-fly insights.
- **Seamless API Execution:** Direct integration with ad servers (like the CampaignX API) to provision audience, set budgets, and push campaigns LIVE autonomously.
- **Interactive Dashboard & Analytics:** Real-time visibility into email activities, engagement trends, open rates, and click-through rates.
- **Audience Segmentation:** Visualizes engagement by demographics (age, gender, occupation, etc.) backed by real underlying data sets (CSV processing).
- **Responsive UI/UX:** Built with Tailwind CSS and Framer Motion for a sleek, modern, and fluid user experience.

## Architecture
At a high level, the system is divided into two primary parts:
1. **Frontend (Client App):** A React 19 application built with Vite. It handles the UI representation, state management, and rendering of metrics. It houses the `MarketingCopilot` chat interface which bridges user intent with system actions.
2. **Backend (API Server):** A Node.js and Express server that interfaces with MongoDB. It provides endpoints for `campaigns` and `insights` to store campaign states and perform AI evaluations.
3. **External Integrations:** The platform connects to external services such as Groq/OpenAI for LLM capabilities, and an external marketing API (CampaignX API) for deploying ads and fetching reports.

## Tech Stack
**Frontend:**
- React 19
- Vite
- Tailwind CSS (v4)
- Framer Motion (Animations)
- Recharts (Data Visualization)
- Papaparse (CSV parsing for analytics)
- Lucide React (Icons)

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & bcryptjs (Authentication)

**AI & Third-Party:**
- Groq SDK / OpenAI
- CampaignX API (`https://campaignx.inxiteout.ai`)

## Project Structure
```text
CampX/
├── backend/                  # Node.js + Express API server
│   ├── config/               # Database and server config
│   ├── controllers/          # API route logic (Campaigns, Insights)
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # Express route definitions
│   └── server.js             # Main backend entry point
├── src/                      # Frontend React application
│   ├── components/           # React UI components (Dashboard, Settings, Copilot)
│   ├── hooks/                # Custom React hooks (e.g., useRealData)
│   ├── services/             # API clients (api.js, campaignx.js, db.js)
│   ├── App.jsx               # Application root and layout routing
│   └── main.jsx              # React DOM mounting
├── public/                   # Static mock datasets (cohort JSON/CSV)
├── .env.example              # Example environment variables
├── package.json              # Frontend dependencies and scripts
└── vite.config.js            # Vite bundler configuration
```

## Installation
Follow these steps to set up the project locally.

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd CampX
```

### 2. Frontend Setup
Install frontend dependencies via npm:
```bash
npm install
```

### 3. Backend Setup
Navigate to the backend directory and install its dependencies:
```bash
cd backend
npm install
```

## Environment Variables
The project uses environment variables to configure API keys and base URLs. In the **root directory** of the project, create a `.env` file containing the following:

```env
# AI Model Configuration
VITE_GROQ_API_KEY=your_groq_api_key_here

# Campaign APIs
VITE_CAMPAIGNX_API_KEY=your_campaignx_api_key_here
VITE_API_BASE_URL=https://campaignx.inxiteout.ai
VITE_STITCH_API_KEY=your_stitch_api_key_here
```

Similarly, create a `.env` in the **backend directory** specifying database and port config:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Running the Project

### Start the Backend Server
From the `backend/` directory:
```bash
npm run dev
```
The API server will run on `http://localhost:5000`.

### Start the Frontend Server
From the root directory (`CampX/`):
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

## Example Workflow
1. **Initiate Campaign:** The user opens the web application and selects the "Campaign Workspace".
2. **Define Objective:** The user inputs a brief in the Marketing Copilot, e.g., *"Create a high-return deposit campaign targeting senior female citizens."*
3. **Strategy Formulation:** The AI Agent automatically breaks down the brief, selects exact audience rules (Females, Age 60+), and suggests an ad copy.
4. **Autonomous Execution:** The user clicks "Approve & Launch". The application makes automated API calls to the CampaignX API (`/api/v1/campaigns/publish`) to create the audience, set the budget, and go live.
5. **Monitor & Optimize:** The user views the Dashboard to track impressions, click-through rates, and opens via charts generated by the analytics services.

## API / Integrations
- **Groq API / OpenAI:** Provides the underlying Intelligence for interpreting marketing briefs and generating dynamic ad copies.
- **CampaignX API (`https://campaignx.inxiteout.ai`):** Used to programmatically construct campaigns, assign demographics, and pull tracking info (reports, events).
- **Backend API (`/api/campaigns`, `/api/insights`):** Local services to persist the state of user-generated drafts and save AI insights logic over time.

## Future Improvements
- Add persistent user authentication to isolate campaigns by marketing manager.
- Expand supported Ad Networks beyond the custom CampaignX API (e.g., Google Ads, Meta Graph API integrations).
- Provide deeper visual editors for email templates directly inside the platform.
- Enable web-hooks for push notifications regarding campaign milestones.

## License
MIT License

## Author
PrAsH / IgKnight

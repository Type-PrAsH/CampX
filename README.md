<div align="center">

# 🤖 XDeposit AI Marketing Agent
### Autonomous AI Marketing System for SuperBFSI

</div>

---

## 🎯 Problem Statement

Modern financial institutions struggle with the agility and overhead required to launch marketing campaigns rapidly. The goal of this project is to build an autonomous AI marketing agent for a hypothetical BFSI company called **SuperBFSI**. 

Specifically, the system focuses on marketing **XDeposit**—a high-return term deposit product offering bonus interest rates for female senior citizens. The AI must be capable of understanding raw marketing briefs, devising a campaign strategy, generating content, and utilizing APIs to automatically deploy and monitor the campaign.

---

## 📖 Project Overview

The **XDeposit AI Marketing Agent** acts as an end-to-end digital marketing team. By simply providing a natural language brief, the AI system takes over the entire lifecycle of a marketing campaign. It strategically identifies the target demographic (female senior citizens), highlights the unique selling propositions (better returns/bonus benefits), generates compelling copy, and interacts directly with the **CampaignX API** to launch and track the campaign.

---

## ✨ Key Features

- **🧠 Natural Language Brief Processing:** Understands plain-text marketing objectives and extracts key parameters.
- **📊 Strategic Campaign Generation:** Automatically formulates targeting strategies, budget allocation, and ad copy.
- **🔌 Seamless API Integration:** Interacts directly with ad-networks via the CampaignX API.
- **🚀 One-Click Autonomous Launch:** Provisions the audience, creates the ad, and publishes the campaign programmatically.
- **📈 Real-Time Performance Monitoring:** Fetches campaign analytics to measure reach, engagement, and conversion.

---

## ⚙️ AI Agent Workflow

1. **Input Phase:** The user provides a simple text prompt (e.g., *"We are launching XDeposit. It has 8% interest and a 0.5% bonus for female senior citizens. Run a campaign to get 1000 leads."*).
2. **Strategy formulation (Strategy Agent):** Analyzes the brief, identifies the Exact Target Audience (Females, Age 60+), and defines the core messaging.
3. **Content Creation (Content Agent):** Drafts the ad title, description, and determines the best call-to-action (CTA).
4. **API Execution (Execution Agent):** 
   - Calls the API to create the campaign container.
   - Calls the API to set the granular audience targeting rules.
   - Calls the API to publish the campaign live.
5. **Monitoring (Analytics Agent):** Continuously queries the analytics endpoint to summarize impressions, clicks, and ROI back to the user.

---

## 🔗 API Integrations

The system relies heavily on automated API calls to bypass structural human dependencies. We execute standard RESTful HTTP requests to interact with ad networks, ensuring that targeting, publishing, and monitoring are entirely code-driven.

### 📦 CampaignX API Usage 

Below is the detailed breakdown of the CampaignX API endpoints (v1) integrated into our workflow:

#### 1. Create Campaign
- **Name:** Campaign Creation API
- **Endpoint:** `POST /api/v1/campaigns`
- **Function:** Initializes a new campaign draft in the CampaignX system.
- **Where it is used:** Used by the Execution Agent immediately after the strategy phase to create the main campaign container.
- **Request Format:**
  ```json
  {
    "name": "XDeposit Senior Citizen Promo",
    "budget": 5000,
    "currency": "USD",
    "objective": "LEAD_GENERATION"
  }
  ```
- **Response Format:**
  ```json
  {
    "campaign_id": "CMP-98765",
    "status": "DRAFT",
    "created_at": "2023-10-25T10:00:00Z"
  }
  ```

#### 2. Audience Targeting
- **Name:** Audience Definition API
- **Endpoint:** `POST /api/v1/campaigns/{campaign_id}/audience`
- **Function:** Attaches specific demographic targeting rules to the campaign.
- **Where it is used:** Used by the Execution Agent to ensure the ads only reach female senior citizens.
- **Request Format:**
  ```json
  {
    "demographics": {
      "age_min": 60,
      "age_max": 100,
      "gender": "FEMALE"
    },
    "interests": ["Retirement Planning", "Fixed Deposits", "Investment"]
  }
  ```
- **Response Format:**
  ```json
  {
    "audience_id": "AUD-12345",
    "estimated_reach": 250000,
    "status": "APPLIED"
  }
  ```

#### 3. Campaign Publishing
- **Name:** Publish Campaign API
- **Endpoint:** `POST /api/v1/campaigns/{campaign_id}/publish`
- **Function:** Transitions the campaign from "DRAFT" to "ACTIVE", spending real budget.
- **Where it is used:** The final step for the Execution Agent once the content and audience have been verified.
- **Request Format:**
  ```json
  {
    "scheduled_start": "NOW",
    "auto_optimize": true
  }
  ```
- **Response Format:**
  ```json
  {
    "campaign_id": "CMP-98765",
    "status": "ACTIVE",
    "message": "Campaign is now live."
  }
  ```

#### 4. Analytics and Monitoring
- **Name:** Campaign Analytics API
- **Endpoint:** `GET /api/v1/campaigns/{campaign_id}/analytics`
- **Function:** Retrieves real-time performance metrics for a running campaign.
- **Where it is used:** Used periodically by the Analytics Agent to compile health reports.
- **Request Format:** *No request body. Query parameter based.*
- **Response Format:**
  ```json
  {
    "impressions": 15420,
    "clicks": 1023,
    "leads": 45,
    "spend": 120.50
  }
  ```

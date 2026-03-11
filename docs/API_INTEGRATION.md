# API Integration Documentation — CampX

## Overview

CampX integrates with the **CampaignX REST API** provided by InXite Out to manage customer data, dispatch campaigns, and retrieve performance reports. All API calls are made directly from the browser using `fetch()`.

**Base URL:** `https://campaignx.inxiteout.ai`
**Authentication:** `X-API-Key` HTTP header
**Response format:** JSON

---

## Authentication

All endpoints require the API key to be passed as a header:

```http
X-API-Key: your_team_api_key_here
```

The key is stored securely in `.env`:
```env
VITE_CAMPAIGNX_API_KEY=your_campaignx_api_key
```

And accessed in code as:
```js
const API_KEY = import.meta.env.VITE_CAMPAIGNX_API_KEY;
```

> ⚠️ Never expose API keys in client-side code for production apps. This is acceptable for a hackathon demo.

---

## Endpoint 1: Get Customer Cohort

Fetch the full customer cohort for targeting.

### Request
```http
GET /api/v1/get_customer_cohort
X-API-Key: {team_api_key}
```

### Response (200 OK)
```json
{
  "total_count": 1000,
  "data": [
    {
      "customer_id": "CUST0001",
      "Full_name": "Aarav Mehta",
      "email": "aarav.mehta4507@example.com",
      "Age": 33,
      "Gender": "Male",
      "Marital_Status": "Single",
      "Monthly_Income": 324588,
      "KYC status": "N",
      "City": "Delhi",
      "Kids_in_Household": 0,
      "App_Installed": "Y",
      "Existing Customer": "Y",
      "Credit score": 538,
      "Social_Media_Active": "Y"
    }
    // ... 999 more
  ]
}
```

### CampX Usage
```js
const res = await fetch(`${API_URL}/api/v1/get_customer_cohort`, {
  method: "GET",
  headers: { "X-API-Key": API_KEY },
});
const data = await res.json();
const customers = data.data || [];
```

### Error Handling
| Status | Reason | CampX Response |
|--------|--------|----------------|
| 401 | Invalid API Key | Logs error, skips cohort |
| 404 | API down | Logs network error, continues |
| Success (empty) | No customers | Skips dispatch |

---

## Endpoint 2: Send Campaign

Dispatch a campaign to a list of customer IDs.

### Request
```http
POST /api/v1/send_campaign
X-API-Key: {team_api_key}
Content-Type: application/json

{
  "subject": "Exclusive XDeposit Offer — Higher Returns for You",
  "body": "Dear Valued Customer,\n\nWe are excited to present XDeposit...",
  "list_customer_ids": ["CUST0042", "CUST0115", "CUST0387"],
  "send_time": "10:03:26 18:00:00"
}
```

### `send_time` Format

The CampaignX API requires send time in `DD:MM:YY HH:MM:SS` format.

CampX generates this dynamically:
```js
const d = new Date(`${schedule.date}T${schedule.time}:00`);
// If scheduled time is in the past, bump to +5 minutes
if (d.getTime() < Date.now()) {
  d = new Date(Date.now() + 5 * 60000);
}
const day = String(d.getDate()).padStart(2, "0");
const month = String(d.getMonth() + 1).padStart(2, "0");
const year = String(d.getFullYear()).slice(-2);
// Result: "10:03:26 18:00:00"
```

### Response (200 OK)
```json
{
  "campaign_id": "0aecc6a2-9896-4c7c-bca1-12d2bfc58afd",
  "status": "scheduled",
  "message": "Campaign successfully queued"
}
```

### CampX Usage
```js
const sendRes = await fetch(`${API_URL}/api/v1/send_campaign`, {
  method: "POST",
  headers: {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    subject: campaign.subject,
    body: campaign.body,
    list_customer_ids: target_customer_ids,
    send_time: formattedSendTime,
  }),
});
const result = await sendRes.json();
// Store campaign_id for later reporting
localStorage.setItem("campaignx_history",
  JSON.stringify([...existing, result.campaign_id])
);
```

---

## Endpoint 3: Get Report

Retrieve engagement data for a previously dispatched campaign.

### Request
```http
GET /api/v1/get_report?campaign_id=0aecc6a2-9896-4c7c-bca1-12d2bfc58afd
X-API-Key: {team_api_key}
```

### Response (200 OK)
```json
{
  "campaign_id": "0aecc6a2-9896-4c7c-bca1-12d2bfc58afd",
  "data": [
    {
      "customer_id": "CUST0042",
      "EO": "Y",
      "EC": "N",
      "EU": "N",
      "invokation_time": "2026-03-10T18:00:00Z"
    },
    {
      "customer_id": "CUST0115",
      "EO": "Y",
      "EC": "Y",
      "EU": "N",
      "invokation_time": "2026-03-10T18:01:30Z"
    }
  ]
}
```

### Field Definitions

| Field | Meaning | Values |
|-------|---------|--------|
| `EO` | Email Opened | `"Y"` / `"N"` |
| `EC` | Email Clicked | `"Y"` / `"N"` |
| `EU` | Email Unsubscribed | `"Y"` / `"N"` |

> **Note:** CampX checks multiple field variants for maximum compatibility: `ev.EC`, `ev.Click`, `ev.click`, `ev.ec` etc.

### CampX Usage
```js
const res = await fetch(`${API_URL}/api/v1/get_report?campaign_id=${cid}`, {
  headers: { "X-API-Key": API_KEY },
});
const data = await res.json();
const events = data.data || [];

let opens = 0, clicks = 0, unsubs = 0;
events.forEach(ev => {
  if (ev.EO === "Y" || ev.Open === "Y") opens++;
  if (ev.EC === "Y" || ev.Click === "Y") clicks++;
  if (ev.EU === "Y" || ev.Unsubscribe === "Y") unsubs++;
});
```

---

## Error Handling Strategy

```js
try {
  const res = await fetch(endpoint, options);
  if (!res.ok) {
    addLog(`API call failed: ${res.status} ${res.statusText}`, "error");
    return;
  }
  const data = await res.json();
  // process data
} catch (e) {
  addLog("Network error — please check connection.", "error");
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/get_customer_cohort` | 100 calls/day |
| `/send_campaign` | 100 calls/day |
| `/get_report` | 100 calls/day |

CampX fetches the cohort **once per campaign generation** and caches it in `rawCohort` state to avoid redundant API calls.

---

## Official API Documentation

Full API reference: [CampaignX API v1 PDF](https://campaignxblog.blob.core.windows.net/apidoc/CampaignX%20API%20v1.pdf)

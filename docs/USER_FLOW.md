# User Flow — CampX Product Walkthrough

> This document provides a step-by-step walkthrough of CampX for hackathon judges and evaluators.

---

## Getting Started

After launching the app at `http://localhost:3000`, you are greeted by the **CampX** interface with a left navigation sidebar containing:
- **New Campaign** — The main campaign creation workspace
- **Dashboard** — Live analytics
- **Trends** — Engagement trend charts
- **Email Activity** — Per-campaign breakdown

---

## Flow 1: Creating a Campaign

### Step 1 — Navigate to New Campaign

Click **New Campaign** in the sidebar. This opens the **Campaign Workspace**.

---

### Step 2 — Enter a Campaign Brief

In the **Campaign Brief** text area, enter your campaign idea in plain English:

```
Run email campaign for launching XDeposit.
Offer 1% higher returns than competitors.
Give additional 0.25% benefits to female senior citizens.
Optimize for open rate and click rate.
Include this link: https://superbfsi.com/xdeposit/explore/
```

> The brief can be as short or as detailed as desired. The AI will extract intent, audience, and content from it.

---

### Step 3 — Click "Generate Campaign"

Click the purple **✨ Generate Campaign** button. CampX:

1. Authenticates with CampaignX APIs
2. Fetches the live cohort of 1,000 customers
3. Sends the brief to Gemini AI
4. Generates the campaign strategy, targeting segment, and email content

A **loading animation** shows progress via the activity log panel on the right:
```
[09:15:23] ⟳ Parsing campaign brief...
[09:15:24] ⟳ Authenticating and fetching customer cohort data from CampaignX API...
[09:15:25] ✓ Successfully retrieved cohort: 1000 customers available.
[09:15:26] ⟳ Creating customer segments...
[09:15:27] ⟳ Generating campaign strategy...
[09:15:29] ✓ Email content generated successfully.
[09:15:29] ℹ Waiting for human approval...
```

---

### Step 4 — Review Campaign Metrics

Once generation completes, a **Campaign Card** appears showing:

| Metric | Example Value |
|--------|---------------|
| Target Segment | Female senior citizens, 60+, High Income |
| Optimal Send Time | 7:00 PM |
| Estimated Audience | ~120 customers |
| Strategy | Premium income-focused retention |

---

### Step 5 — Review the Email Preview

Below the metrics, the **Email Preview** section shows the AI-generated email:

```
SUBJECT
──────────────────────────────────────────────────
Exclusive XDeposit Offer: Higher Returns + Special Bonus For You

BODY
──────────────────────────────────────────────────
Dear Valued Customer,

We are delighted to present you with an exclusive opportunity...
[full email body with product details, CTA, and link]
```

---

### Step 6 — Edit the Email (Optional)

Click the **✏️ Edit Email** button next to the "EMAIL PREVIEW" heading.

The preview transforms into editable fields:
- **Subject** → `<input>` field (edit inline)
- **Body** → `<textarea>` (full resize)

After making changes, click **💾 Save Changes** — the edited content is committed immediately.

> The campaign brief itself is NOT editable. Only the AI-generated email content can be modified.

---

### Step 7 — Provide Feedback and Regenerate (Optional)

In the **Manual Feedback & Regeneration** panel:

1. Type feedback in the text box:
   ```
   Keep tone formal, remove emojis, shorten to 150 words
   ```
2. Click **Regenerate**
3. Gemini rewrites the email incorporating your feedback

---

### Step 8 — Approve and Launch

Set the **schedule** (date and time) in the Schedule Section.

Click **✓ Confirm & Approve** to dispatch the campaign.

CampX:
- Applies the AI-generated demographic filter to the 1,000-customer cohort
- Selects the matching `customer_ids`
- Sends the campaign to CampaignX `/send_campaign` API

The Activity Log confirms success:
```
[09:15:45] ⟳ AI is filtering customer database based on target segment...
[09:15:46] ✓ Generated AI filter: (c) => c['Gender'] === 'Female' && c['Age'] >= 60
[09:15:47] ✓ Filtered cohort: 127 customers matched out of 1000.
[09:15:48] ⟳ Dispatching campaign to CampaignX API...
[09:15:49] ✓ Campaign Launched Successfully! Campaign ID: abc123-...
```

A green **"Campaign API Execution Complete!"** toast confirms dispatch.

---

## Flow 2: Viewing the Dashboard

### Step 1 — Navigate to Dashboard

Click **Dashboard** in the sidebar.

### Step 2 — View Key Metrics

Four metric cards display:
| Metric | Description |
|--------|-------------|
| **Total Sent** | Total emails dispatched across all campaigns |
| **Open Rate** | % of recipients who opened the email (EO = Y) |
| **Click Rate** | % of recipients who clicked a link (EC = Y) |
| **Unsubscribes** | % of recipients who unsubscribed (EU = Y) |

### Step 3 — Explore Charts

| Chart | Description |
|-------|-------------|
| Open Rate Over Time | Day-of-week open rate trend |
| Click Rate by Segment | Breakdown by industry vertical |
| Engagement Trend | Week-over-week engagement |
| Email Volume by Hour | Distribution of send times |

---

## Flow 3: AI Campaign Insights

1. Click the **🌟 Generate AI Insights** button on the Dashboard
2. The **Live AI Analysis** modal opens
3. Gemini analyzes your current metrics and generates **3 specific, actionable insights**

Example insights:
```
⚡ Boost Your Send Time           High Impact
   Your open rates peak in the evening. Consider scheduling 
   campaigns between 6-8 PM for maximum engagement.

🎯 Refine Audience Targeting      Critical
   With only 12.7% of your cohort being targeted, you may be
   missing high-value segments. Try broadening to all existing
   customers with high credit scores.

📈 Improve Email Subject Lines    Medium Impact
   Your click rate of 3.2% is below industry average of 5%.
   Test subject lines with personalization tokens.
```

---

## Summary: Full Journey in 60 Seconds

```
Write brief (10s) → Generate campaign (15s) → Review email (5s)
  → Edit if needed (10s) → Approve (2s) → View analytics (5s)
                                         Total: ~47 seconds
```

From campaign idea to email in customer inboxes — **in under a minute**.

# Scoring Strategy — CampX

## Overview

The InXite Out Hackathon final round scores teams based on the total number of:
- **EC = Y** (Email Clicked) across all campaigns
- **EO = Y** (Email Opened) across all campaigns

This document explains how CampX is specifically designed to **maximize EC and EO counts** through targeted, intelligent campaign execution.

---

## Scoring Formula

> **Score = Total `EC = Y` count + Total `EO = Y` count** across all campaigns sent after March 9, 11:59:59 PM

This means:
1. Sending to more customers can increase raw counts
2. But sending to the *wrong* customers wastes sends and reduces rates
3. The optimal strategy is **precision targeting of high-engagement segments**

---

## CampX Strategy to Maximize EC + EO

### 1. Precision Demographic Targeting

CampX uses AI to identify the customer attributes most correlated with email engagement:

| Attribute | High-Engagement Signal |
|-----------|----------------------|
| `App_Installed = Y` | Already digitally active — more likely to open |
| `Existing Customer = Y` | Has prior trust — more likely to engage |
| `KYC status = Y` | Verified and eligible — relevant marketing |
| `Social_Media_Active = Y` | High digital affinity — engages with content |
| `Credit score ≥ 700` | Financially active — interested in banking products |

**Optimal XDeposit filter:**
```js
(c) =>
  c['App_Installed'] === 'Y' &&
  c['Existing Customer'] === 'Y' &&
  c['KYC status'] === 'Y' &&
  c['Monthly_Income'] > 80000
```

### 2. High-Value Niche Segmentation

XDeposit has a **special bonus for female senior citizens**. Targeting this niche:
- Reduces competition (segment is small, but highly relevant)
- Increases conversion intent (product is literally built for them)
- Improves EO/EC rates even with fewer absolute sends

### 3. Send Time Optimization

Gemini recommends optimal send times based on the campaign context:
- **Evening sends (6-8 PM)** → highest email open rates in BFSI
- **Weekday sends (Tue-Thu)** → lower inbox competition
- **Avoid Mondays** → inbox overload effect

CampX generates and validates the send time before dispatch:
```js
if (d.getTime() < Date.now()) {
  d = new Date(Date.now() + 5 * 60000); // Auto-bump to +5 mins
}
```

### 4. Compelling Email Content

Gemini generates emails specifically optimized for click-through:
- **Action-oriented subject lines** ("Earn 1% More — Exclusively For You")
- **Clear CTAs** ("Explore XDeposit Offer")
- **Urgency cues** ("Limited Period Offer")
- **Personalization hooks** (mentions city, income tier, customer type)
- **Direct product links** embedded in the email body

### 5. Human Quality Review

The **Edit Email** feature allows marketers to refine AI output:
- Remove awkward phrasing
- Sharpen the CTA
- Adjust tone (formal/informal)
- Ensure product accuracy

High-quality emails → Higher EO → Higher EC (clicks only happen after opens).

### 6. Feedback-Driven Regeneration

If a campaign underperforms (low EO/EC), the marketer can:
1. View Dashboard metrics
2. Note what's low
3. Enter feedback like: *"Increase urgency, mention the female senior bonus prominently"*
4. Regenerate → new, improved email

This **closed feedback loop** drives continuous improvement across campaigns.

---

## Campaign Execution Checklist

Before dispatching, CampX ensures:

- [x] Cohort data is freshly fetched (not stale)
- [x] AI filter is applied (right audience)
- [x] At least 1 customer matched
- [x] Send time is in the future (auto-bumped if past)
- [x] Subject and Body are non-empty
- [x] Campaign ID is stored for reporting

---

## Expected Impact

| Scenario | Estimated EO Rate | Estimated EC Rate |
|----------|------------------|------------------|
| Random 1,000 customers | 5-8% | 1-2% |
| AI-filtered high-intent segment | 15-25% | 5-10% |
| AI-filtered + compelling content | 25-35% | 10-15% |

> **CampX aims to 3-5x campaign performance through precision targeting over bulk blasting.**

---

## Dashboard Monitoring

After campaigns are sent, the **Dashboard** tracks:
- Real-time EC/EO/EU per campaign
- Best-performing send times
- High-engagement demographics (gender, age group)

The **AI Insights** modal provides prescriptive recommendations like:
> *"Customers aged 45+ have 2x higher open rates. Prioritize this segment in your next campaign."*

This creates a **self-improving marketing loop** — each campaign makes the next one smarter.

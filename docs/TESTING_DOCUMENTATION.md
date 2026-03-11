# Testing Documentation — CampX

## Overview

This document describes the testing approach for CampX, including manual test cases, API contract tests, and edge case coverage. CampX is a frontend-only prototype — all testing is manual and integration-based.

---

## Test Environment

| Component | Value |
|-----------|-------|
| Browser | Chrome 122+ / Edge 122+ |
| Local URL | http://localhost:3000 |
| Dev Server | `npm run dev` |
| API Base | https://campaignx.inxiteout.ai |
| AI Model | Google Gemini 2.5 Flash |

---

## 1. Campaign Generation Tests

### TC-001: Basic Campaign Generation

| Field | Value |
|-------|-------|
| **Test Case** | Generate campaign from valid brief |
| **Input** | "Run email campaign for XDeposit targeting female senior citizens" |
| **Expected Result** | Campaign card appears with targetSegment, subject, body, sendTime |
| **Pass Criteria** | `campaign` state is set; email preview renders correctly |

### TC-002: Campaign Generation with Link in Brief

| Field | Value |
|-------|-------|
| **Input** | Brief includes URL: `https://superbfsi.com/xdeposit/explore/` |
| **Expected** | Link appears in the generated email body |

### TC-003: Empty Brief Validation

| Field | Value |
|-------|-------|
| **Input** | Empty string |
| **Expected** | Generate button is disabled; no API call made |

### TC-004: Campaign Regeneration with Feedback

| Field | Value |
|-------|-------|
| **Steps** | Generate campaign → Enter feedback → Click Regenerate |
| **Expected** | New AI campaign generated incorporating feedback |
| **Pass Criteria** | New email content different from original |

---

## 2. Edit Email Feature Tests

### TC-005: Enter Edit Mode

| Field | Value |
|-------|-------|
| **Steps** | Generate campaign → Click "✏️ Edit Email" |
| **Expected** | Subject becomes `<input>`, Body becomes `<textarea>` |
| **Pass Criteria** | Both fields are editable; button shows "Save Changes" |

### TC-006: Save Edited Email

| Field | Value |
|-------|-------|
| **Steps** | Edit → modify subject/body → Click "💾 Save Changes" |
| **Expected** | Fields return to preview mode with **updated** values |
| **Pass Criteria** | `campaign.subject` and `campaign.body` reflect edits |

### TC-007: Campaign Brief Not Editable

| Field | Value |
|-------|-------|
| **Expected** | The "Campaign Brief" textarea is always editable by the user (for entering new briefs), but the AI-generated email section is the only section with an Edit/Save toggle |
| **Pass Criteria** | Brief field always in input mode; email preview has toggle |

---

## 3. Campaign Execution Tests

### TC-008: Execute Campaign — Normal Flow

| Field | Value |
|-------|-------|
| **Pre-condition** | Campaign generated AND cohort data available |
| **Steps** | Click "Confirm & Approve" |
| **Expected** | Activity log shows: filter, matched count, dispatch, campaign ID |
| **Pass Criteria** | Green success toast; campaign_id stored in localStorage |

### TC-009: Execute Campaign — API Key Missing

| Field | Value |
|-------|-------|
| **Pre-condition** | `VITE_CAMPAIGNX_API_KEY` not set |
| **Expected** | Log shows "Simulating success" — does not crash |

### TC-010: Execute With Zero Matches

| Field | Value |
|-------|-------|
| **Scenario** | AI filter returns 0 matching customers |
| **Expected** | Log shows "No customers matched. Aborting launch." |
| **Pass Criteria** | No API call made; no crash |

### TC-011: Fallback When eval() Fails

| Field | Value |
|-------|-------|
| **Scenario** | Gemini returns invalid JS (e.g., "I cannot parse this") |
| **Expected** | Falls back to 10% random sample |
| **Pass Criteria** | Campaign still dispatches with ~100 customers |

---

## 4. Dashboard Tests

### TC-012: Dashboard Loads with No History

| Field | Value |
|-------|-------|
| **Pre-condition** | `campaignx_history` is empty in localStorage |
| **Expected** | All metrics show "0", charts show no data points |

### TC-013: Dashboard After Successful Campaign

| Field | Value |
|-------|-------|
| **Pre-condition** | At least 1 campaign in history |
| **Expected** | Total Sent updates; Open/Click rates reflect API data if available |

### TC-014: AI Insights Modal

| Field | Value |
|-------|-------|
| **Steps** | Navigate to Dashboard → Click "Generate AI Insights" |
| **Expected** | Modal opens → spinner shows → 3 insight cards appear |
| **Pass Criteria** | Each card has: title, description, impact badge, icon |

### TC-015: AI Insights — Malformed Response Handling

| Field | Value |
|-------|-------|
| **Scenario** | Gemini returns non-JSON or partial JSON |
| **Expected** | Error message shown; "Try Again" button visible |

---

## 5. API Contract Tests

### TC-016: Cohort API Returns Expected Shape

```js
// Expected response shape
const expected = {
  total_count: expect.any(Number),
  data: expect.arrayContaining([
    expect.objectContaining({
      customer_id: expect.any(String),
      Age: expect.any(Number),
      Gender: expect.stringMatching(/Male|Female/),
    })
  ])
};
```

### TC-017: Send Campaign Returns campaign_id

```js
// Expected response shape
const expected = {
  campaign_id: expect.any(String),
};
```

### TC-018: Get Report Handles EO/EC Fields

```js
// CampX should correctly parse all variants
const testEvent = { EO: "Y", EC: "N", EU: "N" };
expect(opens).toBe(1);
expect(clicks).toBe(0);
```

---

## 6. Edge Cases

| Case | Expected Behavior |
|------|------------------|
| Network offline during cohort fetch | Error logged, campaign continues with empty cohort |
| Gemini API quota exceeded | Error message clearly displayed to user |
| Very long campaign brief (3000+ chars) | Truncated gracefully; no crash |
| Campaign dispatch with 1 customer | Works correctly; 1 customer_id sent |
| Campaign dispatch with 1000 customers | Handled in single API call; tested with real cohort |
| Duplicate campaign IDs in localStorage | `get_report` simply returns "not found"; no crash |
| Browser refresh mid-generation | State reset; generation must be restarted |

---

## 7. Manual Testing Checklist

Use this checklist before each demo or submission:

- [ ] App loads at localhost:3000 without errors in console
- [ ] Campaign generation works with a sample brief
- [ ] Activity logs update during generation
- [ ] Email preview shows correctly after generation
- [ ] Edit Email button switches to edit mode
- [ ] Save Changes commits edits and returns to preview
- [ ] Confirm & Approve dispatches campaign (check logs for campaign_id)
- [ ] Dashboard loads with Total Sent count
- [ ] AI Insights modal opens and generates insights
- [ ] No unhandled JavaScript errors in browser console

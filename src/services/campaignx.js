/**
 * campaignx.js — CampaignX API Service Layer
 *
 * Centralized API integration for all CampaignX v1 endpoints.
 * All components should use these functions instead of calling fetch() directly.
 *
 * Endpoints implemented:
 *   GET  /api/v1/get_customer_cohort  — Fetch customer cohort (cached)
 *   POST /api/v1/send_campaign        — Dispatch email campaign
 *   GET  /api/v1/get_report           — Fetch campaign performance report
 *
 * Authentication: X-API-Key header (from VITE_CAMPAIGNX_API_KEY)
 */

import { config } from "../config";

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = config.campaignxBaseUrl;
const CAMPAIGN_HISTORY_KEY = "campaignx_history";
const CACHE_KEY_COHORT = "campaignx_customer_cohort_v2";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build standard API headers for every CampaignX request.
 */
const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-API-Key": config.campaignxApiKey,
});

/**
 * Persist a campaign_id to localStorage history list.
 * @param {string} campaignId
 */
export const saveCampaignId = (campaignId) => {
  try {
    const existing = JSON.parse(
      localStorage.getItem(CAMPAIGN_HISTORY_KEY) || "[]",
    );
    if (!existing.includes(campaignId)) {
      localStorage.setItem(
        CAMPAIGN_HISTORY_KEY,
        JSON.stringify([...existing, campaignId]),
      );
    }
  } catch (e) {
    console.error("Failed to save campaign ID to history:", e);
  }
};

/**
 * Retrieve all stored campaign IDs from localStorage.
 * @returns {string[]}
 */
export const getCampaignHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(CAMPAIGN_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
};

/**
 * Clear all campaign history from localStorage.
 */
export const clearCampaignHistory = () => {
  localStorage.removeItem(CAMPAIGN_HISTORY_KEY);
  localStorage.removeItem(CACHE_KEY_COHORT);
};

// ─── API: Get Customer Cohort ─────────────────────────────────────────────────

/**
 * Fetch the full customer cohort from CampaignX.
 * Always fetches fresh data to ensure we use the updated API dataset.
 *
 * @returns {Promise<Array>} Array of customer objects
 */
export const getCustomerCohort = async () => {
  if (!config.campaignxApiKey) {
    throw new Error(
      "VITE_CAMPAIGNX_API_KEY is not configured. Please add it to your .env file.",
    );
  }

  const response = await fetch(`${BASE_URL}/api/v1/get_customer_cohort`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Failed to fetch cohort: ${response.status} ${response.statusText} — ${errText}`,
    );
  }

  const payload = await response.json();
  const rawData = payload.data || payload || [];

  if (!Array.isArray(rawData)) {
      throw new Error(`Invalid cohort format returned from API: expected Array, but got ${typeof rawData}`);
  }

  // Normalize field names for consistent access
  const customers = rawData.map((item) => ({
    ...item,
    name: item.Full_name || item.name || "",
    email: item.email || item.Email || "",
    customer_id: item.customer_id || item.CLIENTNUM || item.id || "",
  }));

  // No longer caching in localStorage to guarantee live data
  return customers;
};

// ─── API: Send Campaign ───────────────────────────────────────────────────────

/**
 * Dispatch an email campaign to a list of customers.
 *
 * @param {Object} params
 * @param {string}   params.subject           - Email subject line
 * @param {string}   params.body              - Email body content
 * @param {string[]} params.list_customer_ids - Array of customer IDs to target
 * @param {string}   params.send_time         - Formatted as "DD:MM:YY HH:MM:SS"
 *
 * @returns {Promise<string>} The campaign_id returned by the API
 */
export const sendCampaign = async ({
  subject,
  body,
  list_customer_ids,
  send_time,
}) => {
  if (!config.campaignxApiKey) {
    throw new Error("VITE_CAMPAIGNX_API_KEY is not configured.");
  }

  if (!subject || !body) {
    throw new Error("Campaign subject and body are required.");
  }

  if (!Array.isArray(list_customer_ids) || list_customer_ids.length === 0) {
    throw new Error(
      "list_customer_ids must be a non-empty array of customer IDs.",
    );
  }

  if (!send_time) {
    throw new Error("send_time is required in DD:MM:YY HH:MM:SS format.");
  }

  const payload = { subject, body, list_customer_ids, send_time };

  const response = await fetch(`${BASE_URL}/api/v1/send_campaign`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Campaign dispatch failed: ${response.status} ${response.statusText} — ${errText}`,
    );
  }

  const data = await response.json();
  const campaignId = data.campaign_id;

  if (!campaignId) {
    throw new Error("API returned success but no campaign_id in response.");
  }

  // Persist campaign_id immediately after successful dispatch
  saveCampaignId(campaignId);

  return campaignId;
};

// ─── API: Get Report ──────────────────────────────────────────────────────────

/**
 * Fetch the performance report for a specific campaign.
 *
 * Report response fields per customer event:
 *   EO (Email Opened)      — "Y" | "N"
 *   EC (Email Clicked)     — "Y" | "N"
 *   EU (Email Unsubscribed)— "Y" | "N"
 *   invokation_time        — ISO datetime string
 *
 * @param {string} campaignId - The campaign_id returned by sendCampaign
 * @returns {Promise<Object>} Full report response with { data: [...] }
 */
export const getReport = async (campaignId) => {
  if (!campaignId) {
    throw new Error("campaign_id is required to fetch a report.");
  }

  if (!config.campaignxApiKey) {
    throw new Error("VITE_CAMPAIGNX_API_KEY is not configured.");
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/get_report?campaign_id=${encodeURIComponent(campaignId)}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    if (response.status === 429) {
        console.warn(`Rate limit hit for get_report on ${campaignId}. Returning empty data to reflect zero engagement.`);
        return { data: [] };
    }

    const errText = await response.text();
    throw new Error(
      `Failed to fetch report for ${campaignId}: ${response.status} — ${errText}`,
    );
  }

  const data = await response.json();
  return data;
};

// ─── Utility: Aggregate Report Metrics ───────────────────────────────────────

/**
 * Aggregate EO/EC/EU events from a report API response.
 *
 * Checks multiple field name variants for maximum API compatibility:
 * Open: EO, Open, open, eo
 * Click: EC, Click, click, ec
 * Unsubscribe: EU, Unsubscribe, unsubscribe, eu
 *
 * @param {Object} reportData - Raw response from getReport()
 * @returns {{ sent: number, opens: number, clicks: number, unsubs: number }}
 */
export const aggregateReportMetrics = (reportData) => {
  const events = reportData?.data || [];
  let sent = 0, opens = 0, clicks = 0, unsubs = 0;

  events.forEach((ev) => {
    sent++;
    if (ev.EO === "Y" || ev.Open === "Y" || ev.open === "Y" || ev.eo === "Y") opens++;
    if (ev.EC === "Y" || ev.Click === "Y" || ev.click === "Y" || ev.ec === "Y") clicks++;
    if (ev.EU === "Y" || ev.Unsubscribe === "Y" || ev.unsubscribe === "Y" || ev.eu === "Y") unsubs++;
  });

  return {
    sent,
    opens,
    clicks,
    unsubs,
    openRate: sent > 0 ? (opens / sent) * 100 : 0,
    clickRate: sent > 0 ? (clicks / sent) * 100 : 0,
    unsubRate: sent > 0 ? (unsubs / sent) * 100 : 0,
    rawEvents: events,
  };
};

// ─── Utility: Format Send Time ────────────────────────────────────────────────

/**
 * Format a JavaScript Date into CampaignX-required format: "DD:MM:YY HH:MM:SS"
 *
 * @param {Date} date
 * @returns {string}
 */
export const formatSendTime = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}:${month}:${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Build a send time for a given schedule object { date, time }.
 * Automatically bumps to now+5min if the requested time is in the past.
 *
 * @param {{ date: string, time: string }} schedule
 * @returns {string} Formatted send time
 */
export const buildSendTime = (schedule) => {
  let d = new Date(`${schedule.date}T${schedule.time}:00`);
  if (isNaN(d.getTime()) || d.getTime() < Date.now()) {
    d = new Date(Date.now() + 5 * 60_000);
  }
  return formatSendTime(d);
};

/**
 * db.js — Frontend service to persist campaign data to CampX MongoDB backend.
 *
 * All functions are fire-and-forget — they do NOT block the main campaign flow.
 * If the backend is offline, the app continues working normally using localStorage.
 *
 * Backend base: http://localhost:5000
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Save AI-generated campaign + email to MongoDB.
 * Called after Groq generates a campaign in CampaignWorkspace.
 *
 * @param {Object} campaignData  — { brief, strategy, targetSegment, sendTime, estimatedAudience, subject, body, explanation }
 * @returns {string|null}        — MongoDB campaign _id, or null on failure
 */
export const saveCampaignToDB = async (campaignData) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignName: campaignData.brief?.slice(0, 60) || "Untitled Campaign",
        campaignBrief: campaignData.brief,
        targetAudience: campaignData.targetSegment,
        strategy: campaignData.strategy,
        estimatedAudience: campaignData.estimatedAudience,
        recommendedSendTime: campaignData.sendTime,
        subject: campaignData.subject,
        emailContent: campaignData.body,
        explanation: campaignData.explanation || {},
      }),
    });

    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    const data = await res.json();
    console.log("✅ Campaign saved to MongoDB:", data.campaign?._id);
    return data.campaign?._id || null;
  } catch (err) {
    console.warn("⚠️ Could not save campaign to backend (non-blocking):", err.message);
    return null;
  }
};

/**
 * Save user-edited email content to MongoDB.
 * Called when the user clicks "Save Changes" in the Email Preview.
 *
 * @param {string} mongoId  — MongoDB campaign _id
 * @param {string} subject  — Edited subject
 * @param {string} body     — Edited body
 */
export const saveEditedEmailToDB = async (mongoId, subject, body) => {
  if (!mongoId) return;
  try {
    const res = await fetch(`${BACKEND_URL}/api/campaigns/${mongoId}/email`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    console.log("✅ Edited email saved to MongoDB for campaign:", mongoId);
  } catch (err) {
    console.warn("⚠️ Could not save edited email to backend (non-blocking):", err.message);
  }
};

/**
 * Mark a campaign as sent and store the CampaignX campaign_id in MongoDB.
 * Called after successful campaign dispatch.
 *
 * @param {string} mongoId           — MongoDB campaign _id
 * @param {string} campaignXId       — CampaignX API campaign_id
 * @param {string[]} customerIds     — targeted customer IDs
 */
export const markCampaignSentInDB = async (mongoId, campaignXId, customerIds = []) => {
  if (!mongoId) return;
  try {
    const res = await fetch(`${BACKEND_URL}/api/campaigns/${mongoId}/dispatch`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignXId, targetedCustomerIds: customerIds }),
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    console.log("✅ Campaign marked as sent in MongoDB:", mongoId);
  } catch (err) {
    console.warn("⚠️ Could not mark campaign sent in backend (non-blocking):", err.message);
  }
};

/**
 * Save AI-generated trend insights to MongoDB.
 * Called after the AI Insight Modal generates insights.
 *
 * @param {Array}  insights         — Array of { title, description, impact, iconType }
 * @param {Object} metricsSnapshot  — { totalSent, openRate, clickRate, unsubscribes }
 */
export const saveInsightsToDB = async (insights = [], metricsSnapshot = {}) => {
  if (!insights.length) return;
  try {
    const res = await fetch(`${BACKEND_URL}/api/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insights, metricsSnapshot }),
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    console.log("✅ Insights saved to MongoDB.");
  } catch (err) {
    console.warn("⚠️ Could not save insights to backend (non-blocking):", err.message);
  }
};

/**
 * Fetch all past campaigns from MongoDB (for history view).
 * @returns {Array} campaigns array or []
 */
export const fetchCampaignsFromDB = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/campaigns`);
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    const data = await res.json();
    return data.campaigns || [];
  } catch (err) {
    console.warn("⚠️ Could not fetch campaigns from backend:", err.message);
    return [];
  }
};

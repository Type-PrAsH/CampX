const Campaign = require("../models/Campaign");
const EmailCampaign = require("../models/EmailCampaign");
const CampaignAnalytics = require("../models/CampaignAnalytics");

// ─── POST /api/campaigns ────────────────────────────────────────────────────
// Save a campaign brief + AI-generated details to MongoDB
const createCampaign = async (req, res) => {
  try {
    const {
      campaignName,
      campaignBrief,
      targetAudience,
      productName,
      strategy,
      estimatedAudience,
      recommendedSendTime,
      subject,
      emailContent,
      explanation,
    } = req.body;

    if (!campaignBrief) {
      return res.status(400).json({ error: "campaignBrief is required." });
    }

    // 1. Save Campaign
    const campaign = await Campaign.create({
      campaignName: campaignName || "Untitled Campaign",
      campaignBrief,
      targetAudience,
      productName,
      strategy,
      estimatedAudience,
      recommendedSendTime,
      campaignStatus: "generated",
    });

    // 2. Save EmailCampaign linked to Campaign
    let emailCampaign = null;
    if (subject && emailContent) {
      emailCampaign = await EmailCampaign.create({
        campaignId: campaign._id,
        subject,
        emailContent,
        explanation: explanation || {},
        aiGenerated: true,
      });
    }

    res.status(201).json({
      success: true,
      campaign,
      emailCampaign,
    });
  } catch (err) {
    console.error("createCampaign error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─── PATCH /api/campaigns/:id/email ─────────────────────────────────────────
// Save user-edited email content
const updateEmailContent = async (req, res) => {
  try {
    const { subject, body } = req.body;
    const { id } = req.params;

    const emailCampaign = await EmailCampaign.findOne({ campaignId: id });
    if (!emailCampaign) {
      return res.status(404).json({ error: "EmailCampaign not found." });
    }

    emailCampaign.editedContent = { subject, body };
    emailCampaign.isEdited = true;
    await emailCampaign.save();

    res.json({ success: true, emailCampaign });
  } catch (err) {
    console.error("updateEmailContent error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─── PATCH /api/campaigns/:id/dispatch ──────────────────────────────────────
// Mark campaign as sent, store CampaignX campaign_id and targeted customer list
const markCampaignSent = async (req, res) => {
  try {
    const { campaignXId, targetedCustomerIds } = req.body;
    const { id } = req.params;

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found." });
    }

    if (campaignXId && !campaign.campaignXIds.includes(campaignXId)) {
      campaign.campaignXIds.push(campaignXId);
    }
    if (targetedCustomerIds?.length) {
      campaign.targetedCustomerIds = targetedCustomerIds;
    }
    campaign.campaignStatus = "sent";
    await campaign.save();

    res.json({ success: true, campaign });
  } catch (err) {
    console.error("markCampaignSent error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/campaigns/:id/analytics ──────────────────────────────────────
// Store analytics (EC/EO/EU) fetched from CampaignX get_report API
const saveAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      campaignXId,
      sentCount,
      openCount,
      clickCount,
      unsubscribeCount,
      openRate,
      clickRate,
      unsubscribeRate,
      rawEvents,
    } = req.body;

    const analytics = await CampaignAnalytics.create({
      campaignId: id,
      campaignXId,
      sentCount,
      openCount,
      clickCount,
      unsubscribeCount,
      openRate,
      clickRate,
      unsubscribeRate,
      rawEvents: rawEvents || [],
    });

    res.status(201).json({ success: true, analytics });
  } catch (err) {
    console.error("saveAnalytics error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/campaigns ──────────────────────────────────────────────────────
// Fetch all campaigns (most recent first)
const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, campaigns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/campaigns/:id ──────────────────────────────────────────────────
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Not found." });
    const emailCampaign = await EmailCampaign.findOne({ campaignId: campaign._id });
    res.json({ success: true, campaign, emailCampaign });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCampaign,
  updateEmailContent,
  markCampaignSent,
  saveAnalytics,
  getAllCampaigns,
  getCampaignById,
};

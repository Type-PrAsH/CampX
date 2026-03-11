const TrendInsights = require("../models/TrendInsights");

// POST /api/insights — Save AI-generated trend insights
const saveTrendInsights = async (req, res) => {
  try {
    const { insights, metricsSnapshot, relatedCampaignId } = req.body;

    if (!Array.isArray(insights) || insights.length === 0) {
      return res.status(400).json({ error: "insights array is required." });
    }

    const saved = await TrendInsights.insertMany(
      insights.map((insight) => ({
        trendTitle: insight.title,
        description: insight.description,
        impact: insight.impact || "Medium Impact",
        iconType: insight.iconType || "zap",
        metricsSnapshot: metricsSnapshot || {},
        relatedCampaignId: relatedCampaignId || null,
      }))
    );

    res.status(201).json({ success: true, saved });
  } catch (err) {
    console.error("saveTrendInsights error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/insights — Fetch most recent 10 insights
const getInsights = async (req, res) => {
  try {
    const insights = await TrendInsights.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, insights });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { saveTrendInsights, getInsights };

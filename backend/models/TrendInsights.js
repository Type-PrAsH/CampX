const mongoose = require("mongoose");

const trendInsightsSchema = new mongoose.Schema(
  {
    trendTitle: {
      type: String,
      required: [true, "Trend title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    impact: {
      type: String,
      enum: ["High Impact", "Medium Impact", "Critical"],
      default: "Medium Impact",
    },
    iconType: {
      type: String,
      enum: ["zap", "target", "trending"],
      default: "zap",
    },
    source: {
      type: String,
      default: "Groq AI Analysis",
    },
    // Link to which campaign analytics triggered this insight
    relatedCampaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
    },
    // Metrics snapshot that generated this insight
    metricsSnapshot: {
      totalSent: { type: String },
      openRate: { type: String },
      clickRate: { type: String },
      unsubscribes: { type: String },
    },
  },
  { timestamps: true }
);

trendInsightsSchema.index({ createdAt: -1 });

module.exports = mongoose.model("TrendInsights", trendInsightsSchema);

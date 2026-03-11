const mongoose = require("mongoose");

const campaignAnalyticsSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    // CampaignX API campaign_id(s) for this analytics record
    campaignXId: {
      type: String,
      index: true,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    openCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    unsubscribeCount: {
      type: Number,
      default: 0,
    },
    openRate: {
      type: Number, // stored as percentage: 29.1
      default: 0,
    },
    clickRate: {
      type: Number,
      default: 0,
    },
    unsubscribeRate: {
      type: Number,
      default: 0,
    },
    // Raw per-customer event data from get_report API
    rawEvents: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    // When this analytics snapshot was fetched
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

campaignAnalyticsSchema.index({ campaignId: 1, fetchedAt: -1 });

module.exports = mongoose.model("CampaignAnalytics", campaignAnalyticsSchema);

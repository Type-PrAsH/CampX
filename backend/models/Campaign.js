const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
      trim: true,
      default: "Untitled Campaign",
    },
    campaignBrief: {
      type: String,
      required: [true, "Campaign brief is required"],
    },
    targetAudience: {
      type: String,
      trim: true,
    },
    productName: {
      type: String,
      trim: true,
    },
    strategy: {
      type: String,
    },
    estimatedAudience: {
      type: String,
    },
    recommendedSendTime: {
      type: String,
    },
    campaignStatus: {
      type: String,
      enum: ["draft", "generated", "approved", "sent", "failed"],
      default: "draft",
    },
    // Campaign IDs returned by the CampaignX API after dispatch
    campaignXIds: [
      {
        type: String,
      },
    ],
    // Customer IDs targeted in this campaign
    targetedCustomerIds: [
      {
        type: String,
      },
    ],
    feedbackUsed: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

campaignSchema.index({ campaignStatus: 1 });
campaignSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Campaign", campaignSchema);

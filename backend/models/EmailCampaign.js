const mongoose = require("mongoose");

const emailCampaignSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
    },
    emailContent: {
      type: String,
      required: [true, "Email content is required"],
    },
    // Stored separately if the user edited the AI-generated email
    editedContent: {
      subject: { type: String, default: "" },
      body: { type: String, default: "" },
    },
    aiGenerated: {
      type: Boolean,
      default: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    // Groq model used for generation
    modelUsed: {
      type: String,
      default: "llama-3.3-70b-versatile",
    },
    // The raw AI explanation fields
    explanation: {
      audience: { type: String, default: "" },
      sendTime: { type: String, default: "" },
      tone: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailCampaign", emailCampaignSchema);

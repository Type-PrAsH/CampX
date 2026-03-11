const express = require("express");
const router = express.Router();
const {
  createCampaign,
  updateEmailContent,
  markCampaignSent,
  saveAnalytics,
  getAllCampaigns,
  getCampaignById,
} = require("../controllers/campaignController");

// GET  /api/campaigns          — list all campaigns
// POST /api/campaigns          — create campaign + email
router.route("/").get(getAllCampaigns).post(createCampaign);

// GET  /api/campaigns/:id      — get one campaign + its email
router.get("/:id", getCampaignById);

// PATCH /api/campaigns/:id/email    — save user-edited email
router.patch("/:id/email", updateEmailContent);

// PATCH /api/campaigns/:id/dispatch — mark sent + store CampaignX IDs
router.patch("/:id/dispatch", markCampaignSent);

// POST /api/campaigns/:id/analytics — save get_report analytics
router.post("/:id/analytics", saveAnalytics);

module.exports = router;

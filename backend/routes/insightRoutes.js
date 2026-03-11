const express = require("express");
const router = express.Router();
const { saveTrendInsights, getInsights } = require("../controllers/insightController");

router.route("/").get(getInsights).post(saveTrendInsights);

module.exports = router;

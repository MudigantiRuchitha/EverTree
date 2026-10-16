const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const {
    getSubscriptionPlans,
    getCurrentSubscription,
    subscribe
} = require("../controllers/subscriptionController");

const router = express.Router();

// Public: view plans
router.get("/plans", getSubscriptionPlans);

// Protected: check seller's current plan and remaining listings
router.get("/current", verifyToken, getCurrentSubscription);

// Protected: process payment and activate subscription
router.post("/subscribe", verifyToken, subscribe);

module.exports = router;
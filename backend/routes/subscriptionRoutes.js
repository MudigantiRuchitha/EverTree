const express = require("express");

const {
    getSubscriptionPlans
} = require("../controllers/subscriptionController");

const router = express.Router();

router.get(
    "/plans",
    getSubscriptionPlans
);

module.exports = router;
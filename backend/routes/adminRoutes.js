const express = require("express");

const {
    verifyToken,
    requireRole
} = require("../middleware/authMiddleware");

const {
    getOverview,
    getUsers,
    getPendingUsers,
    approveUser,
    rejectUser,
    getProperties,
    updatePropertyStatus
} = require("../controllers/adminController");

const router = express.Router();

// Every Admin API requires a valid JWT + admin role
router.use(verifyToken, requireRole("admin"));

// Dashboard
router.get("/overview", getOverview);

// Users
router.get("/users", getUsers);
router.get("/users/pending", getPendingUsers);
router.patch("/users/:id/approve", approveUser);
router.patch("/users/:id/reject", rejectUser);

// Properties
router.get("/properties", getProperties);
router.patch("/properties/:id/status", updatePropertyStatus);

module.exports = router;
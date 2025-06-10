const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { auth, adminAuth } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", auth, (req, res) => {
    res.json(req.user);
});

// Admin only routes
router.get("/admin", auth, adminAuth, (req, res) => {
    res.json({ message: "Welcome to admin dashboard" });
});

module.exports = router; 
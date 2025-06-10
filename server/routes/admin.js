const router = require("express").Router();
const { auth, adminAuth } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");

// Lấy danh sách tất cả users
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message, data: [] });
  }
});

// Lấy danh sách tất cả listings
router.get("/listings", auth, adminAuth, async (req, res) => {
  try {
    const listings = await Listing.find().populate("creator", "firstName lastName email");
    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ message: "Error fetching listings", error: error.message, data: [] });
  }
});

// Lấy danh sách tất cả bookings
router.get("/bookings", auth, adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customerId", "firstName lastName email")
      .populate("hostId", "firstName lastName email")
      .populate("listingId");
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error: error.message, data: [] });
  }
});

// Xóa user
router.delete("/users/:userId", auth, adminAuth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});

// Xóa listing
router.delete("/listings/:listingId", auth, adminAuth, async (req, res) => {
  try {
    const deletedListing = await Listing.findByIdAndDelete(req.params.listingId);
    if (!deletedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).json({ message: "Error deleting listing", error: error.message });
  }
});

// Cập nhật role của user
router.patch("/users/:userId/role", auth, adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Error updating user role", error: error.message });
  }
});

module.exports = router; 
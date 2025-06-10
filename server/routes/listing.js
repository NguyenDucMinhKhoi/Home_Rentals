const router = require("express").Router();
const multer = require("multer");
const { auth, adminAuth } = require("../middleware/authMiddleware");
const {
    createListing,
    getListingsByCategory,
    searchListings,
    getListingDetails,
    updateListing,
    deleteListing,
} = require('../controllers/listingController'); // Import các hàm từ controller

const Listing = require("../models/Listing");
const User = require("../models/User");

/* Configuration Multer for File Uploads */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

/* CREATE LISTING */
router.post("/create", auth, upload.array("listingPhotos"), createListing); // Sử dụng hàm từ controller

/* GET LISTING BY CATEGORY */
router.get("/", getListingsByCategory); // Sử dụng hàm từ controller

/* GET LISTINGS BY SEARCH */
router.get("/search/:search", searchListings); // Sử dụng hàm từ controller

/* LISTING DETAILS */
router.get("/:listingId", getListingDetails); // Sử dụng hàm từ controller

/* UPDATE LISTING (Admin Only for now) */
router.patch("/:listingId", auth, adminAuth, upload.array("listingPhotos"), updateListing);

/* DELETE LISTING (Admin Only for now) */
router.delete("/:listingId", auth, adminAuth, deleteListing);

module.exports = router;

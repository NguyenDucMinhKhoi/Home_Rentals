const router = require("express").Router();
const {
    getTripList,
    addListingToWishlist,
    getPropertyList,
    getReservationList
} = require('../controllers/userController'); // Import các hàm từ controller

/* GET TRIP LIST */
router.get("/:userId/trips", getTripList); // Sử dụng hàm từ controller

/* ADD LISTING TO WISHLIST */
router.patch("/:userId/:listingId", addListingToWishlist); // Sử dụng hàm từ controller

/* GET PROPERTY LIST */
router.get("/:userId/properties", getPropertyList); // Sử dụng hàm từ controller

/* GET RESERVATION LIST */
router.get("/:userId/reservations", getReservationList); // Sử dụng hàm từ controller

module.exports = router;

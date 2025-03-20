const router = require("express").Router();
const { createBooking } = require('../controllers/bookingController');

const Booking = require("../models/Booking");

/* CREATE BOOKING */
router.post("/create", createBooking);

module.exports = router;

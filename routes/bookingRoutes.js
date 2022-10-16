const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
    .route("/")
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking);

router
    .route("/:id")
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .patch(bookingController.deleteBooking);

module.exports = router;
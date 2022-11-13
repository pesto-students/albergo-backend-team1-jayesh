const express = require('express');
const hotelController = require('./../controllers/hotelController');
const authController = require('./../controllers/authController');
const roomRouter = require('./roomRoutes');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.route('/').get(hotelController.getAllHotels);

router.use('/:id/reviews', reviewRouter);

// router.use('/:id/rooms', roomRouter);

// router.post('/onboard', hotelController.createHotel);
router.post('/onboard', authController.signup)

router.route('/:slug')
  .get(hotelController.getHotel)
  .patch(authController.protect, authController.restrictTo('Employee', 'Hotel'), hotelController.updateHotel)
  .delete(authController.protect, authController.restrictTo('Employee', 'Hotel'), hotelController.deleteHotel);

router.post("/search", hotelController.searchByAny);

module.exports = router;
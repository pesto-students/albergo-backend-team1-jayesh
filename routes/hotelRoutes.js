const express = require('express');
const hotelController = require('./../controllers/hotelController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:id/reviews', reviewRouter);

router.post('/onboard', hotelController.createHotel);

router.route('/:id')
    .get(hotelController.getHotel)
    .patch(authController.protect, authController.restrictTo('Employee'), hotelController.updateHotel)
    .delete(authController.protect, authController.restrictTo('Employee'), hotelController.deleteHotel);

router.post('/searchBy/:searchBy/:value', hotelController.searchByAny);

module.exports = router;

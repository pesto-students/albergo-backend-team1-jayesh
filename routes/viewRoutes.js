const express = require('express');
const hotelController = require('./../controllers/hotelController');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/', viewController.getOverview);
// router.post('/hotelsByCoordinates', viewsController.getHotelsByCoordinates);

router.route('/hotel/:id')
    .get(hotelController.getHotel)
    .patch(authController.protect, hotelController.updateHotel)
    .delete(authController.protect, hotelController.deleteHotel);


module.exports = router;

const express = require('express');
const hotelController = require('./../controllers/hotelController');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/', viewController.getOverview);
// router.post('/hotelsByCoordinates', viewsController.getHotelsByCoordinates);

module.exports = router;

const express = require('express');
const viewsController = require('./../controllers/viewController');

const router = express.Router();

router.get('/', viewsController.getOverview);
// router.post('/hotelsByCoordinates', viewsController.getHotelsByCoordinates);

router.get('/hotel/:id', viewsController.getHotel);

module.exports = router;

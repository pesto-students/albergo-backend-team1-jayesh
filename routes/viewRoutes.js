const express = require('express');
const viewsController = require('./../controllers/viewController');

const router = express.Router();

router.get('/', viewsController.getOverview);
// router.post('/hotelsByCoordinates', viewsController.getHotelsByCoordinates);

module.exports = router;

const express = require('express');
const hotelController = require('./../controllers/hotelController');

const router = express.Router();

router.post('/onboard', hotelController.sendHotels);

router.post('/searchByCity', hotelController.searchByCity);

module.exports = router;

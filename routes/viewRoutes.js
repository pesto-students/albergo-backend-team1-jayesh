import { Router } from 'express';
import { getOverview, getHotel } from './../controllers/viewController';
const express = require('express');
const hotelController = require('./../controllers/hotelController');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const router = Router({ caseSensitive: true });

router.get('/', getOverview);
// router.post('/hotelsByCoordinates', viewsController.getHotelsByCoordinates);

router.get('/hotel/:id', getHotel);

export default router;
router.route('/hotels-within/:distance/center/:latlng/unit/:unit').get(viewController.getHotelsWithin);

router.get('/', viewController.getOverview);
// router.post('/hotelsByCoordinates', viewsController.getHotelsByCoordinates);

module.exports = router;

const express = require('express');
const roomController = require('./../controllers/roomController');
const hotelController = require('./../controllers/hotelController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/', authController.protect, authController.restrictTo('Employee', 'Hotel'), roomController.createRoom);

router.get('/getAllRooms', roomController.getAllRooms);

router.route('/:id')
    .get(roomController.getRoom)
    .patch(authController.protect, authController.restrictTo('Employee', 'Hotel'), roomController.updateRoom)
    .delete(authController.protect, authController.restrictTo('Employee', 'Hotel'), roomController.deleteRoom);

module.exports = router;
const express = require('express');
const hotelController = require('./../controllers/hotelController');
const wishlistController = require('./../controllers/wishlistController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/allWishlist', authController.protect, wishlistController.getAllWishlist);

router.post('/createOne', authController.protect, wishlistController.createWishlist);

router.delete('/deleteOne/:id', authController.protect, wishlistController.deleteWishlist);

module.exports = router;
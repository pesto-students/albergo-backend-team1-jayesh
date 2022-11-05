const express = require('express');
const router = express.Router({ mergeParams: true });
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

router.use(authController.protect);

router.route('/')
    .post(authController.restrictTo('Employee', 'User'), reviewController.setHotelUserIds, reviewController.createReview);

router.route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('User'), reviewController.updateReview)
    .delete(authController.restrictTo('User'), reviewController.deleteReview);

module.exports = router;
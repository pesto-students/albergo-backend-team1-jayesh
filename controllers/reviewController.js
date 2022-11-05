const Review = require('./../models/reviewsModel');
const factory = require('./handlerFactory');

exports.setHotelUserIds = (req, res, next) => {
    if (!req.body.hotel) req.body.hotel = req.params.hotelId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
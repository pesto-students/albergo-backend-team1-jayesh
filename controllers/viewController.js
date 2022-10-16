const Hotel = require('./../models/hotelModel');
const User = require('./../models/userModel');
const Wishlist = require('./../models/wishlistModel');
const factory = require('./handlerFactory');

exports.getOverview = async (req, res, next) => {
    const featuredHotels = await Hotel.find({ isFeatured: { $eq: true } }).limit(3);

    const topRatedHotels = await Hotel.find({}).sort({ ratingsAverage: -1 }).limit(3);

    const hotelView = {
        featuredHotels,
        topRatedHotels
    }
    res.status(200).send(hotelView);
};
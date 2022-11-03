const factory = require('./handlerFactory');
const Hotel = require('./../models/hotelModel');
const User = require('./../models/userModel');
const Wishlist = require('./../models/wishlistModel');

// exports.createWishlist = factory.createOne(Wishlist);

exports.createWishlist = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.body.hotelId);
        if (!hotel) {
            return new AppError('No hotel found with that ID', 404, res);
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return new AppError('No user found with that ID', 404, res);
        }
        const wishlist = await Wishlist.create({
            wish: hotel.name,
            hotel: req.body.hotelId,
            user: req.user.id
        });
        res.status(201).json({
            status: 'success',
            data: {
                wishlist
            }
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
    next();
};

exports.getAllWishlist = async (req, res, next) => {
    const wishlist = await Wishlist.find({ user: req.user.id });
    res.status(200).json({
        status: 'success',
        results: wishlist.length,
        data: {
            wishlist
        }
    });
    next();
};

exports.deleteWishlist = factory.deleteOne(Wishlist);
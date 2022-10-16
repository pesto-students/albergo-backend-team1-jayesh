const Hotel = require('./../models/hotelModel');
const factory = require('./handlerFactory');


exports.searchByCity = async (req, res, next) => {
    const doc = await Hotel.find({ hotelCity: req.body.city });
    res.status(200).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
    next();
};

exports.createHotel = factory.createOne(Hotel);

exports.getHotel = factory.getOne(Hotel);

exports.updateHotel = factory.updateOne(Hotel);

exports.deleteHotel = factory.deleteOne(Hotel);
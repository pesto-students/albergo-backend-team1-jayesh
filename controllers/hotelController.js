const Hotel = require('./../models/hotelModel');
const factory = require('./handlerFactory');

exports.createHotel = factory.createOne(Hotel);
// exports.sendHotels = async (req, res, next) => {
//     const doc = await Hotel.create(req.body);
//     res.status(201).json({
//         status: 'success',
//         data: {
//             data: doc,
//         },
//     });
//     next();
// };

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
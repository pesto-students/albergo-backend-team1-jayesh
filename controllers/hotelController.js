const Hotel = require('./../models/hotelModel');
const factory = require('./handlerFactory');
const Booking = require('./../models/bookingModel');


exports.searchByAny = async (req, res, next) => {
    let { searchBy, value } = req.params;
    value = value.split('-').join(' ');
    let doc;
    if (searchBy === 'name')
        doc = await Hotel.find({ name: value });
    else if (searchBy === 'city')
        doc = await Hotel.find({ hotelCity: value });
    else if (searchBy === 'state')
        doc = await Hotel.find({ hotelState: value });
    else if (searchBy === 'country')
        doc = await Hotel.find({ hotelCountry: value });

    res.status(200).json({
        status: 'success',
        length: doc.length,
        data: {
            data: doc,
        }
    });
    next();
};

exports.advSearch = async (req, res, next) => {
    const from_date = req.body.from_date;
    const to_date = req.body.to_date;
    const bookings = await Booking
        .find({
            $or: [
                { start: { $gte: from_date, $lte: to_date } },
                {
                    end: { $gte: from_date, $lte: to_date }
                },
                {
                    $and: [{ start: { $lte: from_date } }, { end: { $gte: to_date } }]
                },
            ],
        })
        .select('room');
    const roomIds = bookings.map(b => b.room);

    const availableRooms = await Room.find({ _id: { $nin: roomIds } })
    const availableRooms1 = await Room
        .find({ _id: { $nin: roomIds } })
        .populate('hotel');
    res.status(200).json({
        status: 'success',
        data: {
            data: availableRooms
        }
    });
};

exports.createHotel = factory.createOne(Hotel);

exports.getHotel = factory.getOne(Hotel);

exports.updateHotel = factory.updateOne(Hotel);

exports.deleteHotel = factory.deleteOne(Hotel);
const Hotel = require('./../models/hotelModel');
const factory = require('./handlerFactory');
const Booking = require('./../models/bookingModel');
const AppError = require("../utils/appError");

exports.searchByAny = async (req, res, next) => {
  const { searchBy } = req.body;

  for (const searchParam in searchBy) {
    if (Object.hasOwnProperty.call(searchBy, searchParam)) {
      const element = searchBy[searchParam];
      searchBy[searchParam] = {
        $regex: element.toLowerCase(),
      };
    }
  }

  const doc = await Hotel.find(searchBy);

  if (!doc || (doc && doc.length === 0)) {
    return next(new AppError("No document found with that ID", 404, res));
  }

  res.status(200).json({
    status: "success",
    length: doc.length,
    data: doc,
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

exports.getAllHotels = factory.getAll(Hotel);

exports.updateHotel = factory.updateOne(Hotel);

exports.deleteHotel = factory.deleteOne(Hotel);
const factory = require('./handlerFactory');
const Booking = require('./../models/bookingModel');

exports.getAllBookings = factory.getAll(Booking);

exports.createBooking = factory.createOne(Booking);

exports.getBooking = factory.getOne(Booking);

exports.updateBooking = factory.updateOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);
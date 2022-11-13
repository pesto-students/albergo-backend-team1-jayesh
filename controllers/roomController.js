const Room = require('./../models/roomModel');
const factory = require('./handlerFactory');

exports.getAllRooms = factory.getAll(Room);

exports.getRoom = factory.getOne(Room);

exports.createRoom = factory.createOne(Room);

exports.updateRoom = factory.updateOne(Room);

exports.deleteRoom = factory.deleteOne(Room);
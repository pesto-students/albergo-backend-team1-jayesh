// room schema
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel'
    },
    name: String,
    price: Number,
    capacity: Number,
    images: [String]
});

roomSchema.pre(/^find/, function (next) {
    this.populate('hotel').populate({
        path: 'hotel',
        select: 'name'
    });
    next();
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
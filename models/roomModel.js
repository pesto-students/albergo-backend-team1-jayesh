// room schema
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel'
    },
    type: String,
    price: Number,
    capacity: Number,
    facilities: [String],
    amenities: [String],
    img: [String],
    available: Boolean,
    quantityAvailable: Number
});

roomSchema.pre(/^find/, function (next) {
    this.populate('hotel').populate({
        path: 'hotel',
        select: 'name'
    });
    next();
});

const Rooms = mongoose.model('Rooms', roomSchema);
model.exports = Rooms;
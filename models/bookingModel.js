const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: 'Hotel',
        required: [true, 'Booking must belong to a Hotel!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: [true, 'Booking must belong to a User!']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price.']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'hotel',
        select: 'name'
    });
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
const mongoose = require('mongoose');
const User = require('./userModel');

const wishlistSchema = new mongoose.Schema({
    wish: {
        type: String,
        required: [true]
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserDB'
    }
});

wishlistSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'hotel',
        select: 'name'
    });
    next();
});

wishlistSchema.pre(/^find/, function (next) {
    this.populate('hotel').populate({
        path: 'user',
        select: 'name'
    });
    next();
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
const mongoose = require('mongoose');
const Hotel = require('./hotelModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    }).populate({
        path: 'hotel',
        select: 'name'
    });

    next();
});

reviewSchema.statics.calcAverageRatings = async function (hotelId) {
    const stats = await this.aggregate([
        {
            $match: { hotel: hotelId }
        },
        {
            $group: {
                _id: '$hotel',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Hotel.findByIdAndUpdate(hotelId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Hotel.findByIdAndUpdate(hotelId, {
            ratingsQuantity: 0,
            ratingsAverage: 3
        });
    }
};

reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.hotel);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    next();
})

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r.hotel)
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
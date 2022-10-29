const mongoose = require('mongoose');
const slugify = require('slugify');

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A hotel must have a name'],
    },
    slug: String,
    hotelPhone: {
        type: Number,
        required: [true, 'A hotel must have a phone number'],
        unique: true
    },
    hotelEmail: {
        type: String,
        unique: true,
        sparse: true,
        required: [true, 'A hotel must have an email address']
    },
    hotelPassword: {
        type: String,
        minlength: 8,
        required: [true, 'A hotel must have a password']
    },
    hotelAddress: {
        type: String,
        required: [true, 'A hotel must have an address']
    },
    hotelCity: {
        type: String,
        required: [true, 'A hotel must have a city location']
    },
    hotelState: {
        type: String,
        required: [true, 'A hotel must have a state location']
    },
    hotelCountry: {
        type: String,
        required: [true, 'A hotel must have a country location']
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    coordinates: {
        type: [Number]
    },
    ratingsAverage: {
        type: Number,
        default: 0,
        min: [0, 'Ratings must be above 0'],
        max: [5, 'Ratings must be below 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    hotelDescription: {
        type: String,
        trim: true,
    },
    // imageCover: {
    //     type: String,
    //     required: [true, 'A hotel must have a cover image']
    // },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    hotelEmp: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ],
    rooms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rooms'
        }
    ],
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    });


// Document middleware
hotelSchema.pre('save', function (next) {
    this.slug = slugify(this.id, { lower: true });
    // this.slug = slugify(this.name.concat(this.id), { lower: true });
    next();
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
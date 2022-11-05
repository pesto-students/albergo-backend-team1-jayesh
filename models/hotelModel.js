const mongoose = require('mongoose');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const helperFunctions = require('./../utils/helperFunctions');

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A hotel must have a name'],
    },
    slug: String,
    phone: {
        type: Number,
        required: [true, 'A hotel must have a phone number'],
        unique: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        required: [true, 'A hotel must have an email address']
    },
    password: {
        type: String,
        minlength: 8,
        required: [true, 'A hotel must have a password']
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        minlength: 8,
        validate: {
            // This only works for create and save operations
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords don't match"
        }
    },
    passwordChangedAt: Date,
    address: {
        type: String,
        required: [true, 'A hotel must have an address']
    },
    city: {
        type: String,
        required: [true, 'A hotel must have a city location']
    },
    state: {
        type: String,
        required: [true, 'A hotel must have a state location']
    },
    country: {
        type: String,
        required: [true, 'A hotel must have a country location']
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    facilities: [String],
    coordinates: {
        long: Number,
        lat: Number
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
    description: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        enum: ['User', 'Employee', 'Hotel']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
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
    this.slug = generateUID(this.name, this.city);
    this.name = this.name.toLowerCase();
    this.city = this.city.toLowerCase();
    this.state = this.state.toLowerCase();
    this.country = this.country.toLowerCase();
    next();
});

hotelSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

hotelSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

hotelSchema.methods.correctPassword = helperFunctions.correctPassword;

hotelSchema.methods.changedPasswordAfter = helperFunctions.changedPasswordAfter;

hotelSchema.methods.createPasswordResetToken = helperFunctions.createPasswordResetToken;

function generateUID(hotelName, hotelCity) {
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = (
        hotelName.replace(" ", "-").slice(0, 3) + firstPart.toString(36)
    ).slice(-3);
    secondPart = (hotelCity.slice(0, 3) + secondPart.toString(36)).slice(-3);
    const result = firstPart + secondPart;
    return result.toString().toLowerCase().trim();
}

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
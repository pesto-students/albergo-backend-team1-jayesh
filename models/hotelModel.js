<<<<<<< HEAD
import { Schema, model } from "mongoose";
// import slugify from 'slugify';
=======
const mongoose = require('mongoose');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const helperFunctions = require('./../utils/helperFunctions');
>>>>>>> master

const hotelSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "A hotel must have a name"],
    },
    slug: String,
<<<<<<< HEAD
    hotelPhone: {
      type: Number,
      required: [true, "A hotel must have a phone number"],
      unique: true,
    },
    hotelEmail: {
      type: String,
      unique: true,
      sparse: true,
      required: [true, "A hotel must have an email address"],
    },
    hotelPassword: {
      type: String,
      minlength: 8,
      required: [true, "A hotel must have a password"],
    },
    hotelAddress: {
      type: String,
      required: [true, "A hotel must have an address"],
    },
    hotelCity: {
      type: String,
      required: [true, "A hotel must have a city location"],
    },
    hotelState: {
      type: String,
      required: [true, "A hotel must have a state location"],
    },
    hotelCountry: {
      type: String,
      required: [true, "A hotel must have a country location"],
=======
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
>>>>>>> master
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    facilities: [String],
    coordinates: {
<<<<<<< HEAD
      type: [Number],
=======
        long: Number,
        lat: Number
>>>>>>> master
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, "Ratings must be above 0"],
      max: [5, "Ratings must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
<<<<<<< HEAD
    hotelDescription: {
      type: String,
      trim: true,
=======
    description: {
        type: String,
        trim: true,
>>>>>>> master
    },
    role: {
        type: String,
        enum: ['User', 'Employee', 'Hotel']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
<<<<<<< HEAD
    hotelEmp: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
=======
>>>>>>> master
    rooms: [
      {
        type: Schema.Types.ObjectId,
        ref: "Rooms",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

function generateUID(hotelName, hotelCity) {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = (
    hotelName.replace(" ", "-").slice(0, 3) + firstPart.toString(36)
  ).slice(-3);
  secondPart = (hotelCity.slice(0, 3) + secondPart.toString(36)).slice(-3);
  const result = firstPart + secondPart;
  return result.toString().toLowerCase().trim();
}

// Document middleware
<<<<<<< HEAD
hotelSchema.pre("save", function (next) {
  this.slug = generateUID(this.name, this.hotelCity);
  // this.slug = slugify(this.name.concat(this.id), { lower: true });
  next();
});

const HotelModel = model("Hotel", hotelSchema);
=======
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
>>>>>>> master

export default HotelModel;

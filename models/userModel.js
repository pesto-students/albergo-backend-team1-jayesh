const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const helperFunctions = require('./../utils/helperFunctions');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please specify your name.']
    },
    email: {
        type: String,
        required: [true, 'Please specify your email address.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email address.']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['User', 'Employee', 'Hotel']
    },
    wishlist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wishlist'
    },
    bookings: [String],
    reviews: [String],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.correctPassword = helperFunctions.correctPassword;

userSchema.methods.changedPasswordAfter = helperFunctions.changedPasswordAfter;

userSchema.methods.createPasswordResetToken = helperFunctions.createPasswordResetToken;

const User = mongoose.model('UserDB', userSchema);
module.exports = User;
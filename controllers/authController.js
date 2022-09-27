const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' })

const User = require('./../models/userModel');

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        //secure: true,     // Since in development we don't have HTTPS
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });

    createSendToken(newUser, 201, res);
}

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new Error('Please provide an email address and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new Error('Incorrect email or password provided', 401));
    }

    createSendToken(user, 200, res);
}


exports.protect = async (req, res, next) => {
    // 1) Get the token and check if its there
    const auth = req.headers.authorization;

    let token;

    if (auth && auth.startsWith('Bearer')) {
        token = auth.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new Error('You are not allowed to access this page. Please login.'));
    }

    // 2) Verification token
    let decodedToken;
    try {
        decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (e) {
        console.log(e);
    }
    console.log(decodedToken);

    // 3) Check if user still exists
    const freshUser = await User.findById(decodedToken.id);
    if (!freshUser)
        return next(new Error('The user belonging to this token no longer exists.'));

    // 4) Check if user changed password after JWT was issued
    if (freshUser.changedPasswordAfter(decodedToken.iat))
        return next(new Error('User recently changed password! Please log in again'));

    // Access granted to the protected route
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
};
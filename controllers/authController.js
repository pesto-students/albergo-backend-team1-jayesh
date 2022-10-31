const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const dotenv = require('dotenv');
const AppError = require('./../utils/appError');

dotenv.config({ path: './.env' })

const User = require('./../models/userModel');
const { log } = require('console');

const signToken = (id, email, name, role) => {
    return jwt.sign({ id, email, name, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id, user.email, user.name, user.role);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        //secure: true,     // Since in development we don't have HTTPS
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token
    });
};

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
}

exports.signup = async (req, res) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });

    createSendToken(newUser, 201, res);
}

exports.checkEmail = async (req, res, next) => {
    const email = req.body.email;
    const user = await User.findOne(email);
    if (user) {
        res.status(200).json({
            status: 'success',
            message: 'Email valid'
        });
    } else {
        return next(new AppError('No user found with this email', 404, res));
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide an email address and password', 400, res));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password provided', 401, res));
    }

    createSendToken(user, 200, res);
}

exports.isLoggedIn = async (req, res, next) => {
    // Getting the token and check if it exists
    const auth = req.headers.authorization;

    let token;

    if (auth && auth.startsWith('Bearer')) {
        token = auth.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    console.log(token);
    if (token) {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        // Check if user exists 
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next();
        }

        // Check if user changed password after token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next();
        }
        // User is logged in
        res.locals.user = currentUser;

        res.status(200).json({
            status: 'success',
            data: {
                user: currentUser,
                token: token
            }
        });

    }
    next();
};

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
        return next(new AppError('You are not allowed to access this page. Please login.', 401, res));
    }

    // 2) Verification token
    let decodedToken;
    try {
        decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (e) {
        console.log(e);
    }

    // 3) Check if user still exists
    const freshUser = await User.findById(decodedToken.id);
    if (!freshUser) {
        return next(new AppError('The user belonging to this token no longer exists.', 400, res));
    }

    // 4) Check if user changed password after JWT was issued
    if (freshUser.changedPasswordAfter(decodedToken.iat)) {
        return next(new AppError('User recently changed password! Please log in again', 401, res));
    }

    // Access granted to the protected route
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
};

exports.updatePassword = async (req, res, next) => {
    // 1) get user from collection
    const user = await User.findById(req.user.id).select('+password')

    // 2) Check if posted password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 401, res));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log the user in & send JWT
    createSendToken(user, 200, res);
}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to access this page', 403, res));
        }
        next();
    };
};

exports.forgetPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with this email address', 404, res));
    }

    // Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email

    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
        // const resetURL = `https://${req.get('host')}/reset-password/${resetToken}`;

        res.status(200).json({
            status: 'success',
            message: 'Reset token has been sent!',
            URL: resetURL
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending password reset token. Please try again later.', 500, res));
    };
};

exports.resetPassword = async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired and there is user, set the new password
    if (!user) {
        next(new AppError('Token is invalid or expired. Please try again later.', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);

    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success, password changed',
    //     token,
    //     message: "logged in"
    // });
};
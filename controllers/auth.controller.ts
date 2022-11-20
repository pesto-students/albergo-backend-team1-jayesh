// import jwt from 'jsonwebtoken';
// import { promisify } from 'util';
// import AppError from './../utils/appError';
// import UserModel from './../models/userModel';
// import Hotel from './../models/hotelModel';
// import { NextFunction, Request, Response } from 'express';
// import { JWT_SECRET } from '../utils/constants';

import { IPayload } from "../utils/helperFunctions";

// export const protect = async (req: Request, res: Response, next: NextFunction) => {
//     // 1) Get the token and check if its there
//     const auth = req.headers.authorization;

//     let token;

//     if (auth && auth.startsWith('Bearer')) {
//         token = auth.split(' ')[1];
//     } else if (req.cookies.jwt) {
//         token = req.cookies.jwt;
//     }

//     if (!token) {
//         return next(new AppError('You are not allowed to access this page. Please login.', 401, res));
//     }

//     // 2) Verification token
//     let decodedToken;
//     try {
//         decodedToken = await promisify(jwt.verify)(token, JWT_SECRET);
//     } catch (e) {
//         console.log(e);
//     }

//     // 3) Check if user still exists

//     const freshUser = await UserModel.findById(decodedToken.id) || await Hotel.findOne({ slug: decodedToken.slug });
//     if (!freshUser) {
//         return next(new AppError('The user belonging to this token no longer exists.', 400, res));
//     }

//     // 4) Check if user changed password after JWT was issued
//     if (freshUser.changedPasswordAfter(decodedToken.iat)) {
//         return next(new AppError('User recently changed password! Please log in again', 401, res));
//     }

//     // Access granted to the protected route
//     req.user = freshUser;
//     res.locals.user = freshUser;
//     next();
// };

// exports.updatePassword = async (req, res, next) => {
//     // 1) get user from collection
//     const user = await UserModel.findById(req.user.id).select('+password');

//     // 2) Check if posted password is correct
//     if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
//         return next(new AppError('Your current password is wrong', 401, res));
//     }

//     // 3) If so, update password
//     user.password = req.body.password;
//     user.passwordConfirm = req.body.passwordConfirm;
//     await user.save();

//     // 4) Log the user in & send JWT
//     createSendToken(user, 200, res);
// };

// exports.restrictTo = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             return next(new AppError('You do not have permission to access this page', 403, res));
//         }
//         next();
//     };
// };

// exports.forgetPassword = async (req, res, next) => {
//     const user = await UserModel.findOne({ email: req.body.email });
//     if (!user) {
//         return next(new AppError('There is no user with this email address', 404, res));
//     }

//     // Generate the random reset token
//     const resetToken = user.createPasswordResetToken();
//     await user.save({ validateBeforeSave: false });

//     // 3) Send it to user's email

//     try {
//         const resetURL = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
//         // const resetURL = `https://${req.get('host')}/reset-password/${resetToken}`;

//         res.status(200).json({
//             status: 'success',
//             message: 'Reset token has been sent!',
//             URL: resetURL
//         });
//     } catch (err) {
//         user.passwordResetToken = undefined;
//         user.passwordResetExpires = undefined;
//         await user.save({ validateBeforeSave: false });
//         return next(new AppError('There was an error sending password reset token. Please try again later.', 500, res));
//     };
// };

// exports.resetPassword = async (req, res, next) => {
//     // 1) Get user based on the token
//     const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

//     const user = await UserModel.findOne({
//         passwordResetToken: hashedToken,
//         passwordResetExpires: { $gt: Date.now() },
//     });

//     // 2) If token has not expired and there is user, set the new password
//     if (!user) {
//         next(new AppError('Token is invalid or expired. Please try again later.', 400));
//     }

//     user.password = req.body.password;
//     user.passwordConfirm = req.body.passwordConfirm;
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save();

//     // 3) Update changedPasswordAt property for the user

//     // 4) Log the user in, send JWT
//     createSendToken(user, 200, res);

//     // const token = signToken(user._id);
//     // res.status(200).json({
//     //     status: 'success, password changed',
//     //     token,
//     //     message: "logged in"
//     // });
// };

export interface IParsedToken extends IPayload {
    iat: number;
    exp: number;
}

export const parseJWT = (token: string | null) => {
    return token === null
        ? null
        : (JSON.parse(
            Buffer.from(token, 'base64').toString()
        ) as IParsedToken) ?? null;
};

export const fullParseJWT = (token: string | null) => {
    if (token) {
        const bearer = token.split(".");
        const bearerToken = bearer[1];
        return parseJWT(bearerToken);
    }
    return null;
};

export const validateJWT = (token: IParsedToken | null) => {
    if (!token) return false;
    const tokenexp = new Date(0);
    tokenexp.setUTCSeconds(token.exp);
    if (Date.now() <= +tokenexp) {
        return true;
    }
    return false;
};
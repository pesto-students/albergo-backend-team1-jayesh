import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import HotelModel from "../models/hotel.model";
import UserModel from "../models/user.model";

export const createBookingMiddleware = [
    body("hotelSlug", "Hotel slug should be a valid param")
        .isAlphanumeric()
        .notEmpty()
        .isLength({
            min: 4
        }).custom(async val => {
            const hotelDoc = await HotelModel.findOne({
                slug: val
            });

            if (!hotelDoc) Promise.reject("Invalid hotel slug");
        }),
    body("checkIn", "checkIn field should be a valid date of type date")
        .isDate(),
    body("checkOut", "checkOut field should be a valid date of type date")
        .isDate(),
    body("guest", "should be a valid object consistsing adult and children properties")
        .isObject({
            strict: true
        }),
    body("amount", "should be a valid number")
        .isNumeric(),
    body("razorpay_payment_id", "razorpay_payment_id should be a valid string")
        .isString()
        .notEmpty()
        .isLength({
            min: 5
        }),
    body("room", "Should be a valid Array of object of properties consisiting roomID and quantity")
        .isObject()
        .notEmpty(),
    body("userName", "userName should be a valid string")
        .isString()
        .notEmpty()
        .isLength({
            min: 3
        }),
    body("hotelName", "hotelName should be a valid string")
        .isString()
        .notEmpty()
        .isLength({
            min: 3
        }),

];

export const checkSlugOrUUID = async (req: Request, res: Response, next: NextFunction) => {
    const parsedToken = req.parsedToken;

    try {

        if (parsedToken?.slug) {
            const doc = await HotelModel.findOne({
                email: parsedToken.email
            });

            if (!doc) {
                return res.status(400).json({
                    message: "Account not found"
                });
            }

            if (doc.slug !== parsedToken.slug) {
                return res.status(400).json({
                    message: "Account slug invalid"
                });
            }

            next();
        }

        if (parsedToken?.uuid) {
            const doc = await UserModel.findOne({
                email: parsedToken.email
            });

            if (!doc) {
                return res.status(400).json({
                    message: "Account not found"
                });
            }

            if (doc.uuid !== parsedToken.uuid) {
                return res.status(400).json({
                    message: "Account uuid not valid"
                });
            }

            next();
        }

    } catch (error) {
        if (error) {
            console.error(error);
            return res.status(400).json({
                error,
            });
        }
    }
};
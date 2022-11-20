import { body } from "express-validator";
import HotelModel from "../models/hotel.model";

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
    body("checkIn", "checkIn field should be a valid date of type date").isDate(),
    body("checkOut", "checkOut field should be a valid date of type date").isDate(),
    body("guest", "should be a valid object consistsing adult and children properties").isObject({
        strict: true
    }),
    body("price", "should be a valid number").isFloat(),
    body("razorpay_payment_id", "razorpay_payment_id should be a valid string")
        .isString()
        .notEmpty()
        .isLength({
            min: 5
        }),
    body("rooms", "Should be a valid Array of object of properties consisiting roomID and quantity").isArray().optional({
        checkFalsy: true
    }).notEmpty().isLength({
        min: 1
    })

];
import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import HotelModel from "../models/hotel.model";
import UserModel from "../models/user.model";

export const wishlistIdMiddleware = [
    body("wishlistId", "should be valid hotel Slug")
        .isAlphanumeric()
        .notEmpty()
        .isLength({
            min: 4
        }).custom(async val => {
            const hotelDoc = await HotelModel.findOne({
                slug: val
            });

            if (!hotelDoc) {
                Promise.reject("hotel slug is invalid");
            }
        })
];


export const checkTokenUuidDB = async (req: Request, res: Response, next: NextFunction) => {
    const parsedToken = req.parsedToken;

    try {
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

    } catch (error) {
        if (error) {
            console.error(error);
            return res.status(400).json({
                error,
            });
        }
    }
};
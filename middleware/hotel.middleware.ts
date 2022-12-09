import { NextFunction, Request, Response } from "express";
import { body, oneOf, param, query } from "express-validator";
import HotelModel from "../models/hotel.model";
import UserModel from "../models/user.model";

export const paginateMiddleware = [
    query("page", "page field should be a valid number").optional({
        checkFalsy: true
    }).isNumeric(),
    query("perPage", "perPage field should be a valid number").optional({
        checkFalsy: true
    }).isNumeric(),
];

export const checkSlug = param("slug", "Hotel slug should be a valid param")
    .isAlphanumeric()
    .notEmpty()
    .isLength({
        min: 4
    });

export const checkTokenSlugDB = async (req: Request, res: Response, next: NextFunction) => {
    const parsedToken = req.parsedToken;

    try {
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

    } catch (error) {
        if (error) {
            console.error(error);
            return res.status(400).json({
                error,
            });
        }
    }
};

export const hotelSignupMiddleware = [
    body("name", "name field should be a valid hotel name")
        .isString()
        .trim()
        .isLength({
            min: 5,
        }),
    body("email", "Invalid email")
        .isEmail()
        .normalizeEmail({
            all_lowercase: true,
        })
        .custom(async (value) => {
            let docs = await Promise.all([
                HotelModel.findOne({
                    email: value,
                }), UserModel.findOne({
                    email: value,
                })]);

            if (docs[0] || docs[1]) {
                return Promise.reject("Account already exists with this email");
            }
        }),
    body("password")
        .isLength({
            min: 8,
        })
        .withMessage("Password must contain at least 8 characters")
        .matches(/[a-zA-Z]/)
        .withMessage("must contain alphabets")
        .matches(/[A-Z]/)
        .withMessage("must contain an uppercase letter")
        .matches(/\d/)
        .withMessage("must contain a number")
        .matches(/[~!@#$%^&*()_+-=\\]/)
        .withMessage("must contain a special character"),
    body("phone", "phone field should be a valid phone number")
        .isMobilePhone("any"),
    body("address", "address field should be valid address")
        .isString()
        .trim()
        .isLength({
            min: 10
        }).withMessage("Shoulld have a min lenght of 10"),
    body("city", "should be a valid city").
        isString()
        .trim()
        .isLength({
            min: 3
        }).withMessage("Shoulld have a min lenght of 3"),
    body("state", "should be a valid state").
        isString()
        .trim()
        .isLength({
            min: 3
        }).withMessage("Shoulld have a min lenght of 3"),
    body("country", "should be a valid country").
        isString()
        .trim()
        .isLength({
            min: 4
        }).withMessage("Shoulld have a min lenght of 4"),
];

export const hotelPatchMiddleware = oneOf([
    body("name")
        .isString()
        .trim()
        .isLength({
            min: 5,
        }).isAlphanumeric(),
    body("email", "Invalid email")
        .isEmail()
        .normalizeEmail({
            all_lowercase: true,
        })
        .custom(async (value) => {
            const docs = await Promise.all([
                HotelModel.findOne({
                    email: value,
                }), UserModel.findOne({
                    email: value,
                })]);

            if (docs.length > 0) {
                return Promise.reject("Account already exists with this email");
            }
        }),
    body("password")
        .isLength({
            min: 8,
        })
        .withMessage("Password must contain at least 8 characters")
        .matches(/[a-zA-Z]/)
        .withMessage("must contain alphabets")
        .matches(/[A-Z]/)
        .withMessage("must contain an uppercase letter")
        .matches(/\d/)
        .withMessage("must contain a number")
        .matches(/[~!@#$%^&*()_+-=\\]/)
        .withMessage("must contain a special character"),
    body("phone", "phone field should be a valid phone number")
        .isMobilePhone("any", {
            strictMode: true
        }),
    body("address", "address field should be valid address")
        .isString()
        .trim()
        .isLength({
            min: 10
        }).withMessage("Shoulld have a min lenght of 10"),
    body("description", "description field should be a valid description").notEmpty(),
]);

export const addPhotosMiddleware = body("photos", "photos field should be a valid array of object").isArray().notEmpty();

export const deletePhotosMiddleware = body("imageRef", "imageRef field should be a valid ref of image").isString().notEmpty();

export const facilitiesMiddleware = body("facilities", "facilities field should be a valid of facility object").isArray().notEmpty();

export const hotelSearchMiddleware = query("query", "Please enter a valid query").isString().notEmpty().isLength({
    min: 3
});

export const withinMiddleware = [
    body("unit", "unit field can be mi or km").isString().notEmpty().toLowerCase().custom((val) => {
        if (val !== ("mi" && "km")) Promise.reject("unit field can be mi or km");
    }),
    body("distance", "Please enter a valid distance").isNumeric(),
    body("coords", "Should be a object of lat and long").isObject({
        strict: true
    }).custom(val => {
        for (const key in val) {
            if (Object.prototype.hasOwnProperty.call(val, key)) {

                if (key !== ("lat" && "long")) {
                    Promise.reject("Should be a object of lat and long");
                }

                if (typeof val[key] !== "number") {
                    Promise.reject("value should be of type number");
                }

            }
        }

        const lat = val?.lat;
        const long = val?.long;

        if (-90 > lat || lat > 90 || -180 > long || long > 180) {
            Promise.reject("value should be in valid range of latitude and longitude");
        }
    })
];
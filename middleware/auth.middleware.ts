import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { parseJWT, validateJWT } from "../controllers/auth.controller";
import HotelModel from "../models/hotel.model";
import UserModel from "../models/user.model";

export const signupValidation = [
    body("name", "Please enter a valid name")
        .isString()
        .trim()
        .isLength({
            min: 3,
        }),
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

            const doc = docs[0] ?? docs[1] ?? null;

            if (doc) {
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
        .withMessage("must contain a special character")
];

export const loginValidation = [
    body("email", "Invalid email").isEmail().normalizeEmail(),
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
];

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
        const bearerHeader = req.headers.authorization;

        const bearer = bearerHeader.split(".");

        const bearerToken = bearer[1];

        if (bearerToken) {
            req.token = bearerToken;
            next();
        } else {
            return res.status(403).json({
                message: "No valid jwt token in the header",
            });
        }
    } else {
        return res.status(403).json({
            message: "No jwt token in the header",
        });
    }
};

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
    if (req.token) {
        const token = req.token;

        const parsedToken = parseJWT(token);
        if (parsedToken) {
            const isValid = validateJWT(parsedToken);
            if (isValid) {
                req.parsedToken = parsedToken;
                next();
            }
            else {
                return res.status(403).json({
                    message: "JWT token is expired"
                });
            }
        }
        else {
            return res.status(403).json({
                message: "No valid token on request"
            });
        }

    } else {
        return res.status(403).json({
            message: "No token on request"
        });
    }
};

export const checkTokenRoleDB = async (req: Request, res: Response, next: NextFunction) => {
    const parsedToken = req.parsedToken;

    try {
        const _doc = await Promise.all([UserModel.findOne({
            email: parsedToken.email
        }), HotelModel.findOne({
            email: parsedToken.email
        })]);

        const doc = _doc[0] ?? _doc[1] ?? null;

        if (!doc) {
            return res.status(400).json({
                message: "Account not found"
            });
        }

        if (doc.role !== parsedToken.role) {
            return res.status(400).json({
                message: "Account role invalid"
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

export const allowRoleHotel = (req: Request, res: Response, next: NextFunction) => {
    const parsedToken = req.parsedToken;
    if (parsedToken.role !== "HOTEL") {
        return res.status(400).json({
            message: "Invalid role for this operation"
        });
    }
    next();
};

export const allowRoleUser = (req: Request, res: Response, next: NextFunction) => {
    const parsedToken = req.parsedToken;
    if (parsedToken.role !== "USER") {
        return res.status(400).json({
            message: "Invalid role for this operation"
        });
    }
    next();
};
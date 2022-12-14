import { Request, Response, Router } from "express";
import { validationResult } from "express-validator";
import { Document } from "mongoose";
import { allowRoleUser, checkTokenRoleDB, validateToken, verifyToken } from "../middleware/auth.middleware";
import { checkBookingId, checkSlugOrUUID, createBookingMiddleware } from "../middleware/bookings.middleware";
import { paginateMiddleware } from "../middleware/hotel.middleware";
import { checkTokenUuidDB } from "../middleware/user.middleware";
import BookingModel from "../models/booking.model";
import HotelModel from "../models/hotel.model";
import UserModel from "../models/user.model";
import { defaultUserProjectile, generateUID } from "../utils/helperFunctions";

const router = Router();

router.get("/", [verifyToken, validateToken, checkTokenRoleDB, ...paginateMiddleware, checkSlugOrUUID], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const parsedToken = req.parsedToken;

    const page = req.query.page ?? 1;

    if (isNaN(+page)) {
        return res.status(400).json({
            message: "Page number is not valid"
        });
    }

    if (page < 1) {
        return res.status(400).json({
            message: "Page number is not valid"
        });
    }

    const perPage = 10;

    const skipCount = +page === 1 ? 0 : (+page - 1) * +perPage;

    let findQuery: any = {
        userUUID: parsedToken.uuid ?? undefined,
        hotelSlug: parsedToken.slug ?? undefined
    };

    // remove undefined keys
    findQuery = Object.keys(findQuery).reduce((acc: any, key) => {
        if (findQuery[key] !== undefined) {
            acc[key] = findQuery[key];
        }
        return acc;
    }, {});

    try {

        const totalDocs = await BookingModel.countDocuments(findQuery);

        if (totalDocs < 1) {
            return res.status(403).json({
                message: "No data found"
            });
        }

        if (skipCount > totalDocs) {
            return res.status(403).json({
                message: "No data found"
            });
        }

        const bookingDocs = await BookingModel.find(findQuery).skip(skipCount).limit(+perPage);


        if (!bookingDocs || bookingDocs.length < 1) {
            return res.status(403).json({
                message: "No data found"
            });
        }

        return res.status(200).json({
            data: {
                totalDocs,
                docs: bookingDocs
            }
        });

    } catch (error) {
        if (error) {
            console.error(error);
            return res.status(400).json({
                error,
            });
        }
    }
});

router.post("/", [verifyToken, validateToken, checkTokenRoleDB, allowRoleUser, checkTokenUuidDB, ...createBookingMiddleware], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const parsedToken = req.parsedToken;

    try {

        const newBookingDoc = await BookingModel.create({
            ...req.body,
            bookingId: generateUID(`${req.body.hotelSlug} ${req.body.userUUID}`, new Date().toString().replaceAll(" ", ""))
        });

        if (!newBookingDoc) {
            return res.status(400).json({
                message: "Error creating booking"
            });
        }

        const bookingUserAndHotelDoc = await Promise.all([
            HotelModel.findOneAndUpdate({
                slug: req.body.hotelSlug
            }, {
                $push: {
                    bookings: newBookingDoc.bookingId
                }
            }),
            UserModel.findOneAndUpdate({
                uuid: parsedToken.uuid
            }, {
                $push: {
                    bookings: newBookingDoc.bookingId
                }
            })
        ]);

        bookingUserAndHotelDoc.forEach(doc => {
            if (!doc) {
                return res.status(400).json({
                    message: "Could not register bookings"
                });
            }
        });

        return res.status(200).json({
            message: "Booking created successfully",
            data: newBookingDoc
        });

    } catch (error) {
        if (error) {
            console.error(error);
            return res.status(400).json({
                error,
            });
        }
    }
});

router.get("/:bookingId", [verifyToken, validateToken, checkTokenRoleDB, checkBookingId], async (req: Request, res: Response) => {

    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const parsedToken = req.parsedToken;

    const bookingId = req.params.bookingId;

    try {

        const query = {
            bookingId,
            hotelSlug: parsedToken.slug ?? undefined,
            userUUID: parsedToken.uuid ?? undefined
        };

        const findQuery = Object.keys(query).reduce((acc: any, key) => {
            if (query[key as keyof typeof query] !== undefined) {
                acc[key] = query[key as keyof typeof query];
            }
            return acc;
        }, {});

        const bookingDoc = await BookingModel.findOne(findQuery);

        if (!bookingDoc) {
            return res.status(400).json({
                message: "Booking not found"
            });
        }

        const userDoc = await UserModel.findOne({
            uuid: bookingDoc?.userUUID
        }, defaultUserProjectile);

        if (!userDoc) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            data: {
                bookingDoc,
                userDoc
            }
        });

    } catch (error) {
        if (error) {
            console.error(error);
            return res.status(400).json({
                error,
            });
        }
    }
});

export default router;

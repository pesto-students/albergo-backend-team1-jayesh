import { NextFunction, Request, Response, Router } from "express";
import { query, validationResult } from "express-validator";
import { allowRoleUser, checkTokenRoleDB, validateToken, verifyToken } from "../middleware/auth.middleware";
import { createBookingMiddleware } from "../middleware/bookings.middleware";
import { checkTokenSlugDB, paginateMiddleware } from "../middleware/hotel.middleware";
import { checkTokenUuidDB } from "../middleware/user.middleware";
import BookingModel from "../models/booking.model";
import HotelModel from "../models/hotel.model";
import RoomModel from "../models/room.model";
import UserModel from "../models/user.model";
import { defaultHotelProjectile } from "../utils/helperFunctions";

const router = Router();

router.get("/", [verifyToken, validateToken, checkTokenRoleDB, ...paginateMiddleware], async (req: Request, res: Response, next: NextFunction) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const parsedToken = req.parsedToken;

    if (parsedToken?.slug) checkTokenSlugDB(req, res, next);
    if (parsedToken?.uuid) checkTokenUuidDB(req, res, next);

    const page = req.query.page ?? 1;

    const perPage = req.query.perPage ?? 10;

    const skipCount = +page === 1 ? 0 : (+page - 1) * +perPage;

    try {
        const bookingDocs = await BookingModel.find({
            userUUID: parsedToken.uuid
        }).skip(skipCount).limit(+perPage);

        if (!bookingDocs || bookingDocs.length < 1) {
            return res.status(403).json({
                message: "No data found"
            });
        }

        let resultArr: {
            [key: string]: any;
        }[] = [];

        bookingDocs.forEach(async bookingDoc => {
            const hotelDoc = await HotelModel.findOne({
                slug: bookingDoc.hotelSlug
            }, defaultHotelProjectile);

            if (!hotelDoc) {
                return res.status(400).json({
                    message: "error loading bookings"
                });
            }

            const bookingDocRooms = bookingDoc.rooms;

            if (!bookingDocRooms || bookingDocRooms.length < 1) {
                return res.status(400).json({
                    message: "error loading bookings"
                });
            }

            let roomsObj: {
                [key: string]: any;
            }[] = [];

            bookingDocRooms.forEach(async bookingDocRoom => {
                const roomDoc = await RoomModel.findOne({
                    roomId: bookingDocRoom.roomId
                });

                if (!roomDoc) {
                    return res.status(400).json({
                        message: "error loading bookings"
                    });
                }

                roomsObj.push({
                    roomDoc,
                    quantity: bookingDocRoom.quantity
                });

            });

            resultArr.push({
                ...bookingDoc,
                hotelDoc,
                rooms: roomsObj
            });

        });

        if (resultArr.length < 1) {
            return res.status(400).json({
                message: "Error loading bookings"
            });
        }

        return res.status(200).json({
            data: resultArr
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
            hotelSlug: req.body.hotelSlug,
            userUUID: parsedToken.uuid,
            checkIn: req.body.checkIn,
            checkOut: req.body.checkOut,
            guest: req.body.checkOut,
            price: req.body.price,
            razorpay_payment_id: req.body.razorpay_payment_id,
            rooms: req.body.rooms
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
                    bookings: newBookingDoc.id
                }
            }),
            UserModel.findOneAndUpdate({
                uuid: parsedToken.uuid
            }, {
                $push: {
                    bookings: newBookingDoc.id
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

router.get("/:id", [verifyToken, validateToken, checkTokenRoleDB, query("id", "query").isString().notEmpty().isLength({
    min: 5
})], async (req: Request, res: Response, next: NextFunction) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const parsedToken = req.parsedToken;

    if (parsedToken?.slug) checkTokenSlugDB(req, res, next);
    if (parsedToken?.uuid) checkTokenUuidDB(req, res, next);

    try {
        const bookingDoc = await BookingModel.findById(req.query.id);

        if (!bookingDoc) {
            return res.status(400).json({
                message: "Booking not found"
            });
        }

        return res.status(200).json({
            data: bookingDoc
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

// router.use(protect);

// router.route("/").get(getAllBookings).post(createBooking);

// router.route("/:id").get(getBooking).patch(updateBooking).patch(deleteBooking);

export default router;

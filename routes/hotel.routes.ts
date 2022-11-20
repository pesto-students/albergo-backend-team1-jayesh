import { genSalt, hash } from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { validationResult } from 'express-validator';
import { allowRoleHotel, checkTokenRoleDB, validateToken, verifyToken } from '../middleware/auth.middleware';
import { checkSlug, checkTokenSlugDB, hotelPatchMiddleware, hotelSearchMiddleware, hotelSignupMiddleware, paginateMiddleware, withinMiddleware } from '../middleware/hotel.middleware';
import HotelModel from '../models/hotel.model';
import ReviewModel from '../models/review.model';
import RoomModel from '../models/room.model';
import { generateUID, IPayload, sendPayload } from '../utils/helperFunctions';

const router = Router();

router.get('/', [...paginateMiddleware], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const page = req.query.page ?? 1;

    const perPage = req.query.perPage ?? 10;

    const skipCount = +page === 1 ? 0 : (+page - 1) * +perPage;

    try {

        const docs = await HotelModel.find({}, {
            slug: 1,
            name: 1,
            city: 1,
            state: 1,
            country: 1,
            coordinates: 1,
            hotelImages: 1,
        }).skip(skipCount).limit(+perPage);

        if (!docs || docs.length < 1) {
            return res.status(403).json({
                message: "No data found"
            });
        }

        return res.status(200).json({
            data: docs
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

router.post("/signup", [...hotelSignupMiddleware], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    try {
        const newHotel = new HotelModel(req.body);

        const salt = await genSalt(10);

        const hashPassword = await hash(newHotel.password, salt);

        newHotel.password = hashPassword;

        newHotel.slug = generateUID(`${newHotel.name} ${new Date().toString().replaceAll(" ", "")}`, newHotel.city);

        const hotelDoc = await newHotel.save();

        const payload: IPayload = {
            email: hotelDoc.email,
            name: hotelDoc.name,
            uuid: hotelDoc.slug,
            role: "HOTEL"
        };

        const token = sendPayload(payload);
        return res.status(200).json({
            token: token
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

router.get("/:slug", checkSlug, async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const slug = req.params.slug;

    try {
        const doc = await HotelModel.findOne({ slug }, {
            slug: 1,
            name: 1,
            city: 1,
            state: 1,
            country: 1,
            coordinates: 1,
            hotelImages: 1,
            address: 1,
            description: 1,
            email: 1,
            facilities: 1,
            isFeatured: 1,
            phone: 1,
            reviews: 1,
            ratingsAverage: 1,
            ratingsQuantity: 1,
            rooms: 1
        });

        const docRooms = doc?.rooms;

        if (!doc) {
            return res.status(400).json({
                message: "Hotel Not found"
            });
        }

        if (docRooms && docRooms.length >= 1) {

            const roomDocs = await RoomModel.find({
                roomId: {
                    $in: docRooms
                }
            });

            if (roomDocs && roomDocs.length >= 1) {
                return res.status(200).json({
                    data: { ...doc, rooms: roomDocs }
                });
            }
        }

        return res.status(200).json({
            data: doc
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

router.patch("/", [verifyToken, validateToken, checkTokenRoleDB, allowRoleHotel, checkTokenSlugDB, hotelPatchMiddleware], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const token = req.parsedToken;

    try {

        const hotelDoc = await HotelModel.findOneAndUpdate({
            slug: token.slug
        }, { ...req.body }, {
            new: true,
            projection: {
                slug: 1,
                name: 1,
                city: 1,
                state: 1,
                country: 1,
                coordinates: 1,
                hotelImages: 1,
                address: 1,
                description: 1,
                email: 1,
                facilities: 1,
                isFeatured: 1,
                phone: 1,
                reviews: 1,
                ratingsAverage: 1,
                ratingsQuantity: 1,
                rooms: 1
            }
        });

        if (!hotelDoc) {
            return res.status(400).json({
                message: "Hotel Not found"
            });
        }

        const hotelRooms = hotelDoc.rooms;

        if (hotelRooms && hotelRooms.length >= 1) {

            const roomDocs = await RoomModel.find({
                roomId: {
                    $in: hotelRooms
                }
            });

            if (roomDocs.length >= 1) {
                return res.status(200).json({
                    data: { ...hotelDoc, rooms: roomDocs }
                });
            }
        }

        return res.status(200).json({
            data: hotelDoc
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

router.delete("/", [verifyToken, validateToken, checkTokenRoleDB, allowRoleHotel, checkTokenSlugDB], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const token = req.parsedToken;

    try {

        const hotelDoc = await HotelModel.findOneAndDelete({
            slug: token.slug
        });

        if (!hotelDoc) {
            return res.status(400).json({
                message: "Hotel Not found"
            });
        }

        const hotelRooms = hotelDoc.rooms;

        if (hotelRooms && hotelRooms.length >= 1) {

            const roomDeleteResult = await RoomModel.deleteMany({
                roomId: {
                    $in: hotelRooms
                }
            });

            if (roomDeleteResult.deletedCount !== hotelRooms.length) {
                return res.status(400).json({
                    message: "room(s) not deleted properly"
                });
            }

            return res.sendStatus(200);
        }

        return res.sendStatus(200);

    } catch (error) {
        if (error) {
            console.error(error);
            return res.status(400).json({
                error,
            });
        }
    }
});

// router.route('/:slug')
//   .get(hotelController.getHotel)
//   .patch(authController.protect, authController.restrictTo('Employee', 'Hotel'), hotelController.updateHotel)
//   .delete(authController.protect, authController.restrictTo('Employee', 'Hotel'), hotelController.deleteHotel);

router.post("/search", [hotelSearchMiddleware], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const { query } = req.query;

    try {

        const docs = await HotelModel.find({
            $or: [
                {
                    name: query
                },
                {
                    state: query
                },
                {
                    city: query
                },
                {
                    country: query
                },
                {
                    address: query
                },
            ]
        }, {
            slug: 1,
            name: 1,
            city: 1,
            state: 1,
            country: 1,
            coordinates: 1,
            hotelImages: 1,
        });

        if (!docs || docs.length < 1) {
            return res.status(400).json({
                message: "Hotel Not found"
            });
        }

        res.status(200).json({
            data: docs
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

router.get("/within", [...withinMiddleware], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    try {

        const unit = req.body.unit as string;
        const distance = req.body.distance as number;
        const coords: {
            lat: number;
            long: number;
        } = req.body.coords;

        const radius = unit.toLowerCase() === "mi" ? distance / 3963.2 : distance / 6378.1;

        const hotelDocs = await HotelModel.find({
            coordinates: {
                $geoWithin: {
                    $centerSphere: [
                        [
                            coords.long,
                            coords.lat
                        ],
                        radius
                    ]
                }
            },
        }, {
            slug: 1,
            name: 1,
            city: 1,
            state: 1,
            country: 1,
            coordinates: 1,
            hotelImages: 1,
        });

        if (!hotelDocs || hotelDocs.length < 1) {
            return res.status(403).json({
                message: "No data found"
            });
        }

        return res.status(200).json({
            data: hotelDocs
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
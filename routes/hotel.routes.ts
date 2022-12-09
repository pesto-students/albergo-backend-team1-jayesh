import { genSalt, hash } from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { validationResult } from 'express-validator';
import { allowRoleHotel, checkTokenRoleDB, validateToken, verifyToken } from '../middleware/auth.middleware';
import { facilitiesMiddleware, addPhotosMiddleware, checkSlug, checkTokenSlugDB, deletePhotosMiddleware, hotelPatchMiddleware, hotelSearchMiddleware, hotelSignupMiddleware, paginateMiddleware, withinMiddleware } from '../middleware/hotel.middleware';
import HotelModel from '../models/hotel.model';
import RoomModel from '../models/room.model';
import { defaultHotelProjectile, fullHotelProjectile, generateUID, IPayload, sendPayload } from '../utils/helperFunctions';

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

        const docs = await HotelModel.find({}, defaultHotelProjectile).skip(skipCount).limit(+perPage);

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

router.get("/categories", [...paginateMiddleware], async (req: Request, res: Response) => {
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

        const hotelCategoryDocs = await Promise.all([
            HotelModel
                .find({
                    isFeatured: true
                }, defaultHotelProjectile)
                .skip(skipCount)
                .limit(+perPage),
            HotelModel
                .find({},
                    defaultHotelProjectile)
                .sort({
                    "_id": "descending"
                })
                .skip(skipCount)
                .limit(+perPage),
            HotelModel
                .find({},
                    defaultHotelProjectile)
                .sort({
                    "ratingsAverage": "descending"
                })
                .skip(skipCount)
                .limit(+perPage)
        ]);

        if (hotelCategoryDocs[0].length < 1 || hotelCategoryDocs[1].length < 1 || hotelCategoryDocs[2].length < 1) {
            return res.status(400).json({
                message: "No hotels available"
            });
        }

        const data = [
            {
                category: "featured Hotels",
                data: hotelCategoryDocs[0] ?? []
            },
            {
                category: "topRated Hotels",
                data: hotelCategoryDocs[1] ?? []
            },
            {
                category: "latest Hotels",
                data: hotelCategoryDocs[2] ?? []
            }
        ];

        return res
            .status(200)
            .json({
                data: data.filter(predicate => predicate.data.length >= 1)
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
            role: "HOTEL",
            phone: hotelDoc.phone,
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
        const doc = await HotelModel.findOne({ slug }, fullHotelProjectile);

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
                    data: {
                        ...doc.toJSON(),
                        rooms: roomDocs
                    }
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
            projection: fullHotelProjectile
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
                    data: {
                        ...hotelDoc.toJSON(),
                        rooms: roomDocs
                    }
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

router.post("/photo", [verifyToken, validateToken, checkTokenRoleDB, allowRoleHotel, checkTokenSlugDB, addPhotosMiddleware], async (req: Request, res: Response) => {
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
        }, {
            $push: {
                hotelImages: {
                    $each: req.body.photos
                }
            }
        }, {
            new: true,
            projection: {
                hotelImages: 1
            }
        });

        if (!hotelDoc) {
            return res.status(400).json({
                message: "Hotel Not found"
            });
        }

        return res.status(201).json({
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

router.delete("/photo", [verifyToken, validateToken, checkTokenRoleDB, allowRoleHotel, checkTokenSlugDB, deletePhotosMiddleware], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const token = req.parsedToken;
    const imageRef = req.body.imageRef;

    try {

        const hotelDoc = await HotelModel.findOneAndUpdate({
            slug: token.slug
        }, {
            $pull: {
                hotelImages: {
                    "ref": imageRef
                }
            }
        }, {
            new: true,
            projection: {
                hotelImages: 1
            }
        });

        if (!hotelDoc) {
            return res.status(400).json({
                message: "Hotel Not found"
            });
        }

        return res.status(202).json({
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

            return res.status(200).json({
                message: "Hotel and rooms deleted successfully"
            });
        }

        return res.status(200).json({
            message: "Hotel deleted successfully"
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

router.post("/facility", [verifyToken, validateToken, checkTokenRoleDB, allowRoleHotel, checkTokenSlugDB, facilitiesMiddleware], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const token = req.parsedToken;
    const facilities = req.body.facilities;

    try {
        const hotelDoc = await HotelModel.findOneAndUpdate({
            slug: token.slug
        }, {
            $push: {
                facilities: {
                    $each: facilities
                }
            }
        }, {
            new: true,
            projection: {
                facilities: 1
            }
        });

        if (!hotelDoc) {
            return res.status(400).json({
                message: "Hotel Not found"
            });
        }

        return res.status(201).json({
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

router.delete("/facility", [verifyToken, validateToken, checkTokenRoleDB, allowRoleHotel, checkTokenSlugDB, facilitiesMiddleware], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const token = req.parsedToken;
    const facilities = req.body.facilities;
    try {
        const hotelDoc = await HotelModel.findOneAndUpdate({
            slug: token.slug
        }, {
            $pull: {
                facilities: {
                    label: {
                        $in: facilities
                    }
                }
            }
        }, {
            new: true,
            projection: {
                facilities: 1
            }
        });

        if (!hotelDoc) {
            return res.status(400).json({
                message: "Hotel Not found"
            });
        }

        return res.status(201).json({
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

router.post("/search", async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    try {

        const { name, city, state, country } = req.body;

        // search for hotels with the given name, city, state and country which can be undefined or empty string or null or any other falsy value and return the default hotel projection



        const docs = await HotelModel.find({
            name: {
                $regex: name ?? "",
                $options: "i"
            },
            city: {
                $regex: city ?? "",
                $options: "i"
            },
            state: {
                $regex: state ?? "",
                $options: "i"
            },
            country: {
                $regex: country ?? "",
                $options: "i"
            }
        }, defaultHotelProjectile);

        if (!docs || docs.length < 1) {
            return res.status(400).json({
                message: "Hotel Not found"
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
        }, defaultHotelProjectile
        );

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
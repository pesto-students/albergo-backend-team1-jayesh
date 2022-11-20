import { Request, Response, Router } from "express";
import { validationResult } from "express-validator";
import { allowRoleHotel, checkTokenRoleDB, validateToken, verifyToken } from "../middleware/auth.middleware";
import { checkSlug, checkTokenSlugDB } from "../middleware/hotel.middleware";
import { checkRoomId, createNewRoomMiddleware, updateRoomModel } from "../middleware/room.middleware";
import HotelModel from "../models/hotel.model";
import RoomModel from "../models/room.model";
import { generateUID } from "../utils/helperFunctions";

const router = Router();

router.get('/:slug/', [checkSlug], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const slug = req.params.slug;

    try {

        const hotelDoc = await HotelModel.findOne({
            slug
        }, {
            rooms: 1
        });

        if (!hotelDoc) {
            return res.status(400).json({
                message: "Hotel Not found"
            });
        }

        const hotelRooms = hotelDoc.rooms;

        if (!hotelRooms || (hotelRooms && hotelRooms.length < 1)) {

            return res.status(200).json({
                message: "No rooms available"
            });
        }

        const roomDocs = await RoomModel.find({
            roomId: {
                $in: hotelRooms
            }
        });

        if (!roomDocs || roomDocs.length < 1) {
            return res.status(200).json({
                message: "No rooms available"
            });
        }

        return res.status(200).json({
            data: roomDocs
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

router.post("/", [verifyToken, validateToken, checkTokenRoleDB, allowRoleHotel, checkTokenSlugDB, ...createNewRoomMiddleware], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const parsedToken = req.parsedToken;
    const slug = parsedToken.slug;
    const roomUUID = generateUID(`${req.body.name} ${slug}`, new Date().toString().replaceAll(" ", ""));

    try {
        const hotelDoc = await HotelModel.findOneAndUpdate({
            slug
        }, {
            $push: {
                "rooms": roomUUID
            }
        }, {
            new: true
        });

        if (!hotelDoc) {
            return res.status(400).json({
                message: "Hotel Not found"
            });
        }

        const newRoomDoc = await RoomModel.create(
            {
                ...req.body,
                hotelSlug: slug,
                roomId: roomUUID
            });

        if (!newRoomDoc) {
            return res.status(400).json({
                message: "Could not create new Room"
            });
        }

        const roomDocs = await RoomModel.find({
            roomId: {
                $in: hotelDoc.rooms
            }
        });

        if (!roomDocs || roomDocs.length < 1) {
            return res.status(400).json({
                message: "Rooms Not found. Please try again later"
            });
        }

        return res.status(200).json({
            data: roomDocs
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

router.get("/:roomId", [checkRoomId], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const roomId = req.params.roomId;

    try {
        const roomDoc = await RoomModel.findOne({
            roomId,
        });

        if (!roomDoc) {
            return res.status(400).json({
                message: "Rooms Not found. Please try again later"
            });
        }

        return res.status(200).json({
            data: roomDoc
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

router.patch("/:roomId", [verifyToken, validateToken, checkTokenRoleDB, allowRoleHotel, checkTokenSlugDB, checkRoomId, updateRoomModel], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const parsedToken = req.parsedToken;
    const slug = parsedToken.slug;
    const roomId = req.params.roomId;

    try {
        const roomDoc = await RoomModel.findOneAndUpdate({
            roomId,
            hotelSlug: slug,
        }, {
            ...req.body
        }, {
            new: true
        });

        if (!roomDoc) {
            return res.status(400).json({
                message: "Room Not found. Please try again later"
            });
        }

        return res.status(200).json({
            data: roomDoc
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

router.delete("/:roomId", [verifyToken, validateToken, checkTokenRoleDB, allowRoleHotel, checkTokenSlugDB, checkRoomId, updateRoomModel], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const parsedToken = req.parsedToken;
    const slug = parsedToken.slug;
    const roomId = req.params.roomId;

    try {
        const roomDoc = await RoomModel.findOneAndDelete({
            roomId,
            hotelSlug: slug,
        });

        if (!roomDoc) {
            return res.status(400).json({
                message: "Room Not found. Please try again later"
            });
        }

        const hotelDoc = await HotelModel.findOneAndUpdate({
            slug,
        }, {
            $pullAll: {
                rooms: roomId
            }
        }, {
            new: true
        });

        if (!hotelDoc) {
            return res.status(400).json({
                message: "Hotel Not found. Please try again later"
            });
        }

        const roomDocs = await RoomModel.find({
            roomId: {
                $in: hotelDoc.rooms
            }
        });

        if (!roomDocs || roomDocs.length < 1) {
            return res.status(400).json({
                message: "Rooms Not found. Please try again later"
            });
        }

        return res.status(200).json({
            data: roomDocs
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
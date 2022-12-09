import { Request, Response, Router } from "express";
import { validationResult } from "express-validator";
import { allowRoleUser, checkTokenRoleDB, validateToken, verifyToken } from "../middleware/auth.middleware";
import { checkTokenUuidDB, wishlistIdMiddleware } from "../middleware/user.middleware";
import HotelModel from "../models/hotel.model";
import ReviewModel from "../models/review.model";
import UserModel from "../models/user.model";
import { defaultHotelProjectile } from "../utils/helperFunctions";

const router = Router();

router.get("/me", [verifyToken, validateToken, allowRoleUser, checkTokenRoleDB, checkTokenUuidDB], async (req: Request, res: Response) => {
    const parsedToken = req.parsedToken;
    try {
        const userDoc = await UserModel.findOne({ uuid: parsedToken.uuid }, {
            name: 1,
            bookings: 1,
            email: 1,
            uuid: 1,
            reviews: 1,
            wishlist: 1,
        });

        if (!userDoc) {
            return res.status(400).json({
                message: "Account not found"
            });
        }

        return res.status(200).json({
            data: userDoc
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

router.get("/wishlist", [verifyToken, validateToken, allowRoleUser, checkTokenRoleDB, checkTokenUuidDB], async (req: Request, res: Response) => {
    const parsedToken = req.parsedToken;

    try {

        const userDoc = await UserModel.findOne({
            uuid: parsedToken.uuid
        }, {
            wishlist: 1
        });

        if (!userDoc) {
            return res.status(400).json({
                message: "Account not found"
            });
        }

        const userWishlist = userDoc.wishlist;

        if (!userWishlist || userWishlist.length < 1) {
            return res.status(400).json({
                message: "Account wishlist is empty"
            });
        }

        const hotelDocs = await HotelModel.find({
            slug: {
                $in: userWishlist
            }
        }, defaultHotelProjectile);

        if (!hotelDocs || hotelDocs.length < 1) {
            return res.status(400).json({
                message: "Hotels not found"
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

router.post("/wishlist", [verifyToken, validateToken, allowRoleUser, checkTokenRoleDB, checkTokenUuidDB, ...wishlistIdMiddleware], async (req: Request, res: Response) => {

    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const parsedToken = req.parsedToken;
    const wishlistId = req.body.wishlistId;

    try {

        const userDoc = await UserModel.findOneAndUpdate({ uuid: parsedToken.uuid },
            {
                $push: {
                    "wishlist": wishlistId
                }
            }, {
            new: true,
            projection: {
                wishlist: 1,
            }
        });

        if (!userDoc) {
            return res.status(400).json({
                message: "Account not found"
            });
        }

        return res.status(200).json({
            data: userDoc
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

router.get("/reviews", [verifyToken, validateToken, allowRoleUser, checkTokenRoleDB, checkTokenUuidDB], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const parsedToken = req.parsedToken;

    try {

        const userDoc = await UserModel.findOne({
            uuid: parsedToken.uuid
        }, {
            reviews: 1
        });

        if (!userDoc) {
            return res.status(400).json({
                message: "Account not found"
            });
        }

        const userReviews = userDoc.reviews;

        if (!userReviews || userReviews.length < 1) {
            return res.status(400).json({
                message: "Account wishlist is empty"
            });
        }

        const reviewDocs = await ReviewModel.find({
            "_id": {
                $in: userReviews
            }
        });

        if (!reviewDocs || reviewDocs.length < 1) {
            return res.status(400).json({
                message: "Hotels not found"
            });
        }

        return res.status(200).json({
            data: reviewDocs
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

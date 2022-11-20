import { Request, Response, Router } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import { allowRoleUser, checkTokenRoleDB, validateToken, verifyToken } from "../middleware/auth.middleware";
import { checkSlug, paginateMiddleware } from "../middleware/hotel.middleware";
import { createReviewMiddleware } from "../middleware/review.middleware";
import HotelModel from "../models/hotel.model";
import ReviewModel from "../models/review.model";
import UserModel from "../models/user.model";

const router = Router();

router.get('/:slug', [checkSlug, ...paginateMiddleware], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const slug = req.params.slug;
    const page = req.query.page ?? 1;
    const perPage = req.query.perPage ?? 10;
    const skipCount = +page === 1 ? 0 : (+page - 1) * +perPage;

    try {
        const reviewIDArray = await HotelModel.aggregate([
            {
                $match: {
                    slug
                }
            }
        ]).unwind("reviews")
            .group({
                "_id": "$_id",
                reviews: {
                    $push: "$reviews"
                }
            })
            .project({
                "reviews": {
                    $slice: [
                        "$reviews",
                        skipCount,
                        +perPage
                    ]
                }
            });

        if (!reviewIDArray || reviewIDArray.length < 1) {
            return res.status(400).json({
                message: "No review available"
            });
        }

        let reviewIds = reviewIDArray[0]?.reviews as any[];

        const reviewDocs = await ReviewModel.find({
            '_id': {
                $in: reviewIds
            }
        });

        if (!reviewDocs || reviewDocs.length < 1) {
            return res.status(400).json({
                message: "Reviews not found"
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

router.post('/:slug', [verifyToken, validateToken, checkTokenRoleDB, allowRoleUser, checkSlug, ...createReviewMiddleware], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const parsedToken = req.parsedToken;
    const slug = parsedToken.slug;

    try {

        const reviewDoc = await ReviewModel.create({
            ...req.body,
            hotelSlug: slug,
            userName: parsedToken.name
        });

        if (!reviewDoc) {
            return res.status(400).json({
                message: "Could not create new Review"
            });
        }

        const hotelDoc = await HotelModel.findOneAndUpdate({
            slug
        }, {
            $push: {
                reviews: reviewDoc.id
            }
        }, {
            new: true
        });

        if (!hotelDoc) {
            const deletedReviewDoc = await ReviewModel.findById(reviewDoc.id);

            if (!deletedReviewDoc?.$isDeleted) {
                return res.status(400).json({
                    messgae: "Review not deleted successfully"
                });
            }

            return res.status(400).json({
                message: "Hotel Not found"
            });
        }

        const userDoc = await UserModel.findOneAndUpdate({
            uuid: parsedToken.uuid
        }, {
            $push: {
                reviews: reviewDoc.id
            }
        });

        if (!userDoc) {

            const updatedReviewDoc = await ReviewModel.findByIdAndUpdate(reviewDoc.id, {
                userName: "Anonymous"
            }, {
                new: true
            });

            if (!updatedReviewDoc) {
                return res.status(400).json({
                    message: "Could not create review successfully"
                });
            }

            return res.status(400).json({
                message: "Account not found"
            });
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

export default router;
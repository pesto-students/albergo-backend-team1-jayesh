import { InferSchemaType, Model, model, models, Schema } from "mongoose";
import { Model_Names } from "../utils/constants";

const reviewSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
    },
    hotelSlug: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    }
});

// reviewSchema.statics.calcAverageRatings = async function (hotelSlug: string) {
//     const stats = await this.aggregate([
//         {
//             $match: { hotel: hotelSlug }
//         },
//         {
//             $group: {
//                 _id: '$hotel',
//                 nRating: { $sum: 1 },
//                 avgRating: { $avg: '$rating' }
//             }
//         }
//     ]);

//     if (stats.length > 0) {
//         await HotelModel.findOneAndUpdate({
//             slug: hotelSlug
//         }, {
//             $set: {
//                 ratingsQuantity: stats[0].nRating,
//                 ratingsAverage: stats[0].avgRating
//             }
//         });
//     } else {
//         await HotelModel.findOneAndUpdate({
//             slug: hotelSlug
//         }, {
//             $set: {
//                 ratingsQuantity: 0,
//                 ratingsAverage: 3
//             }
//         });
//     }
// };

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//     this.r = await this.findOne();
//     next();
// });

// reviewSchema.post(/^findOneAnd/, async function () {
//     await this.r.constructor.calcAverageRatings(this.r.hotel);
// });

export type IReviewSchema = InferSchemaType<typeof reviewSchema>;

const ReviewModel: Model<IReviewSchema> = models[Model_Names.reviewModel] || model(Model_Names.reviewModel, reviewSchema, 'reviews');

export default ReviewModel;
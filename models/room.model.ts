import { InferSchemaType, Model, model, models, Schema } from "mongoose";
import { Model_Names } from "../utils/constants";

const roomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    roomId: {
        type: String,
        required: true
    },
    hotelSlug: {
        type: String,
        required: true,
        immutable: true
    },
    price: Number,
    capacity: Number,
    images: {
        type: [String],
        required: true,
    },
    facilities: {
        type: [String],
        required: true
    }
});

// roomSchema.pre(/^find/, function (next) {
//     this.populate('hotel').populate({
//         path: 'hotel',
//         select: 'name'
//     });
//     next();
// });

type IHotelModel = InferSchemaType<typeof roomSchema>;

const RoomModel: Model<IHotelModel> = models[Model_Names.roomModel] || model(Model_Names.roomModel, roomSchema, "rooms");

export default RoomModel;
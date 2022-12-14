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
        type: [{
            link: String,
            ref: String,
        }],
        default: []
    },
    description: JSON,
    quantity: Number,
});

type IRoomModel = InferSchemaType<typeof roomSchema>;

const RoomModel: Model<IRoomModel> = models[Model_Names.roomModel] || model(Model_Names.roomModel, roomSchema, "rooms");

export default RoomModel;
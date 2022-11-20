import { InferSchemaType, Model, model, models, Schema, Types } from "mongoose";
import { Model_Names } from "../utils/constants";

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    uuid: {
        type: String,
        required: true,
        unique: true,
    },
    wishlist: [String],
    bookings: {
        type: [Types.ObjectId],
        default: []
    },
    reviews: {
        type: [Types.ObjectId],
        default: []
    },
    role: {
        type: String,
        default: "USER",
        immutable: true,
        required: true
    }
});

type IUserModel = InferSchemaType<typeof userSchema>;

const UserModel: Model<IUserModel> = models[Model_Names.userModel] || model(Model_Names.userModel, userSchema, 'users');

export default UserModel;
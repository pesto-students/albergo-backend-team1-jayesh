import { InferSchemaType, Model, model, models, Schema, Types } from "mongoose";
import { Model_Names } from "../utils/constants";

const hotelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: Number,
      required: true,
      unique: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    facilities: [String],
    coordinates: {
      long: Number,
      lat: Number
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: [Types.ObjectId],
      default: []
    },
    description: {
      type: String,
      trim: true,
    },
    hotelImages: [String],
    rooms: {
      type: [String],
      default: []
    },
    role: {
      type: String,
      default: "HOTEL",
      immutable: true,
      required: true
    },
    bookings: {
      type: [Types.ObjectId],
      default: []
    }
  }
);

type IHotelModel = InferSchemaType<typeof hotelSchema>;

const HotelModel: Model<IHotelModel> = models[Model_Names.hotelModel] || model(Model_Names.hotelModel, hotelSchema, 'hotels');

export default HotelModel;

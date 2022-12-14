import { Schema, model, models, InferSchemaType, Model } from 'mongoose';
import { Model_Names } from '../utils/constants';

const bookingSchema = new Schema({
    bookingId: {
        type: String,
        required: true
    },
    hotelSlug: {
        type: String,
        required: true
    },
    userUUID: {
        type: String,
        required: true
    },
    room: {
        type: {
            roomName: String,
            roomId: String,
            quantity: Number
        },
        required: true
    },
    checkIn: Date,
    checkOut: Date,
    amount: {
        type: Number,
        required: true
    },
    guest: {
        type: {
            adults: {
                type: Number,
                default: 1
            },
            children: {
                type: Number,
                default: 0
            }
        },
        required: true
    },
    razorpay_payment_id: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    hotelName: {
        type: String,
        required: true
    },
});

type IBookingModel = InferSchemaType<typeof bookingSchema>;

const BookingModel: Model<IBookingModel> = models[Model_Names.bookingModel] || model(Model_Names.bookingModel, bookingSchema, 'bookings');

export default BookingModel;
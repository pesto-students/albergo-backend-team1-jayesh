import { Schema, model, models, InferSchemaType, Model } from 'mongoose';
import { Model_Names } from '../utils/constants';

const bookingSchema = new Schema({
    hotelSlug: {
        type: String,
        required: true
    },
    userUUID: {
        type: String,
        required: true
    },
    rooms: {
        type: [{
            roomId: String,
            quantity: Number
        }],
        required: true
    },
    checkIn: Date,
    checkOut: Date,
    price: {
        type: Number,
        required: true
    },
    guest: {
        type: {
            adults: Number,
            children: Number
        },
        required: true
    },
    razorpay_payment_id: {
        type: String,
        required: true
    }
});

type IBookingModel = InferSchemaType<typeof bookingSchema>;

const BookingModel: Model<IBookingModel> = models[Model_Names.bookingModel] || model(Model_Names.bookingModel, bookingSchema, 'bookings');

export default BookingModel;
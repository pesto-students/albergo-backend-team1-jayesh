import HotelModel from './../models/hotelModel';
import { getOne } from './handlerFactory';

export async function getOverview(req, res) {
    const featuredHotels = await HotelModel.find({ isFeatured: { $eq: true } }).limit(3);

    const topRatedHotels = await HotelModel.find({}).sort({ ratingsAverage: -1 }).limit(3);

    const hotelView = {
        featuredHotels,
        topRatedHotels
    }

    res.status(200).json(hotelView);
}

export const getHotel = getOne(HotelModel);
import HotelModel from './../models/hotelModel';
import { getOne } from './handlerFactory';
const Hotel = require('./../models/hotelModel');
const User = require('./../models/userModel');
const Wishlist = require('./../models/wishlistModel');
const factory = require('./handlerFactory');

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
res.status(200).send(hotelView);
};

exports.getHotelsWithin = async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = (unit === 'mi') ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng)
        next(new AppError('Please provide latitude and longitude in the specified format lat,lng.', 400));

    const hotels = await Hotel.find({
        coordinates: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
        status: 'success',
        results: hotels.length,
        data: {
            data: hotels
        }
    });
};

import HotelModel from "./../models/hotelModel";
import { getOne } from "./handlerFactory";
import UserModel from "./../models/userModel";
import Wishlist from "./../models/wishlistModel";
import factory from "./handlerFactory";

exports.getOverview = async (req, res, next) => {
  const limit = (req.body.limit) ? req.body.limit : 10;
  const featuredHotels = await Hotel.find({ isFeatured: { $eq: true } }).limit(limit);

  const topRatedHotels = await Hotel.find({}).sort({ ratingsAverage: -1 }).limit(limit);

  const latestHotels = await Hotel.find({}).sort({ createdAt: -1 }).limit(limit);

  const hotelView = {
    featuredHotels,
    topRatedHotels,
    latestHotels
  }
  res.status(200).send(hotelView);
};

export const getHotel = getOne(HotelModel);
// res.status(200).send(hotelView);

export async function getHotelsWithin(req, res, next) {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    next(
      new AppError(
        "Please provide latitude and longitude in the specified format lat,lng.",
        400
      )
    );

  const hotels = await HotelModel.find({
    coordinates: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    results: hotels.length,
    data: {
      data: hotels,
    },
  });
}

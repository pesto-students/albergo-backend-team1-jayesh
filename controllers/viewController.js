import HotelModel from "./../models/hotelModel";
import { getOne } from "./handlerFactory";
import UserModel from "./../models/userModel";
import Wishlist from "./../models/wishlistModel";
import factory from "./handlerFactory";

export const getOverview = async (req, res) => {
  try {
    const featuredHotels = await HotelModel.find({
      isFeatured: { $eq: true },
    }).limit(3);

    const topRatedHotels = await HotelModel.find({})
      .sort({ ratingsAverage: -1 })
      .limit(3);

    const hotelView = {
      featuredHotels,
      topRatedHotels,
    };

    res.status(200).json(hotelView);
  } catch (error) {
    return res.status(400).json({
      message: "Please try again later",
    });
  }
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

import { Router } from "express";
import {
  getOverview,
  getHotel,
  getHotelsWithin,
} from "./../controllers/viewController";

const router = Router({ caseSensitive: true });

router.get("/", getOverview);

router.get("/hotel/:id", getHotel);

router
  .route("/hotels-within/:distance/center/:latlng/unit/:unit")
  .get(getHotelsWithin);
// router.post('/hotelsByCoordinates', getHotelsByCoordinates);

export default router;

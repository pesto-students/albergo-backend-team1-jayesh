import {
  createHotel,
  getHotel,
  updateHotel,
  deleteHotel,
  searchByCity,
} from "./../controllers/hotelController";
import { protect, restrictTo } from "./../controllers/authController";
import reviewRouter from "./reviewRoutes";
import { Router } from "express";
import HotelModel from "../models/hotelModel";

const router = Router();

router.use("/:id/reviews", reviewRouter);

router.post("/onboard", async (req, res) => {
  try {
    const doc = await HotelModel.create(req.body);

    const payload = {
      role: "partner",
    };

    sign(
      payload,
      secret,
      {
        expiresIn: "7d",
      },
      (signErr, token) => {
        if (signErr) throw signErr;

        return res.status(201).json({
          token,
        });
      }
    );

    return res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (error) {
    if (error) {
      console.error(error);
      return res.status(400).json({
        error: error ?? "Please try again later",
      });
    }
  }
});

router
  .route("/:id")
  .get(getHotel)
  .patch(protect, restrictTo("Employee"), updateHotel)
  .delete(protect, restrictTo("Employee"), deleteHotel);

router.post("/searchByCity", searchByCity);

export default router;

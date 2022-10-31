import { Router } from "express";
import {
  getAllBookings,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
} from "../controllers/bookingController";
import { protect } from "../controllers/authController";

const router = Router();

router.use(protect);

router.route("/").get(getAllBookings).post(createBooking);

router.route("/:id").get(getBooking).patch(updateBooking).patch(deleteBooking);

export default router;

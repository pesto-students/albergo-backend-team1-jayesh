import { Router } from "express";
import {
  getAllWishlist,
  createWishlist,
  deleteWishlist,
} from "./../controllers/wishlistController";
import { protect } from "./../controllers/authController";
import hotelController from "./../controllers/hotelController";

const router = Router();

router.get("/allWishlist", protect, getAllWishlist);

router.post("/createOne", protect, createWishlist);

router.delete("/deleteOne/:id", protect, deleteWishlist);

export default router;

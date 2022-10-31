import { Router } from "express";

import {
  signup,
  checkEmail,
  login,
  logout,
  protect,
  updatePassword,
  forgetPassword,
  resetPassword,
  isLoggedIn,
} from "../controllers/authController";
import { getMe, getUser } from "../controllers/userController";

const router = Router({
  caseSensitive: true,
});

router.post("/signup", signup);
router.post("/checkEmail", checkEmail);
router.post("/login", login);
router.get("/logout", logout);

router.post("/forgetPassword", forgetPassword);
router.patch("/resetPassword/:token", resetPassword);

router.use(protect);

router.get("/loggedIn", isLoggedIn);

router.patch("/updateMyPassword", updatePassword);
router.get("/me", getMe, getUser);

export default router;

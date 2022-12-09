import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dbConnect } from "../utils/db";
import userRouter from '../routes/user.routes';
import authRouter from "../routes/auth.routes";
import hotelRouter from '../routes/hotel.routes';
import reviewRouter from "../routes/review.routes";
import roomRouter from "../routes/room.routes";
import bookingRouter from "../routes/booking.routes";

dotenv.config({ path: "./.env" });

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

dbConnect();

app.use("/api/auth", authRouter);

app.use("/api/users", userRouter);

app.use("/api/hotel", hotelRouter);

app.use("/api/review", reviewRouter);

app.use("/api/rooms", roomRouter);

app.use("/api/booking", bookingRouter);

app.listen(port, () =>
  console.log(`⚡⚡⚡ - Server listening on - http://localhost:${port}`)
);

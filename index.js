import express, { json, urlencoded } from "express";
import { config } from "dotenv";
import cors from "cors";

import viewRouter from "./routes/viewRoutes";
import userRouter from "./routes/userRoutes";
import hotelRouter from "./routes/hotelRoutes";
import wishlistRouter from "./routes/wishlistRoutes";
import bookingRouter from "./routes/bookingRoutes";
import { dbConnect } from "./utils/db.js";

config({ path: "./.env" });

const app = express();
const port = process.env.PORT || 8080;

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

dbConnect();

app.use("/api/", viewRouter);

app.use("/api/users", userRouter);

app.use("/api/hotel", hotelRouter);

app.use("/api/wishlist", wishlistRouter);

app.use("/api/booking", bookingRouter);

app.listen(port, () =>
  console.log(`⚡⚡⚡ - Server listening on - http://localhost:${port}`)
);

import express, { json, urlencoded } from "express";
import { config } from "dotenv";
import cors from "cors";

const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');
const hotelRouter = require('./routes/hotelRoutes');
const roomRouter = require('./routes/roomRoutes');
const wishlistRouter = require('./routes/wishlistRoutes');
const bookingRouter = require('./routes/bookingRoutes');

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

app.use('/rooms', roomRouter);

app.use('/wishlist', wishlistRouter);

app.listen(port, () =>
  console.log(`⚡⚡⚡ - Server listening on - http://localhost:${port}`)
);

import express, { json, urlencoded } from 'express';
import { config } from 'dotenv';
import cors from "cors";

import viewRouter from './routes/viewRoutes';
import userRouter from './routes/userRoutes';
import hotelRouter from './routes/hotelRoutes';
import { dbConnect } from './utils/db.js';

config({ path: './.env' })

const app = express();
const port = process.env.PORT || 5000;

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

dbConnect();

app.use('/', viewRouter);

app.use('/api/users', userRouter);

app.use('/hotel', hotelRouter);

app.listen(port, () =>
    console.log(`⚡⚡⚡ - Server listening on - http://localhost:${port}`)
);
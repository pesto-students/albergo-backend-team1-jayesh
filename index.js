const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const cors = require('cors');

const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');
const hotelRouter = require('./routes/hotelRoutes');
const roomRouter = require('./routes/roomRoutes');
const wishlistRouter = require('./routes/wishlistRoutes');
const bookingRouter = require('./routes/bookingRoutes');

dotenv.config({ path: './.env' })

var app = express()

// app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true        // Added due a warning in terminal
}).then(() => console.log('DB connection successful!'));

app.use('/', viewRouter);

app.use('/api/users', userRouter);

app.use('/hotel', hotelRouter);

app.use('/rooms', roomRouter);

app.use('/wishlist', wishlistRouter);

app.use('/booking', bookingRouter);

app.listen(process.env.PORT || 8080, () => {
    console.log('listening on port 8080');
});
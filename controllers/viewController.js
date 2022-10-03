const Hotel = require('./../models/hotelModel')


exports.getOverview = async (req, res, next) => {
    const featuredHotels = await Hotel.find({ isFeatured: { $eq: true } }).limit(3);
    // console.log(featuredHotels);
    const topRatedHotels = await Hotel.find({}).sort({ ratingsAverage: -1 }).limit(3);
    // console.log(topRatedHotels);
    // res.status(200).render('overview', {
    //     title: 'All Hotels',
    //     hotels
    // });
    const hotelView = {
        featuredHotels,
        topRatedHotels
    }
    res.status(200).send(hotelView);
}
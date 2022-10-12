import { Router } from 'express';
import { getOverview, getHotel } from './../controllers/viewController';

const router = Router({ caseSensitive: true });

router.get('/', getOverview);
// router.post('/hotelsByCoordinates', viewsController.getHotelsByCoordinates);

router.get('/hotel/:id', getHotel);

export default router;

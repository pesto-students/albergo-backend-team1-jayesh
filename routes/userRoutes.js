import { Router } from 'express';

import { signup, checkEmail, login, logout, protect, updatePassword } from '../controllers/authController';
import { getMe, getUser } from '../controllers/userController';

const router = Router({
    caseSensitive: true
});

router.post('/signup', signup);
router.post('/checkEmail', checkEmail);
router.post('/login', login);
router.get('/logout', logout);

router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getUser);

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.get('/loggedIn', authController.isLoggedIn);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);

export default router;
import { compare, genSalt, hash } from "bcryptjs";
import { Request, Response, Router } from "express";
import { validationResult } from "express-validator";
import { loginValidation, signupValidation } from "../middleware/auth.middleware";
import HotelModel from "../models/hotel.model";
import UserModel from "../models/user.model";
import { generateUID, IPayload, sendPayload } from "../utils/helperFunctions";

const router = Router({
    caseSensitive: true,
});

router.post("/signup", [...signupValidation], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    try {
        const newUser = new UserModel(req.body);

        const salt = await genSalt(10);

        const hashPassword = await hash(newUser.password, salt);

        newUser.password = hashPassword;

        newUser.uuid = generateUID(`${newUser.name} ${newUser.email}`, new Date().toString().replaceAll(" ", ""));

        const userDoc = await newUser.save();

        const payload: IPayload = {
            email: userDoc.email,
            name: userDoc.name,
            uuid: userDoc.uuid,
            role: "USER",
            phone: userDoc.phone
        };

        const token = sendPayload(payload);
        return res.status(200).json({
            data: {
                token
            }
        });

    } catch (error) {
        if (error) {
            console.error(error);
            return res.status(400).json({
                error,
            });
        }
    }
});

router.post("/login", [...loginValidation], async (req: Request, res: Response) => {
    const expressValidatorErrors = validationResult(req);

    if (!expressValidatorErrors.isEmpty()) {
        return res.status(400).json({
            error: expressValidatorErrors.array(),
        });
    }

    const inputEmail = req.body.email;

    try {
        const userDoc = await UserModel.findOne({ email: inputEmail });

        if (userDoc) {
            const passwordIsSame = await compare(req.body.password, userDoc.password);

            if (!passwordIsSame)
                return res.status(400).json({
                    message: "Invalid credentials",
                });

            const payload: IPayload = {
                email: userDoc.email,
                name: userDoc.name,
                uuid: userDoc.uuid,
                role: "USER",
                phone: userDoc.phone
            };

            const token = sendPayload(payload);
            return res.status(200).json({
                data: {
                    token
                }
            });
        }

        const hotelDoc = await HotelModel.findOne({ email: inputEmail });

        if (hotelDoc) {

            const passwordIsSame = await compare(req.body.password, hotelDoc.password);

            if (!passwordIsSame) {
                return res.status(400).json({
                    message: "Invalid credentials",
                });
            }

            const payload: IPayload = {
                email: hotelDoc.email,
                name: hotelDoc.name,
                slug: hotelDoc.slug,
                role: "HOTEL",
                phone: hotelDoc.phone
            };

            const token = sendPayload(payload);
            return res.status(200).json({
                data: {
                    token
                }
            });
        }

        return res.status(400).json({
            message: "Account not found",
        });

    } catch (error) {
        if (error) {
            console.error(error);
            return res.status(400).json({
                error,
            });
        }
    }
});

export default router;
import { body } from "express-validator";

export const createReviewMiddleware = [
    body("content", "content field should be valid")
        .isString()
        .notEmpty(),
    body("rating", "rating should be between 1 and 5")
        .isNumeric()
        .custom((val => { if (val < 1 || val > 5) Promise.reject("rating should be between 1 and 5"); }))
];
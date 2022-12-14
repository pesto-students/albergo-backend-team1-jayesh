import { body, oneOf, param } from "express-validator";

export const createNewRoomMiddleware = [
    body("name", "A valid room name is required")
        .isString()
        .notEmpty()
        .isLength({
            min: 3
        }),
    body("price", "Valid room price is required")
        .isNumeric()
        .optional({
            checkFalsy: true
        }),
    body("capacity", "Valid room capacity is required")
        .isNumeric()
        .optional({
            checkFalsy: true
        }),
    body("description", "Valid room description is required")
        .notEmpty(),
    body("quantity", "Valid room quantity is required").isNumeric().optional({
        checkFalsy: true
    }),
];

export const checkRoomId = param("roomId", "Room id should be a valid param")
    .isAlphanumeric()
    .notEmpty()
    .isLength({
        min: 4
    });

export const updateRoomModel = oneOf([
    body("name", "A valid room name is required")
        .isString()
        .isAlpha()
        .notEmpty()
        .isLength({
            min: 3
        }),
    body("price", "Valid room price is required")
        .isNumeric()
        .optional({
            checkFalsy: true
        }),
    body("capacity", "Valid room capacity is required")
        .isNumeric()
        .optional({
            checkFalsy: true
        }),
    body("images", "Array of links of room images required")
        .isArray()
        .notEmpty(),
]);

export const deleteRoomModel = param("roomId", "Room id should be a valid param").isString().notEmpty().isLength({
    min: 4
});

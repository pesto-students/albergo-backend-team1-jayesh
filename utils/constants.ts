export type ROLE = "USER" | "HOTEL";
export const JWT_SECRET = process.env.JWT_SECRET ?? "SUPER_SECRET_RECIPE";
export const JWT_EXPIRE = process.env.JWT_EXPIRES_IN ?? "7d";
export const Model_Names = {
    userModel: "UserModel",
    hotelModel: "HotelModel",
    reviewModel: "ReviewModel",
    roomModel: "RoomModel",
    bookingModel: "BookingModel"
};
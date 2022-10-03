const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.getUser = async (req, res, next) => {
    let query = User.findById(req.params.id);

    const doc = await query;

    if (!doc) {
        return next(new AppError('No document found with this ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });

};
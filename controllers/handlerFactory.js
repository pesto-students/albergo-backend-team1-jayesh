const AppError = require('./../utils/appError');

// Create
exports.createOne = (Model) => async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
};

// Read
exports.getOne = (Model) => async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
        return next(new AppError('No document found with that ID', 404, res));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
};

// Update
exports.updateOne = (Model) => async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!doc) {
        return next(new AppError('No document found with that ID', 404, res));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
};

// Delete
exports.deleteOne = (Model) => async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError('No document found with that ID', 404, res));
    }
    res.status(204).json({
        status: 'success',
        data: null,
    });
};
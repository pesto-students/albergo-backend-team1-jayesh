const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAll = (Model) => async (req, res, next) => {

    let filter = {};
    if (req.params.hotelId) filter = { hotel: req.params.hotelId };

    const features = new APIFeatures(Model.find(filter), req.query)
        .sort()
        .paginate()
    const doc = await features.query;

    res.status(200).json({
        status: 'success',
        result: doc.length,
        data: {
            data: doc
        }
    });
};

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

    let doc;
    if (Model === 'Hotel')
        doc = await Model.find({ slug: req.params.slug });
    else
        doc = await Model.findById(req.params.id);
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

    let doc;
    if (Model === 'Hotel')
        doc = await Model.findOneAndUpdate({ slug: req.params.slug }, req.body, {
            new: true,
            runValidators: true,
        });
    else
        doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
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
        }
    });
};

// Delete
exports.deleteOne = (Model) => async (req, res, next) => {

    let doc;
    if (Model === 'Hotel')
        doc = await Model.findOneAndDelete({ slug: req.params.slug });
    else
        doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError('No document found with that ID', 404, res));
    }
    res.status(204).json({
        status: 'success',
        data: null,
    });
};
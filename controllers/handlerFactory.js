const AppError = require("./../utils/appError");

exports.getAll = (Model) => async (req, res, next) => {
  const doc = await Model.find();
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
};

// Create
exports.createOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.create(req.body);
    if (doc) {
      return res.status(201).json({
        status: "success",
        data: {
          data: doc,
        },
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Please try again later",
    });
  }
};

// Read
exports.getOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404, res));
    }
    return res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (error) {
    return res.status(400).json({
      message: "Please try again later",
    });
  }
};

// Update
exports.updateOne = (Model) => async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new AppError("No document found with that ID", 404, res));
  }
  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
};

// Delete
exports.deleteOne = (Model) => async (req, res, next) => {
  const doc = await Model.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError("No document found with that ID", 404, res));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
};

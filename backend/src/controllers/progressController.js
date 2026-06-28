const Progress = require("../models/Progress");
const AppError = require("../utils/appError");

// @desc    Create a new progress entry with a photo
// @route   POST /api/progress
// @access  Private
exports.createProgressEntry = async (req, res, next) => {
  try {
    const { notes, skinRating, hairRating } = req.body;

    if (!req.file) {
      return next(new AppError("Please upload a progress photo", 400));
    }

    // Set the photo URL to our local static route
    const photoUrl = `/uploads/${req.file.filename}`;

    const progress = await Progress.create({
      user: req.user._id,
      photoUrl,
      notes: notes || "",
      skinRating: skinRating ? Number(skinRating) : undefined,
      hairRating: hairRating ? Number(hairRating) : undefined,
    });

    res.status(201).json({
      success: true,
      progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all progress entries for the logged in user
// @route   GET /api/progress
// @access  Private
exports.getProgressEntries = async (req, res, next) => {
  try {
    const entries = await Progress.find({ user: req.user._id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      entries,
    });
  } catch (error) {
    next(error);
  }
};

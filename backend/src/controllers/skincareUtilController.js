const aiService = require("../services/aiService");
const AppError = require("../utils/appError");

// @desc    Check safety and benefits of ingredient list
// @route   POST /api/skincare-utils/check-ingredients
// @access  Private
exports.checkIngredients = async (req, res, next) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || typeof ingredients !== "string" || !ingredients.trim()) {
      return next(new AppError("Please provide a valid ingredients text list", 400));
    }

    const analysis = await aiService.checkIngredients(ingredients, "gemini");

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare two products side-by-side
// @route   POST /api/skincare-utils/compare-products
// @access  Private
exports.compareProducts = async (req, res, next) => {
  try {
    const { productA, productB } = req.body;

    if (!productA || !productB) {
      return next(new AppError("Please provide both productA and productB names/details", 400));
    }

    const comparison = await aiService.compareProducts(productA, productB, "gemini");

    res.status(200).json({
      success: true,
      comparison,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Scan and audit ingredients from image
// @route   POST /api/skincare-utils/scan-ingredients
// @access  Private
exports.scanIngredients = async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      return next(new AppError("Please provide a valid base64 image of the ingredients list", 400));
    }

    const analysis = await aiService.scanIngredients(image, "gemini");

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

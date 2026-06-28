const aiService = require("../services/aiService");
const AppError = require("../utils/appError");

exports.analyzeDocument = async (req, res, next) => {
  try {
    const { documentText, query, provider } = req.body;
    if (!documentText || !documentText.trim()) {
      return next(new AppError("Document text is required", 400));
    }
    if (!query || !query.trim()) {
      return next(new AppError("Query is required", 400));
    }

    const analysis = await aiService.analyzeDocument(documentText, query, provider);

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

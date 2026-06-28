const Consultation = require("../models/Consultation");
const User = require("../models/User");
const aiService = require("../services/aiService");
const AppError = require("../utils/appError");

// @desc    Submit a new skin or hair consultation
// @route   POST /api/consultations
// @access  Private
exports.submitConsultation = async (req, res, next) => {
  try {
    const { type, answers } = req.body;

    if (!type || !["skin", "hair"].includes(type)) {
      return next(new AppError("Please specify a valid type (skin or hair)", 400));
    }

    if (!answers || typeof answers !== "object") {
      return next(new AppError("Please provide a valid answers object", 400));
    }

    // 1. Ask Annu 💜 to analyze the answers and recommend products
    const analysisPrompt = `Analyze the following ${type} care questionnaire answers:\n${JSON.stringify(
      answers
    )}\n\nWrite a friendly, caring analysis of their concerns. Then, recommend 3-4 products. Remember to display the following details for every recommended product:\n- Name\n- Brand\n- Price\n- Key Ingredients\n- Benefits\n- Why Recommended\n- Usage\n- Buying Links\n\nFormat the response as a clean, beautiful markdown document.`;

    const activeProvider = req.user.settings?.defaultProvider || "gemini";
    const analysisText = await aiService.generateResponse(analysisPrompt, [], activeProvider);

    // 2. Ask Annu 💜 to generate a structured JSON routine
    let recommendedRoutine = [];
    try {
      recommendedRoutine = await aiService.generateRoutine(type, answers, activeProvider);
    } catch (err) {
      console.warn("⚠️ Failed to generate structured routine JSON. Falling back to empty routine.");
    }

    // 3. Extract profile details to update the User document
    const updateData = {};
    if (type === "skin") {
      updateData["skinProfile.skinType"] = answers.skinType || "unknown";
      updateData["skinProfile.concerns"] = answers.concerns || [];
    } else {
      updateData["hairProfile.hairType"] = answers.hairType || "unknown";
      updateData["hairProfile.scalpType"] = answers.scalpType || "unknown";
      updateData["hairProfile.concerns"] = answers.concerns || [];
    }

    await User.findByIdAndUpdate(req.user._id, updateData);

    // 4. Save the consultation in the database
    const consultation = await Consultation.create({
      user: req.user._id,
      type,
      answers,
      analysis: analysisText,
      recommendedRoutine,
      recommendedProducts: [], // Products are detailed inside the markdown analysis text
    });

    res.status(201).json({
      success: true,
      consultation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all consultation history for the logged in user
// @route   GET /api/consultations
// @access  Private
exports.getConsultationHistory = async (req, res, next) => {
  try {
    const consultations = await Consultation.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      consultations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the latest consultation for the logged in user
// @route   GET /api/consultations/latest
// @access  Private
exports.getLatestConsultation = async (req, res, next) => {
  try {
    const consultation = await Consultation.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    if (!consultation) {
      return res.status(200).json({
        success: true,
        consultation: null,
      });
    }

    res.status(200).json({
      success: true,
      consultation,
    });
  } catch (error) {
    next(error);
  }
};

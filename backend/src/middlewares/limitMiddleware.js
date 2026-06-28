const AppError = require("../utils/appError");

// Checks if a free user has reached their monthly message quota
const checkUsageLimit = async (req, res, next) => {
  try {
    const user = req.user;
    const plan = user.subscription?.plan || "free";
    const status = user.subscription?.status || "inactive";

    // Admins bypass all limits
    if (user.role === "admin") {
      return next();
    }

    // Free tier limit (e.g., 20 messages)
    if (plan === "free" || status !== "active") {
      const freeLimit = 20;
      if (user.usage?.aiMessagesCount >= freeLimit) {
        return next(
          new AppError(
            "You have reached your limit of 20 free AI messages. Please upgrade to Pro for unlimited messaging.",
            403
          )
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Restricts access to premium endpoints (e.g., OpenAI models, Document Analyzer)
const restrictToPremium = (req, res, next) => {
  const plan = req.user.subscription?.plan || "free";
  const status = req.user.subscription?.status || "inactive";

  if (req.user.role === "admin") {
    return next();
  }

  if (plan === "free" || status !== "active") {
    return next(
      new AppError(
        "This is a premium feature. Please upgrade your subscription to access it.",
        403
      )
    );
  }
  next();
};

module.exports = {
  checkUsageLimit,
  restrictToPremium,
};

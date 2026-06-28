const AppError = require("../utils/appError");

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError("Name is required", 400));
  }

  if (!email || !email.trim()) {
    return next(new AppError("Email is required", 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError("Please provide a valid email address", 400));
  }

  if (!password || password.length < 6) {
    return next(new AppError("Password must be at least 6 characters long", 400));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return next(new AppError("Email is required", 400));
  }

  if (!password) {
    return next(new AppError("Password is required", 400));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};

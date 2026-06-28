const Reminder = require("../models/Reminder");
const AppError = require("../utils/appError");

exports.createReminder = async (req, res, next) => {
  try {
    const { title, remindAt } = req.body;
    const reminder = await Reminder.create({
      user: req.user._id,
      title,
      remindAt,
    });
    res.status(201).json({ success: true, reminder });
  } catch (error) {
    next(error);
  }
};

exports.getUserReminders = async (req, res, next) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({ remindAt: 1 });
    res.status(200).json({ success: true, reminders });
  } catch (error) {
    next(error);
  }
};

exports.updateReminder = async (req, res, next) => {
  try {
    const { title, remindAt, isCompleted } = req.body;
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, remindAt, isCompleted },
      { new: true, runValidators: true }
    );
    if (!reminder) return next(new AppError("Reminder not found", 404));
    res.status(200).json({ success: true, reminder });
  } catch (error) {
    next(error);
  }
};

exports.deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!reminder) return next(new AppError("Reminder not found", 404));
    res.status(200).json({ success: true, message: "Reminder deleted successfully" });
  } catch (error) {
    next(error);
  }
};

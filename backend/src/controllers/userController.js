const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Note = require("../models/Note");
const Task = require("../models/Task");
const Reminder = require("../models/Reminder");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/appError");

// @desc    Update user profile details (name, email, avatar, theme, settings)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar, theme, settings } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // If email is being changed, verify uniqueness
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return next(new AppError("Email is already in use", 400));
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (theme) user.theme = theme;
    if (settings) {
      user.settings = { ...user.settings, ...settings };
    }

    await user.save();

    // Exclude password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError("Please provide current and new passwords", 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError("New password must be at least 6 characters long", 400));
    }

    // Fetch user with password
    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(new AppError("Incorrect current password", 401));
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get usage analytics for the user
// @route   GET /api/users/analytics
// @access  Private
exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Chats and Messages count
    const totalChats = await Chat.countDocuments({ user: userId });
    const userChats = await Chat.find({ user: userId }).select("_id");
    const chatIds = userChats.map((chat) => chat._id);
    const totalMessages = await Message.countDocuments({ chat: { $in: chatIds } });

    // 2. Notes count
    const totalNotes = await Note.countDocuments({ user: userId, isArchived: false });
    const archivedNotes = await Note.countDocuments({ user: userId, isArchived: true });

    // 3. Tasks count
    const pendingTasks = await Task.countDocuments({ user: userId, status: { $ne: "completed" } });
    const completedTasks = await Task.countDocuments({ user: userId, status: "completed" });
    const totalTasks = pendingTasks + completedTasks;

    // 4. Reminders count
    const pendingReminders = await Reminder.countDocuments({ user: userId, isCompleted: false });
    const completedReminders = await Reminder.countDocuments({ user: userId, isCompleted: true });

    res.status(200).json({
      success: true,
      analytics: {
        aiChat: {
          totalChats,
          totalMessages,
        },
        notes: {
          active: totalNotes,
          archived: archivedNotes,
          total: totalNotes + archivedNotes,
        },
        tasks: {
          total: totalTasks,
          pending: pendingTasks,
          completed: completedTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        reminders: {
          pending: pendingReminders,
          completed: completedReminders,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

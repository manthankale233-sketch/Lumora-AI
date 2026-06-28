const express = require("express");
const router = express.Router();
const reminderController = require("../controllers/reminderController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.route("/")
  .get(reminderController.getUserReminders)
  .post(reminderController.createReminder);

router.route("/:id")
  .put(reminderController.updateReminder)
  .delete(reminderController.deleteReminder);

module.exports = router;

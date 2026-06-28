const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.route("/")
  .get(taskController.getUserTasks)
  .post(taskController.createTask);

router.route("/:id")
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;

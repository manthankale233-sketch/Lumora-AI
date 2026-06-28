const express = require("express");
const router = express.Router();
const {
  createChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  renameChat,
  deleteChat,
} = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");
const { checkUsageLimit } = require("../middlewares/limitMiddleware");

// All routes are protected
router.use(protect);

router.route("/")
  .post(createChat)
  .get(getUserChats);

router.route("/:id")
  .patch(renameChat)
  .delete(deleteChat);

router.route("/:id/messages")
  .get(getChatMessages)
  .post(checkUsageLimit, sendMessage);

module.exports = router;

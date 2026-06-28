const express = require("express");
const progressController = require("../controllers/progressController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// All progress routes require authentication
router.use(protect);

router
  .route("/")
  .post(upload.single("photo"), progressController.createProgressEntry)
  .get(progressController.getProgressEntries);

module.exports = router;

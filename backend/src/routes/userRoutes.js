const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

// All routes are protected
router.use(protect);

router.put("/profile", userController.updateProfile);
router.put("/change-password", userController.changePassword);
router.get("/analytics", userController.getAnalytics);

module.exports = router;
